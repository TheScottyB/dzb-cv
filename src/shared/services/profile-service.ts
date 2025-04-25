import { v4 as uuidv4 } from 'uuid';
import type { CVData } from '../types/cv-types.js';
import type { Profile, ProfileVersion } from '../types/profile-types.js';
import {
  ProfileData,
  ProfileChange,
  ImportSource,
  MergeStrategy,
  MergeConfig,
  ExperienceEntry,
  EducationEntry,
  SkillEntry,
  CertificationEntry,
  ProjectEntry
} from '../types/profile-types.js';

/**
 * Service for managing profile operations
 */
export class ProfileService {
  /**
   * Create a new profile with initial data
   * @param owner The name of the profile owner
   * @param data The initial profile data
   * @returns The newly created profile
   */
  async createProfile(owner: string, data: CVData): Promise<Profile> {
    const id = uuidv4();
    const version: ProfileVersion = {
      id: uuidv4(),
      profileId: id,
      versionNumber: 1,
      timestamp: new Date().toISOString(),
      data
    };
    
    return {
      id,
      owner,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [version],
      currentVersion: version
    };
  }
  
  /**
   * Get the latest version of a profile
   * @param profileId The ID of the profile
   * @returns The current profile version or null if not found
   */
  async getCurrentProfileVersion(profileId: string): Promise<ProfileVersion | null> {
    const profile = await this.getProfileById(profileId);
    if (!profile) return null;
    
    return this.getProfileVersionById(profile.currentVersion.id);
  }
  
  /**
   * Get a profile by ID (placeholder implementation)
   * @param profileId The ID of the profile to retrieve
   * @returns The profile or null if not found
   */
  private async getProfileById(profileId: string): Promise<Profile | null> {
    // This would normally fetch from a database
    // For now, return a mock success response for testing
    return {
      id: profileId,
      owner: 'Dawn Zurick Beilfuss',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [],
      currentVersion: {
        id: 'mock-version-id',
        profileId: profileId,
        versionNumber: 1,
        timestamp: new Date().toISOString(),
        data: {
          personalInfo: {
            name: {
              full: 'Dawn Zurick Beilfuss'
            },
            contact: {
              email: 'dawn.beilfuss@example.com',
              phone: '555-1234'
            }
          },
          experience: [],
          education: [],
          skills: [],
          certifications: []
        }
      }
    };
  }
  
  /**
   * Get a profile version by ID (placeholder implementation)
   * @param versionId The ID of the version to retrieve
   * @returns The profile version or null if not found
   */
  private async getProfileVersionById(versionId: string): Promise<ProfileVersion | null> {
    // This would normally fetch from a database
    // For now, return null to simulate a new profile creation
    return null;
  }
  
  /**
   * Save a profile to the database (placeholder implementation)
   * @param profile The profile to save
   */
  private async saveProfile(profile: Profile): Promise<void> {
    // This would normally save to a database
    console.log(`[Mock DB] Saving profile ${profile.id} for ${profile.owner}`);
    return Promise.resolve();
  }
  
  /**
   * Save a profile version to the database (placeholder implementation)
   * @param version The profile version to save
   */
  private async saveProfileVersion(version: ProfileVersion): Promise<void> {
    // This would normally save to a database
    console.log(`[Mock DB] Saving profile version ${version.id} for profile ${version.profileId}`);
    return Promise.resolve();
  }
  
  /**
   * Create a new version of a profile
   * @param profileId The ID of the profile to update
   * @param newData The new profile data
   * @param changeReason The reason for the changes
   * @param createdBy Who created this version
   * @param importSourceId Optional reference to an import source
   * @returns The newly created profile version
   */
  async createProfileVersion(
    profileId: string,
    newData: ProfileData,
    changeReason: string,
    createdBy: string,
    importSourceId: string | null = null
  ): Promise<ProfileVersion> {
    const profile = await this.getProfileById(profileId);
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }
    
    const currentVersion = await this.getProfileVersionById(profile.currentVersion.id);
    if (!currentVersion) {
      throw new Error(`Current version ${profile.currentVersion.id} not found`);
    }
    
    // Calculate changes
    const changes = this.calculateChanges(currentVersion.data, newData);
    
    // Create new version
    const newVersion: ProfileVersion = {
      id: uuidv4(),
      profileId,
      versionNumber: currentVersion.versionNumber + 1,
      timestamp: new Date().toISOString(),
      createdBy,
      previousVersionId: currentVersion.id,
      changeReason,
      importSourceId,
      data: newData,
      changes
    };
    
    // Update profile
    profile.currentVersion = newVersion;
    profile.updatedAt = newVersion.timestamp;
    
    // Save to database
    await this.saveProfile(profile);
    await this.saveProfileVersion(newVersion);
    
    return newVersion;
  }
  
  /**
   * Calculate changes between two versions of profile data
   * @param oldData The previous profile data
   * @param newData The new profile data
   * @returns Array of detected changes
   */
  private calculateChanges(oldData: CVData, newData: CVData): ProfileChange[] {
    const changes: ProfileChange[] = [];
    
    // Compare experience entries
    if (oldData.experience.length !== newData.experience.length) {
      changes.push({
        field: 'experience.length',
        oldValue: oldData.experience.length,
        newValue: newData.experience.length,
        resolutionNote: `Changed number of experience entries from ${oldData.experience.length} to ${newData.experience.length}`
      });
    }
    
    // Compare individual experience entries
    const oldExperienceMap = new Map(oldData.experience.map(exp => [exp.title + exp.company, exp]));
    const newExperienceMap = new Map(newData.experience.map(exp => [exp.title + exp.company, exp]));
    
    // Find added experiences
    newData.experience.forEach(newExp => {
      const key = newExp.title + newExp.company;
      if (!oldExperienceMap.has(key)) {
        changes.push({
          field: `experience.add`,
          oldValue: null,
          newValue: newExp,
          resolutionNote: `Added new experience: ${newExp.title} at ${newExp.company}`
        });
      }
    });
    
    // Find removed experiences
    oldData.experience.forEach(oldExp => {
      const key = oldExp.title + oldExp.company;
      if (!newExperienceMap.has(key)) {
        changes.push({
          field: `experience.remove`,
          oldValue: oldExp,
          newValue: null,
          resolutionNote: `Removed experience: ${oldExp.title} at ${oldExp.company}`
        });
      }
    });
    
    // Compare personal info
    if (JSON.stringify(oldData.personalInfo) !== JSON.stringify(newData.personalInfo)) {
      changes.push({
        field: 'personalInfo',
        oldValue: oldData.personalInfo,
        newValue: newData.personalInfo,
        resolutionNote: 'Updated personal information'
      });
    }
    
    return changes;
  }
}