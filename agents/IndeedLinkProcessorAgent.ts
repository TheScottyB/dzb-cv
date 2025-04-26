/**
 * IndeedLinkProcessorAgent: Decodes and extracts structured information from Indeed job listing URLs.
 * Handles Indeed's specific URL format, base64/compressed data, and provides parsed job details.
 *
 * TODO: Rate limiting, caching, job detail enrichment, error handling.
 */

import { Buffer } from 'buffer';
import { gunzipSync, inflateSync } from 'zlib';

interface IndeedLinkProcessorOptions {
  registry: Record<string, any>;
  messageBus: any;
}

interface JobInfo {
  title?: string;
  company?: string;
  location?: string;
  details?: Record<string, any>;
  rawData?: any;
}

export class IndeedLinkProcessorAgent {
  private registry: Record<string, any>;
  private messageBus: any;
  private logPrefix: string;
  private currentJobInfo: JobInfo | null = null;

  constructor(options: IndeedLinkProcessorOptions) {
    this.registry = options.registry;
    this.messageBus = options.messageBus;
    this.logPrefix = '[IndeedLinkProcessorAgent]';
    console.info(`${this.logPrefix} Initialized.`, options);

    // Listen for URL processing requests from other agents
    this.messageBus?.subscribe('indeed:processLink', (request) => this.processLink(request.url));
  }

  /**
   * Process an Indeed job URL to extract meaningful information.
   * Handles special Indeed URL formats and encoded data.
   */
  processLink(url: string): JobInfo {
    console.info(`${this.logPrefix} Processing Indeed URL:`, url);
    
    try {
      // Extract the encoded data portion from the URL
      // Indeed URLs typically have a format like:
      // https://cts.indeed.com/v3/[base64_gzip_data]/[tracking_id]
      const matches = url.match(/cts\.indeed\.com\/v\d+\/([^\/]+)/);
      
      if (!matches || !matches[1]) {
        console.warn(`${this.logPrefix} Invalid or unrecognized Indeed URL format`);
        return { rawData: url };
      }

      const encodedData = matches[1];
      const jobData = this.parseCompressedData(encodedData);
      
      // Store the result and notify subscribers
      this.currentJobInfo = jobData;
      
      if (this.messageBus) {
        this.messageBus.publish('indeed:jobInfoExtracted', jobData);
      }
      
      return jobData;
    } catch (error) {
      console.error(`${this.logPrefix} Error processing Indeed URL:`, error);
      return { 
        rawData: url,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parse Indeed's compressed/encoded data format into structured information.
   * Handles various encoding formats including base64, URL-encoded, and gzipped data.
   */
  parseCompressedData(data: string): JobInfo {
    try {
      console.info(`${this.logPrefix} Processing data of length: ${data.length}`);
      
      // Step 1: Fix base64url format (Indeed uses base64url format with _ and - instead of / and +)
      let base64Fixed = data
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/\./g, '=');
      
      // Add padding if needed
      while (base64Fixed.length % 4) {
        base64Fixed += '=';
      }
      
      console.info(`${this.logPrefix} Fixed base64url format, now length: ${base64Fixed.length}`);
      
      // Step 2: Handle URL-encoding if present
      let urlDecoded = base64Fixed;
      try {
        // Try URL-decoding if there are escaped characters
        if (base64Fixed.includes('%')) {
          urlDecoded = decodeURIComponent(base64Fixed);
          console.info(`${this.logPrefix} URL-decoded data, new length: ${urlDecoded.length}`);
        }
      } catch (e) {
        console.info(`${this.logPrefix} URL-decoding failed, proceeding with fixed base64`);
      }
      
      // Step 3: Handle base64 decoding
      let decodedBase64;
      try {
        // Now try decoding with the fixed base64 format
        decodedBase64 = Buffer.from(urlDecoded, 'base64');
        console.info(`${this.logPrefix} Base64 decoded to buffer of length: ${decodedBase64.length}`);
      } catch (e) {
        console.warn(`${this.logPrefix} Base64 decoding failed:`, e);
        // If base64 decoding fails completely, try using data directly
        return this.extractJobInfo({ rawContent: data, error: "Base64 decoding failed" });
      }
      
      // Step 4: Try multiple decompression approaches (Indeed often uses gzip)
      let decompressed;
      let decompressionMethod = 'none';
      
      // Check if the data starts with the gzip magic number (1F 8B)
      const isGzipped = decodedBase64.length > 2 && 
                       decodedBase64[0] === 0x1F && 
                       decodedBase64[1] === 0x8B;
        
      if (isGzipped) {
        try {
          // Try gzip decompression first for gzipped data
          decompressed = gunzipSync(decodedBase64).toString('utf-8');
          decompressionMethod = 'gzip';
          console.info(`${this.logPrefix} Successfully gzip-decompressed to: ${decompressed.length} chars`);
        } catch (gzipErr) {
          console.warn(`${this.logPrefix} Gzip decompression failed despite magic number:`, gzipErr.message);
          
          // Try inflate as a fallback (some Indeed URLs use deflate instead of gzip)
          try {
            decompressed = inflateSync(decodedBase64).toString('utf-8');
            decompressionMethod = 'inflate';
            console.info(`${this.logPrefix} Successfully inflate-decompressed to: ${decompressed.length} chars`);
          } catch (inflateErr) {
            // Try the raw data as a last resort
            console.warn(`${this.logPrefix} Inflate decompression failed:`, inflateErr.message);
            decompressed = this.tryDecodeAsText(decodedBase64);
          }
        }
      } else {
        // If not gzipped, try direct text conversion
        decompressed = this.tryDecodeAsText(decodedBase64);
      }

      // Step 4: Try to parse JSON (very common in Indeed URLs)
      let parsedData: any = { _raw: decompressed.substring(0, 100) + '...' };
      try {
        // Try to parse as JSON
        if (decompressed.trim().startsWith('{') || decompressed.trim().startsWith('[')) {
          parsedData = JSON.parse(decompressed);
          console.info(`${this.logPrefix} Successfully parsed JSON with keys:`, Object.keys(parsedData));
        } else if (decompressed.includes('job') || decompressed.includes('title')) {
          // If not valid JSON but contains useful keywords, try to extract structured data
          const jobMatches = decompressed.match(/job["\s:]+([^"]+)/gi);
          const titleMatches = decompressed.match(/title["\s:]+([^"]+)/gi);
          const locationMatches = decompressed.match(/location["\s:]+([^"]+)/gi);
          
          if (jobMatches || titleMatches || locationMatches) {
            parsedData = {
              _extractedMatches: true,
              job: jobMatches ? jobMatches[0].split(/["\s:]+/)[1] : undefined,
              title: titleMatches ? titleMatches[0].split(/["\s:]+/)[1] : undefined,
              location: locationMatches ? locationMatches[0].split(/["\s:]+/)[1] : undefined
            };
            console.info(`${this.logPrefix} Extracted matches from text:`, parsedData);
          } else {
            // Just use the decompressed text directly
            parsedData = { content: decompressed };
          }
        }
      } catch (jsonErr) {
        console.warn(`${this.logPrefix} JSON parsing failed:`, jsonErr);
        parsedData._parseError = jsonErr.message;
        
        // Try some fallback extraction for non-JSON data
        if (decompressed.length > 20) {
          // Look for patterns that might be job information
          const keywordMatches = this.extractKeywordMatches(decompressed);
          if (Object.keys(keywordMatches).length > 0) {
            parsedData = { ...parsedData, ...keywordMatches };
            console.info(`${this.logPrefix} Extracted using keyword matching:`, keywordMatches);
          }
        }
      }

      // Final step: Extract structured job information
      const jobInfo = this.extractJobInfo(parsedData);
      jobInfo._decompressionMethod = decompressionMethod;
      
      return jobInfo;
    } catch (error) {
      console.error(`${this.logPrefix} Error parsing data:`, error);
      return {
        rawData: data.substring(0, 100) + '...',
        error: error instanceof Error ? error.message : 'Unknown error',
        _attemptedParsing: true
      };
    }
  }

  /**
   * Helper method to try decoding buffer data as text using various encodings
   */
  private tryDecodeAsText(buffer: Buffer): string {
    // Try different decodings until one works
    const encodings = ['utf-8', 'latin1', 'ascii'];
    
    for (const encoding of encodings) {
      try {
        const result = buffer.toString(encoding as BufferEncoding);
        console.info(`${this.logPrefix} Successfully decoded as ${encoding}: ${result.length} chars`);
        return result;
      } catch (err) {
        console.warn(`${this.logPrefix} Failed to decode as ${encoding}:`, err.message);
      }
    }
    
    // Last resort: convert raw bytes to characters
    const rawResult = Array.from(buffer).map(b => String.fromCharCode(b)).join('');
    console.info(`${this.logPrefix} Converted raw bytes to chars: ${rawResult.length} chars`);
    return rawResult;
  }

  /**
   * Helper method to extract information from text using keyword matching.
   * Used as a fallback when structured parsing fails.
   */
  private extractKeywordMatches(text: string): Record<string, string> {
    const result: Record<string, string> = {};
    
    // Common patterns in job listings - trying multiple variations for each field
    const patterns = [
      // Job title patterns
      { key: 'title', regex: /job\s*title[:\s]+([^,\n.;]+)/i },
      { key: 'title', regex: /position[:\s]+([^,\n.;]+)/i },
      { key: 'title', regex: /\btitle[:\s]+([^,\n.;]+)/i },
      
      // Company patterns
      { key: 'company', regex: /company\s*name[:\s]+([^,\n.;]+)/i },
      { key: 'company', regex: /company[:\s]+([^,\n.;]+)/i },
      { key: 'company', regex: /employer[:\s]+([^,\n.;]+)/i },
      
      // Location patterns
      { key: 'location', regex: /job\s*location[:\s]+([^,\n.;]+)/i },
      { key: 'location', regex: /location[:\s]+([^,\n.;]+)/i },
      { key: 'location', regex: /city,?\s*state[:\s]+([^,\n.;]+)/i },
      
      // Salary patterns
      { key: 'salary', regex: /salary[:\s]+([^,\n.;]+)/i },
      { key: 'salary', regex: /compensation[:\s]+([^,\n.;]+)/i },
      { key: 'salary', regex: /pay[:\s]+([^,\n.;]+)/i },
      
      // Job type patterns
      { key: 'jobType', regex: /(full[ -]time|part[ -]time|contract|temporary|freelance|permanent)/i },
      { key: 'jobType', regex: /employment\s*type[:\s]+([^,\n.;]+)/i },
      { key: 'jobType', regex: /job\s*type[:\s]+([^,\n.;]+)/i },
    ];
    
    patterns.forEach(pattern => {
      const match = text.match(pattern.regex);
      if (match && match[1]) {
        result[pattern.key] = match[1].trim();
      }
    });
    
    return result;
  }
  /**
  /**
   * Extract structured job information from parsed data.
   * This is a best-effort extraction based on expected Indeed data structure.
   */
  extractJobInfo(data: any): JobInfo {
    // Default empty job info
    const jobInfo: JobInfo = {
      rawData: data
    };
    
    // Indeed data is often nested, try to extract common fields
    if (typeof data === 'object' && data !== null) {
      // Try different potential paths where job title might be
      jobInfo.title = data.title || data.jobTitle || data.position || 
                     (data.job && data.job.title) || 
                     (data.posting && data.posting.title) ||
                     (data.jobPosting && data.jobPosting.title) ||
                     (data.result && data.result.title) ||
                     data._extractedTitle; // From our keyword extraction
                     
      // Extract company info
      jobInfo.company = data.company || data.companyName || data.employer ||
                      (data.job && data.job.company) ||
                      (data.posting && data.posting.company) ||
                      (data.jobPosting && data.jobPosting.company) ||
                      (data.result && data.result.company);
      
      // Extract location
      jobInfo.location = data.location || data.jobLocation || 
                      (data.job && data.job.location) ||
                      (data.posting && data.posting.location) ||
                      (data.jobPosting && data.jobPosting.location) ||
                      (data.result && data.result.location);
      
      // Create a structured details object with any additional useful fields
      jobInfo.details = {
        // Extract any other useful fields
        salary: data.salary || 
                (data.job && data.job.salary) ||
                (data.posting && data.posting.salary) ||
                (data.compensation),
        
        jobType: data.jobType || 
                 data.employmentType || 
                 (data.job && data.job.type) ||
                 (data.posting && data.posting.employmentType),
        
        description: data.description || 
                    data.jobDescription || 
                    (data.job && data.job.description) ||
                    (data.posting && data.posting.description),
        
        // Store any other potentially useful information
        source: "indeed",
        extractionMethod: data._decompressionMethod || "unknown"
      };
    } else if (typeof data === 'string') {
      // If data is a string, store in title and try to infer other fields
      jobInfo.title = data;
      // Could also attempt to parse text for company/location, but likely low quality
    }
    
    // Normalize data - in case any fields have unparseable characters
    if (jobInfo.title) {
      try {
        jobInfo.title = jobInfo.title.toString().trim();
        // Remove any control characters that might have survived decompression/parsing
        jobInfo.title = jobInfo.title.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      } catch (e) {
        // If title can't be normalized, delete it
        delete jobInfo.title;
      }
    }

    if (jobInfo.company) {
      try {
        jobInfo.company = jobInfo.company.toString().trim();
        jobInfo.company = jobInfo.company.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      } catch (e) {
        delete jobInfo.company;
      }
    }

    if (jobInfo.location) {
      try {
        jobInfo.location = jobInfo.location.toString().trim();
        jobInfo.location = jobInfo.location.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      } catch (e) {
        delete jobInfo.location;
      }
    }

    // Add diagnostic info
    if (!jobInfo.title && !jobInfo.company && !jobInfo.location) {
      jobInfo._extractionFailed = true;
    }

    console.info(`${this.logPrefix} Extracted job info:`, jobInfo);
    return jobInfo;
  }

  /**
   * Accept initial/assigned task from Foreman, log for tracking.
   */
  setInitialTask(description: string): void {
    console.info(`${this.logPrefix} Initial task assigned: ${description}`);
    // Process initial task if it's a URL
    if (description.includes('indeed.com')) {
      this.processLink(description);
    }
  }

  // TODO: Add caching to avoid reprocessing the same URLs.
  // TODO: Add rate limiting to prevent overloading Indeed's servers.
  // TODO: Support deeper job info extraction using Indeed's API.
  // TODO: Add error recovery and retry logic for network issues.
}
