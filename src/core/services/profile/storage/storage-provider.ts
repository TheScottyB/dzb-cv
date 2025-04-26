import type { Profile, ProfileVersion } from '../../../types/profile-management.js';

/**
 * Interface defining the contract for profile storage implementations
 */
export interface StorageProvider {
  /**
   * Save a profile to storage
   */
  saveProfile(profile: Profile): Promise<void>;

  /**
   * Save a profile version to storage
   */
  saveVersion(version: ProfileVersion): Promise<void>;

  /**
   * Retrieve a profile by ID
   */
  getProfile(id: string): Promise<Profile | null>;

  /**
   * Retrieve a profile version by ID
   */
  getVersion(id: string): Promise<ProfileVersion | null>;

  /**
   * Delete a profile and all its versions
   */
  deleteProfile(id: string): Promise<void>;

  /**
   * Delete a specific version of a profile
   */
  deleteVersion(id: string): Promise<void>;
}
