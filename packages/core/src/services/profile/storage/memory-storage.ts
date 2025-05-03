import type { Profile, ProfileVersion } from '../../../types/profile-management.js';
import type { StorageProvider } from './storage-provider.js';

/**
 * In-memory implementation of profile storage
 * Useful for development and testing
 */
export class MemoryStorage implements StorageProvider {
  private profiles: Map<string, Profile> = new Map();
  private versions: Map<string, ProfileVersion> = new Map();

  async saveProfile(profile: Profile): Promise<void> {
    this.profiles.set(profile.id, {
      ...profile,
      versions: [...profile.versions],
      currentVersion: { ...profile.currentVersion },
    });
  }

  async saveVersion(version: ProfileVersion): Promise<void> {
    this.versions.set(version.id, { ...version });
  }

  async getProfile(id: string): Promise<Profile | null> {
    const profile = this.profiles.get(id);
    if (!profile) return null;

    return {
      ...profile,
      versions: [...profile.versions],
      currentVersion: { ...profile.currentVersion },
    };
  }

  async getVersion(id: string): Promise<ProfileVersion | null> {
    const version = this.versions.get(id);
    if (!version) return null;

    return { ...version };
  }

  async deleteProfile(id: string): Promise<void> {
    const profile = await this.getProfile(id);
    if (!profile) return;

    // Delete all versions
    profile.versions.forEach((version) => {
      this.versions.delete(version.id);
    });

    // Delete the profile
    this.profiles.delete(id);
  }

  async deleteVersion(id: string): Promise<void> {
    const version = await this.getVersion(id);
    if (!version) return;

    // Remove from versions map
    this.versions.delete(id);

    // Update profile if this was the current version
    const profile = await this.getProfile(version.profileId);
    if (profile && profile.currentVersion.id === id) {
      // Set current version to the most recent remaining version
      const remainingVersions = profile.versions.filter((v) => v.id !== id);
      if (remainingVersions.length > 0) {
        profile.currentVersion = remainingVersions[remainingVersions.length - 1];
        profile.versions = remainingVersions;
        await this.saveProfile(profile);
      } else {
        // No versions left, delete the profile
        await this.deleteProfile(profile.id);
      }
    }
  }
}
