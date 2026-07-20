#!/usr/bin/env node

/**
 * Minimal local JSON API for the Dawn CV mobile app (packages/mobile).
 *
 * Usage:
 *   node scripts/serve-api.js
 *
 * Endpoints (all JSON, CORS-enabled):
 *   GET  /profile   -> contents of base-info.json
 *   PUT  /profile   -> validate + write base-info.json AND data/base-info.json
 *   POST /generate  -> body {sector?} -> generate CV, evaluate quality, make PDF
 *   GET  /history   -> output/*.md and *.pdf with modification times, newest first
 *
 * No dependencies — plain node:http. Only files inside the repo are ever
 * read or written, and no client-supplied path ever reaches the filesystem.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'output');
const BASE_INFO = path.join(ROOT, 'base-info.json');
const BASE_INFO_SYNC = path.join(ROOT, 'data', 'base-info.json');
const SCORES_FILE = path.join(OUTPUT_DIR, '.scores.json');

const PORT = 4100;
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB
const GENERATE_TIMEOUT_MS = 120_000;
const ALLOWED_SECTORS = new Set(['healthcare', 'federal', 'tech', 'private']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

/** Read the request body, rejecting anything over MAX_BODY_BYTES. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body too large (limit is 1 MB).'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => reject(Object.assign(new Error('Could not read request body.'), { status: 400 })));
  });
}

/**
 * Run a node script (inside the repo) as a child process.
 * Resolves {code, stdout} — never exposes stderr/stack to clients.
 */
function runStep(label, scriptRelPath, args, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, scriptRelPath), ...args], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      reject(Object.assign(new Error(`Step "${label}" took too long and was stopped.`), { status: 504 }));
    }, Math.max(1000, timeoutMs));

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', () => {}); // drain, never forwarded to clients

    child.on('error', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(Object.assign(new Error(`Step "${label}" could not be started.`), { status: 500 }));
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout });
    });
  });
}

/** Newest file in output/ matching the extension. Returns absolute path or null. */
function newestOutputFile(ext) {
  if (!fs.existsSync(OUTPUT_DIR)) return null;
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(ext) && !f.startsWith('.'))
    .map((f) => {
      const full = path.join(OUTPUT_DIR, f);
      return { full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return files.length > 0 ? files[0].full : null;
}

/** Parse "Something Score:   85/100" lines from the evaluator's stdout. */
function parseScores(stdout) {
  const scores = {};
  const re = /([A-Za-z][A-Za-z ]*?(?:Score|Compliance|Density)):\s*(\d{1,3})\s*\/\s*100/g;
  let m;
  while ((m = re.exec(stdout)) !== null) {
    const label = m[1].trim();
    scores[label] = Number(m[2]);
  }
  return scores;
}

function loadScoresIndex() {
  try {
    return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveScoresIndex(index) {
  try {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(SCORES_FILE, JSON.stringify(index, null, 2), 'utf8');
  } catch {
    // non-fatal — history just won't show scores
  }
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

function handleGetProfile(res) {
  const raw = fs.readFileSync(BASE_INFO, 'utf8');
  const profile = JSON.parse(raw);
  sendJson(res, 200, profile);
}

async function handlePutProfile(req, res) {
  const body = await readBody(req);
  let profile;
  try {
    profile = JSON.parse(body);
  } catch {
    sendJson(res, 400, { error: 'The profile data was not valid JSON.' });
    return;
  }
  if (
    profile === null ||
    typeof profile !== 'object' ||
    Array.isArray(profile) ||
    typeof profile.personalInfo !== 'object' ||
    profile.personalInfo === null
  ) {
    sendJson(res, 400, { error: 'The profile is missing its personal information section.' });
    return;
  }

  const serialized = JSON.stringify(profile, null, 2) + '\n';
  fs.writeFileSync(BASE_INFO, serialized, 'utf8');
  fs.mkdirSync(path.dirname(BASE_INFO_SYNC), { recursive: true });
  fs.writeFileSync(BASE_INFO_SYNC, serialized, 'utf8'); // keep the synced copy in step
  sendJson(res, 200, { ok: true });
}

let generateInFlight = false;

async function handleGenerate(req, res) {
  if (generateInFlight) {
    sendJson(res, 409, { error: 'A CV is already being generated — please wait for it to finish.' });
    return;
  }

  const body = await readBody(req);
  let sector;
  if (body && body.trim().length > 0) {
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      sendJson(res, 400, { error: 'The request was not valid JSON.' });
      return;
    }
    if (parsed && typeof parsed === 'object' && parsed.sector !== undefined && parsed.sector !== null) {
      if (typeof parsed.sector !== 'string' || !ALLOWED_SECTORS.has(parsed.sector)) {
        sendJson(res, 400, {
          error: 'Please pick one of: healthcare, federal, tech, private.',
        });
        return;
      }
      sector = parsed.sector;
    }
  }

  generateInFlight = true;
  const deadline = Date.now() + GENERATE_TIMEOUT_MS;
  const remaining = () => deadline - Date.now();

  try {
    // 1. Generate the CV markdown.
    const genArgs = ['--profile', 'dawn'];
    if (sector) genArgs.push('--template', sector);
    const gen = await runStep('generate', 'scripts/generate-cv.js', genArgs, remaining());
    if (gen.code !== 0) {
      sendJson(res, 500, { error: 'CV generation did not finish successfully. Please try again.' });
      return;
    }

    const markdownPath = newestOutputFile('.md');
    if (!markdownPath) {
      sendJson(res, 500, { error: 'The CV file was not created. Please try again.' });
      return;
    }

    // 2. Evaluate quality (the evaluator exits 1 when the score is below its
    //    threshold — that is still a valid result, not a failure).
    const evalStep = await runStep(
      'evaluate',
      'scripts/evaluate-cv-quality.js',
      [markdownPath],
      remaining()
    );
    const scores = parseScores(evalStep.stdout);

    // 3. Make the PDF.
    await runStep('pdf', 'scripts/generate-pdf-simple.js', [markdownPath], remaining());
    const expectedPdf = markdownPath.replace(/\.md$/, '.pdf');
    const pdfExists = fs.existsSync(expectedPdf);

    // Remember scores for the history list.
    const index = loadScoresIndex();
    const overall =
      scores['Overall Score'] ?? scores['Overall'] ?? Object.values(scores).slice(-1)[0];
    if (typeof overall === 'number') {
      index[path.basename(markdownPath)] = overall;
      if (pdfExists) index[path.basename(expectedPdf)] = overall;
      saveScoresIndex(index);
    }

    sendJson(res, 200, {
      markdown: path.relative(ROOT, markdownPath),
      pdf: pdfExists ? path.relative(ROOT, expectedPdf) : null,
      scores,
      note: pdfExists
        ? `Files are in the "output" folder of the project on your computer.`
        : `The PDF could not be made automatically; the CV draft (markdown) is in the "output" folder.`,
    });
  } finally {
    generateInFlight = false;
  }
}

function handleHistory(res) {
  const scoresIndex = loadScoresIndex();
  const items = !fs.existsSync(OUTPUT_DIR)
    ? []
    : fs
        .readdirSync(OUTPUT_DIR)
        .filter((f) => (f.endsWith('.md') || f.endsWith('.pdf')) && !f.startsWith('.'))
        .map((f) => {
          const stat = fs.statSync(path.join(OUTPUT_DIR, f));
          const item = {
            file: f,
            type: f.endsWith('.pdf') ? 'pdf' : 'markdown',
            modified: stat.mtime.toISOString(),
            size: stat.size,
          };
          if (typeof scoresIndex[f] === 'number') item.overallScore = scoresIndex[f];
          return item;
        })
        .sort((a, b) => (a.modified < b.modified ? 1 : -1));
  sendJson(res, 200, items);
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const route = `${req.method} ${url.pathname}`;

  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    switch (route) {
      case 'GET /':
        sendJson(res, 200, { ok: true, service: 'dawn-cv-api' });
        return;
      case 'GET /profile':
        handleGetProfile(res);
        return;
      case 'PUT /profile':
        await handlePutProfile(req, res);
        return;
      case 'POST /generate':
        await handleGenerate(req, res);
        return;
      case 'GET /history':
        handleHistory(res);
        return;
      default:
        sendJson(res, 404, { error: 'Not found.' });
    }
  } catch (err) {
    // Sanitized: message only, never a stack trace or internal paths.
    const status = err && typeof err.status === 'number' ? err.status : 500;
    const message =
      err && typeof err.status === 'number' && err.message
        ? err.message
        : 'Something went wrong on the server. Please try again.';
    if (!res.headersSent) {
      sendJson(res, status, { error: message });
    } else {
      res.end();
    }
  }
});

server.listen(PORT, () => {
  console.log(`Dawn CV helper API listening on http://localhost:${PORT}`);
  console.log('Endpoints: GET /profile, PUT /profile, POST /generate, GET /history');
});
