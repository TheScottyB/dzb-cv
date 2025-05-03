/**
 * Profile management and versioning types
 */

import type { CVData } from './cv-base.js';

/**
 * Profile metadata
 */
export interface ProfileMetadata {
  source: 'manual' | 'import' | 'migration';
  importCount: number;
  tags: string[];
}

/**
 * Change types for version tracking
 */
export type ChangeType = 'add' | 'remove' | 'update';

/**
 * Represents a change between versions
 */
export interface ProfileChange {
  type: ChangeType;
  field: string;
  oldValue?: any;
  newValue?: any;
  index?: number;
}

/**
 * A version of a profile
 */
export interface ProfileVersion {
  id: string;
  profileId: string;
  versionNumber: number;
  timestamp: string;
  data: CVData;
  createdBy: string;
  previousVersionId?: string;
  changeReason?: string;
  importSourceId?: string;
  changes?: ProfileChange[];
}

/**
 * Main profile entity
 */
export interface Profile {
  id: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  versions: ProfileVersion[];
  currentVersion: ProfileVersion;
  metadata: ProfileMetadata;
}

export interface ImportSource {
  id: string;
  filename: string;
  fileType: 'pdf' | 'docx' | 'json' | 'linkedin' | 'other';
  importDate: Date;
  rawContent: string;
  parsedData: Record<string, unknown>;
  status: 'pending' | 'processed' | 'failed';
  processingErrors: string[];
  resultingVersionId: string | null | undefined;
}

export type MergeStrategy =
  | 'full-replace'
  | 'smart-merge'
  | 'additive-only'
  | 'interactive'
  | 'section-specific';

export interface MergeConfig {
  strategy: MergeStrategy;
  sectionConfigs?: {
    [sectionName: string]: {
      strategy: MergeStrategy;
      priorityScore: number;
    };
  };
  autoResolveThreshold: number;
  preserveDeleted: boolean;
}
