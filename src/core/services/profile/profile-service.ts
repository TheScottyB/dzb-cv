import { v4 as uuidv4 } from 'uuid';
import type { CVData } from '../../types/cv-base.js';
import type { Profile, ProfileVersion, ProfileChange } from '../../types/profile-management.js';
import type { StorageProvider } from './storage/storage-provider.js';
import { MemoryStorage } from './storage/memory-storage.js';

/**
 * Consolidated service for managing CV profiles
 * Handles profile creation, versioning, and storage
 */
export class ProfileService {
  private storage: StorageProvider;

  constructor(storage?: StorageProvider) {
    this.storage = storage || new MemoryStorage();
  }

  /**
   * Create a new profile with initial data
   */
  async createProfile(owner: string, data: CVData): Promise<Profile> {
    const now = new Date().toISOString();
    const profileId = uuidv4();

    const initialVersion: ProfileVersion = {
      id: uuidv4(),
      profileId,
      versionNumber: 1,
      timestamp: now,
      data,
      createdBy: owner,
    };

    const profile: Profile = {
      id: profileId,
      owner,
      createdAt: now,
      updatedAt: now,
      versions: [initialVersion],
      currentVersion: initialVersion,
      metadata: {
        source: 'manual',
        importCount: 0,
        tags: [],
      },
    };

    await this.storage.saveProfile(profile);
    await this.storage.saveVersion(initialVersion);

    return profile;
  }

  /**
   * Get a profile by ID
   */
  async getProfile(id: string): Promise<Profile | null> {
    return this.storage.getProfile(id);
  }

  /**
   * Get a specific version of a profile
   */
  async getProfileVersion(versionId: string): Promise<ProfileVersion | null> {
    return this.storage.getVersion(versionId);
  }

  /**
   * Create a new version of a profile
   */
  async createProfileVersion(
    profileId: string,
    newData: CVData,
    changeReason: string,
    createdBy: string,
    importSourceId?: string
  ): Promise<ProfileVersion> {
    const profile = await this.getProfile(profileId);
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }

    const currentVersion = profile.currentVersion;
    const changes = this.calculateChanges(currentVersion.data, newData);

    const newVersion: ProfileVersion = {
      id: uuidv4(),
      profileId,
      versionNumber: currentVersion.versionNumber + 1,
      timestamp: new Date().toISOString(),
      data: newData,
      createdBy,
      previousVersionId: currentVersion.id,
      changeReason,
      importSourceId,
      changes,
    };

    // Update profile
    profile.versions.push(newVersion);
    profile.currentVersion = newVersion;
    profile.updatedAt = newVersion.timestamp;

    // Save changes
    await this.storage.saveProfile(profile);
    await this.storage.saveVersion(newVersion);

    return newVersion;
  }

  /**
   * Calculate changes between two versions of profile data
   */
  private calculateChanges(oldData: CVData, newData: CVData): ProfileChange[] {
    const changes: ProfileChange[] = [];

    // Compare basic info
    if (JSON.stringify(oldData.personalInfo) !== JSON.stringify(newData.personalInfo)) {
      changes.push({
        type: 'update',
        field: 'personalInfo',
        oldValue: oldData.personalInfo,
        newValue: newData.personalInfo,
      });
    }

    // Compare experience entries
    const expChanges = this.compareArrays(oldData.experience, newData.experience, 'experience');
    changes.push(...expChanges);

    // Compare education entries
    const eduChanges = this.compareArrays(oldData.education, newData.education, 'education');
    changes.push(...eduChanges);

    // Compare skills
    if (JSON.stringify(oldData.skills) !== JSON.stringify(newData.skills)) {
      changes.push({
        type: 'update',
        field: 'skills',
        oldValue: oldData.skills,
        newValue: newData.skills,
      });
    }

    // Compare certifications
    const certChanges = this.compareArrays(
      oldData.certifications,
      newData.certifications,
      'certifications'
    );
    changes.push(...certChanges);

    return changes;
  }

  /**
   * Helper to compare arrays of objects
   */
  private compareArrays(oldArr: any[], newArr: any[], field: string): ProfileChange[] {
    const changes: ProfileChange[] = [];

    // Find removed items
    oldArr.forEach((item, index) => {
      if (!newArr.find((newItem) => JSON.stringify(newItem) === JSON.stringify(item))) {
        changes.push({
          type: 'remove',
          field,
          oldValue: item,
          index,
        });
      }
    });

    // Find added items
    newArr.forEach((item, index) => {
      if (!oldArr.find((oldItem) => JSON.stringify(oldItem) === JSON.stringify(item))) {
        changes.push({
          type: 'add',
          field,
          newValue: item,
          index,
        });
      }
    });

    return changes;
  }
}
