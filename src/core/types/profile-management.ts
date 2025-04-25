/**
 * Profile management and versioning types
 */

import type { CVData } from './cv-base.js';

export interface Profile {
  id: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  versions: ProfileVersion[];
  currentVersion: ProfileVersion;
}

export interface ProfileVersion {
  id: string;
  profileId: string;
  versionNumber: number;
  timestamp: string;
  data: CVData;
  description?: string | undefined;
  previousVersionId?: string | undefined;
  changeReason?: string | undefined;
  importSourceId?: string | null | undefined;
  changes?: ProfileChange[] | undefined;
  createdBy?: string | undefined;
}

export interface ProfileChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  resolutionNote: string;
}

export interface ImportSource {
  id: string;
  filename: string;
  fileType: "pdf" | "docx" | "json" | "linkedin" | "other";
  importDate: Date;
  rawContent: string;
  parsedData: Record<string, unknown>;
  status: "pending" | "processed" | "failed";
  processingErrors: string[];
  resultingVersionId: string | null | undefined;
}

export type MergeStrategy = 
  | "full-replace" 
  | "smart-merge"
  | "additive-only"
  | "interactive"
  | "section-specific";

export interface MergeConfig {
  strategy: MergeStrategy;
  sectionConfigs?: {
    [sectionName: string]: {
      strategy: MergeStrategy;
      priorityScore: number;
    }
  };
  autoResolveThreshold: number;
  preserveDeleted: boolean;
}

