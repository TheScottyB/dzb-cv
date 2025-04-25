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
  description?: string;
  previousVersionId?: string;
  changeReason?: string;
  importSourceId?: string | null;
  changes?: ProfileChange[];
  createdBy?: string;
}

export interface ProfileChange {
  field: string;
  oldValue: any;
  newValue: any;
  resolutionNote: string;
}

export interface ImportSource {
  id: string;
  filename: string;
  fileType: "pdf" | "docx" | "json" | "linkedin" | "other";
  importDate: Date;
  rawContent: string;
  parsedData: any;
  status: "pending" | "processed" | "failed";
  processingErrors: string[];
  resultingVersionId: string | null;
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

