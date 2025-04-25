import type { Profile, ProfileVersion } from '../../types/profile-management.js';
import type { CVStorageProvider } from '../cv-service.js';

/**
 * In-memory implementation of CV storage
 * Useful for development and testing
 */
export class MemoryStorage implements CVStorageProvider {
  private profiles: Map<string, Profile> = new Map();
  private versions: Map<string, ProfileVersion> = new Map();

  async saveProfile(profile: Profile): Promise<void> {
    this.profiles.set(profile.id, {
      ...profile,
      versions: [...profile.versions],
      currentVersion: { ...profile.currentVersion }
    });
  }

  async saveVersion(version: ProfileVersion): Promise<void> {
    this.versions.set(version.id, { ...version });
    
    // Update the corresponding profile's versions array
    const profile = this.profiles.get(version.profileId);
    if (profile) {
      const existingVersionIndex = profile.versions.findIndex(v => v.id === version.id);
      if (existingVersionIndex >= 0) {
        profile.versions[existingVersionIndex] = version;
      } else {
        profile.versions.push(version);
      }
      this.profiles.set(profile.id, profile);
    }
  }

  async getProfile(id: string): Promise<Profile | null> {
    const profile = this.profiles.get(id);
    if (!profile) return null;
    
    return {
      ...profile,
      versions: [...profile.versions],
      currentVersion: { ...profile.currentVersion }
    };
  }

  async getVersion(id: string): Promise<ProfileVersion | null> {
    const version = this.versions.get(id);
    if (!version) return null;
    
    return { ...version };
  }

  // Additional methods useful for testing
  async clear(): Promise<void> {
    this.profiles.clear();
    this.versions.clear();
  }

  async getProfileCount(): Promise<number> {
    return this.profiles.size;
  }

  async getVersionCount(): Promise<number> {
    return this.versions.size;
  }
}

