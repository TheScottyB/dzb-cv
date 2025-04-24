import { Profile, ProfileVersion, ProfileData, ImportSource, MergeConfig } from '../types/profile-types.js';
/**
 * Service for managing profile operations
 */
export declare class ProfileService {
    /**
     * Create a new profile with initial data
     * @param owner The name of the profile owner
     * @param initialData The initial profile data
     * @returns The newly created profile
     */
    createProfile(owner: string, initialData: ProfileData): Promise<Profile>;
    /**
     * Get the latest version of a profile
     * @param profileId The ID of the profile
     * @returns The current profile version or null if not found
     */
    getCurrentProfileVersion(profileId: string): Promise<ProfileVersion | null>;
    /**
     * Get a profile by ID (placeholder implementation)
     * @param profileId The ID of the profile to retrieve
     * @returns The profile or null if not found
     */
    private getProfileById;
    /**
     * Get a profile version by ID (placeholder implementation)
     * @param versionId The ID of the version to retrieve
     * @returns The profile version or null if not found
     */
    private getProfileVersionById;
    /**
     * Save a profile to the database (placeholder implementation)
     * @param profile The profile to save
     */
    private saveProfile;
    /**
     * Save a profile version to the database (placeholder implementation)
     * @param version The profile version to save
     */
    private saveProfileVersion;
    /**
     * Create a new version of a profile
     * @param profileId The ID of the profile to update
     * @param newData The new profile data
     * @param changeReason The reason for the changes
     * @param createdBy Who created this version
     * @param importSourceId Optional reference to an import source
     * @returns The newly created profile version
     */
    createProfileVersion(profileId: string, newData: ProfileData, changeReason: string, createdBy: string, importSourceId?: string | null): Promise<ProfileVersion>;
    /**
     * Calculate changes between two versions of profile data
     * @param oldData The previous profile data
     * @param newData The new profile data
     * @returns Array of detected changes
     */
    private calculateChanges;
    /**
     * Import a profile from an external source
     * This is a placeholder for future implementation
     */
    importProfile(importSource: ImportSource, mergeConfig: MergeConfig): Promise<Profile>;
}
