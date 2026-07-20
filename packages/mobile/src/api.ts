/**
 * Tiny fetch wrapper for the local Dawn CV helper API (scripts/serve-api.js).
 *
 * The API address can be changed in app.json under expo.extra.apiBase —
 * when running on a phone, set it to your computer's LAN IP,
 * e.g. "http://192.168.1.20:4100".
 */
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

export const API_BASE: string =
  typeof extra.apiBase === 'string' && extra.apiBase.length > 0
    ? (extra.apiBase as string).replace(/\/$/, '')
    : 'http://localhost:4100';

export interface Profile {
  personalInfo: {
    name?: { full?: string; preferred?: string };
    contact?: { email?: string; phone?: string; address?: string };
    [key: string]: unknown;
  };
  professionalSummary?: string;
  meta?: { reviewNeeded?: string[]; [key: string]: unknown };
  [key: string]: unknown;
}

export interface GenerateResult {
  markdown: string;
  pdf: string | null;
  scores: Record<string, number>;
  note?: string;
}

export interface HistoryItem {
  file: string;
  type: 'markdown' | 'pdf';
  modified: string;
  size: number;
  overallScore?: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error(
      'Could not reach the CV helper on your computer. ' +
        'Make sure it is running (node scripts/serve-api.js) and that this app ' +
        `is pointed at the right address (currently ${API_BASE}).`
    );
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { error?: string };
      if (body && typeof body.error === 'string') detail = body.error;
    } catch {
      // ignore — fall through to generic message
    }
    throw new Error(
      detail || 'Something went wrong on the computer side. Please try again in a moment.'
    );
  }

  return (await res.json()) as T;
}

export function getProfile(): Promise<Profile> {
  return request<Profile>('/profile');
}

export function saveProfile(profile: Profile): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}

export function generateCV(sector?: string): Promise<GenerateResult> {
  return request<GenerateResult>('/generate', {
    method: 'POST',
    body: JSON.stringify(sector ? { sector } : {}),
  });
}

export function getHistory(): Promise<HistoryItem[]> {
  return request<HistoryItem[]>('/history');
}
