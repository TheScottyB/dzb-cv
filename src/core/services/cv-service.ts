import { v4 as uuidv4 } from 'uuid';
import type { CVData } from '../types/cv-base.js';
import type { CVGenerationOptions } from '../types/cv-generation.js';
import type { Profile, ProfileVersion, ProfileChange } from '../types/profile-management.js';
import type { PDFGenerationOptions } from './pdf/pdf-generator.js';

interface ExperienceEntry {
  employer: string;
  position: string;
  startDate: string;
  endDate?: string;
  location?: string;
  responsibilities: string[];
  employmentType: string;
  supervisor?: string;
  achievements?: string[];
  gradeLevel?: string;
  salary?: string;
  careerProgression?: string[];
  technologies?: string[];
  isCurrent?: boolean;
  keywords?: string[];
  period?: string;
  duties?: string[];
  address?: string;
  hours?: string;
  mayContact?: boolean;
}

/**
 * Service for managing CV data and operations
 */
export class CVService {
  constructor(
    private readonly storage: CVStorageProvider,
    private readonly pdfGenerator: PDFGenerationProvider
  ) {}

  /**
   * Create a new CV profile
   * @param owner The name of the CV owner
   * @param data Initial CV data
   */
  async createCV(owner: string, data: CVData): Promise<Profile> {
    const id = uuidv4();
    const version: ProfileVersion = {
      id: uuidv4(),
      profileId: id,
      versionNumber: 1,
      timestamp: new Date().toISOString(),
      data,
    };

    const profile: Profile = {
      id,
      owner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [version],
      currentVersion: version,
    };

    await this.storage.saveProfile(profile);
    await this.storage.saveVersion(version);

    return profile;
  }

  /**
   * Generate CV in specified format
   */
  async generateCV(profileId: string, options: CVGenerationOptions): Promise<Buffer> {
    const profile = await this.storage.getProfile(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    if (options.format === 'pdf') {
      return this.pdfGenerator.generate(profile.currentVersion.data, {
        includeHeaderFooter: true,
        ...options.pdfOptions,
      });
    }

    throw new Error(`Format ${options.format} not supported`);
  }

  /**
   * Update existing CV data
   */
  async updateCV(
    profileId: string,
    data: Partial<CVData>,
    reason?: string
  ): Promise<ProfileVersion> {
    const profile = await this.storage.getProfile(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const currentData = profile.currentVersion.data;
    const newData = this.mergeData(currentData, data);
    const changes = this.calculateChanges(currentData, newData);

    const version: ProfileVersion = {
      id: uuidv4(),
      profileId,
      versionNumber: profile.currentVersion.versionNumber + 1,
      timestamp: new Date().toISOString(),
      data: newData,
      changes,
      ...(reason ? { changeReason: reason } : {}),
    };

    profile.versions.push(version);
    profile.currentVersion = version;
    profile.updatedAt = version.timestamp;

    await this.storage.saveProfile(profile);
    await this.storage.saveVersion(version);

    return version;
  }

  private mergeData(current: CVData, updates: Partial<CVData>): CVData {
    return {
      ...current,
      ...updates,
      personalInfo: {
        ...current.personalInfo,
        ...updates.personalInfo,
      },
      experience: updates.experience || current.experience,
      education: updates.education || current.education,
      skills: updates.skills || current.skills,
      certifications: updates.certifications || current.certifications,
    };
  }

  private calculateChanges(oldData: CVData, newData: CVData): ProfileChange[] {
    const changes: ProfileChange[] = [];

    // Compare experience entries
    if (oldData.experience.length !== newData.experience.length) {
      changes.push({
        field: 'experience.length',
        oldValue: oldData.experience.length,
        newValue: newData.experience.length,
        resolutionNote: `Changed number of experience entries from ${oldData.experience.length} to ${newData.experience.length}`,
      });
    }

    // Compare individual experience entries
    const robustKey = (exp: ExperienceEntry) =>
      [exp.position, exp.employer, exp.startDate, exp.endDate || '', exp.location || ''].join('|');

    const oldExperienceMap = new Map<string, ExperienceEntry>(
      oldData.experience.map((exp) => [robustKey(exp), exp])
    );
    const newExperienceMap = new Map<string, ExperienceEntry>(
      newData.experience.map((exp) => [robustKey(exp), exp])
    );

    this.detectExperienceChanges(oldExperienceMap, newExperienceMap, changes);

    // Compare personal info
    if (JSON.stringify(oldData.personalInfo) !== JSON.stringify(newData.personalInfo)) {
      changes.push({
        field: 'personalInfo',
        oldValue: oldData.personalInfo,
        newValue: newData.personalInfo,
        resolutionNote: 'Updated personal information',
      });
    }

    return changes;
  }

  private detectExperienceChanges(
    oldMap: Map<string, ExperienceEntry>,
    newMap: Map<string, ExperienceEntry>,
    changes: ProfileChange[]
  ): void {
    // Check for removed experiences
    for (const [key, oldExp] of oldMap) {
      if (!newMap.has(key)) {
        changes.push({
          field: 'experience.remove',
          oldValue: oldExp,
          newValue: null,
          resolutionNote: `Removed experience: ${oldExp.position} at ${oldExp.employer}`,
        });
      }
    }

    // Check for added experiences
    for (const [key, newExp] of newMap) {
      if (!oldMap.has(key)) {
        changes.push({
          field: 'experience.add',
          oldValue: null,
          newValue: newExp,
          resolutionNote: `Added experience: ${newExp.position} at ${newExp.employer}`,
        });
      }
    }
  }
}

/**
 * Interface for storage implementations
 */
export interface CVStorageProvider {
  saveProfile(profile: Profile): Promise<void>;
  saveVersion(version: ProfileVersion): Promise<void>;
  getProfile(id: string): Promise<Profile | null>;
  getVersion(id: string): Promise<ProfileVersion | null>;
}

/**
 * Interface for PDF generation implementations
 */
export interface PDFGenerationProvider {
  generate(data: CVData, options?: PDFGenerationOptions): Promise<Buffer>;
}
