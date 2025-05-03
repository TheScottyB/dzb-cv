import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorage } from '../memory-storage.js';
import type { Profile, ProfileVersion } from '../../../types/profile-management.js';
import type { CVData } from '../../../types/cv-base.js';

describe('MemoryStorage', () => {
  let storage: MemoryStorage;
  let testProfile: Profile;
  let testVersion: ProfileVersion;

  beforeEach(() => {
    storage = new MemoryStorage();

    const testData: CVData = {
      personalInfo: {
        name: { full: 'Test User' },
        contact: {
          email: 'test@example.com',
          phone: '123-456-7890'
        }
      },
      experience: [],
      education: [],
      skills: [],
      certifications: []
    };

    testVersion = {
      id: 'version-1',
      profileId: 'profile-1',
      versionNumber: 1,
      timestamp: new Date().toISOString(),
      data: testData
    };

    testProfile = {
      id: 'profile-1',
      owner: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [testVersion],
      currentVersion: testVersion
    };
  });

  describe('saveProfile', () => {
    it('should save a profile and allow retrieval', async () => {
      await storage.saveProfile(testProfile);
      const retrieved = await storage.getProfile(testProfile.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(testProfile.id);
      expect(retrieved?.owner).toBe(testProfile.owner);
    });

    it('should create deep copies of saved profiles', async () => {
      await storage.saveProfile(testProfile);
      const retrieved = await storage.getProfile(testProfile.id);
      
      // Modify the original
      testProfile.owner = 'Modified User';
      
      // Retrieved copy should not be affected
      expect(retrieved?.owner).toBe('Test User');
    });
  });

  describe('saveVersion', () => {
    it('should save a version and update profile versions', async () => {
      await storage.saveProfile(testProfile);
      
      const newVersion: ProfileVersion = {
        ...testVersion,
        id: 'version-2',
        versionNumber: 2,
        timestamp: new Date().toISOString()
      };

      await storage.saveVersion(newVersion);
      
      const profile = await storage.getProfile(testProfile.id);
      expect(profile?.versions).toHaveLength(2);
      expect(profile?.versions[1].id).toBe('version-2');
    });

    it('should update existing version if same ID', async () => {
      await storage.saveProfile(testProfile);
      await storage.saveVersion(testVersion);
      
      const updatedVersion = {
        ...testVersion,
        versionNumber: 99
      };

      await storage.saveVersion(updatedVersion);
      
      const profile = await storage.getProfile(testProfile.id);
      expect(profile?.versions).toHaveLength(1);
      expect(profile?.versions[0].versionNumber).toBe(99);
    });
  });

  describe('utility methods', () => {
    it('should clear all data', async () => {
      await storage.saveProfile(testProfile);
      await storage.clear();
      
      expect(await storage.getProfileCount()).toBe(0);
      expect(await storage.getVersionCount()).toBe(0);
    });

    it('should track counts correctly', async () => {
      await storage.saveProfile(testProfile);
      await storage.saveVersion(testVersion);
      
      expect(await storage.getProfileCount()).toBe(1);
      expect(await storage.getVersionCount()).toBe(1);
    });
  });
});

