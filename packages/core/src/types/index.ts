// Base types
import type { CVData } from '@dzb-cv/types';
export * from '@dzb-cv/types';

// Local type exports
export * from './config';
export * from './storage';
export * from './validation';

// Profile types
export interface ProfileMetadata {
  tags: string[];
  lastModified: string;
  createdAt: string;
}

export interface ProfileVersion {
  id: string;
  profileId: string;
  versionNumber: number;
  timestamp: string;
  createdBy: string;
  data: CVData;
}

export interface Profile {
  id: string;
  owner: string;
  metadata: ProfileMetadata;
  createdAt: string;
  updatedAt: string;
  versions: ProfileVersion[];
  currentVersion: ProfileVersion;
}

// Core configuration
export interface CoreConfig {
  rootDir: string;
  outputDir: string;
  templatesDir: string;
}
