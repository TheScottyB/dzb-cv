import { v4 as uuidv4 } from 'uuid';
import {
  Profile,
  ProfileVersion,
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
   * @param initialData The initial profile data
   * @returns The newly created profile
   */
  async createProfile(owner: string, initialData: ProfileData): Promise<Profile> {
    const now = new Date();
    
    // Create initial version
    const versionId = uuidv4();
    const initialVersion: ProfileVersion = {
      id: versionId,
      profileId: '', // Will be set after profile creation
      versionNumber: 1,
      timestamp: now,
      createdBy: 'system',
      previousVersionId: null,
      changeReason: 'Initial profile creation',
      importSourceId: null,
      data: initialData,
      changes: [] // No changes for initial version
    };
    
    // Create profile
    const profileId = uuidv4();
    const profile: Profile = {
      id: profileId,
      currentVersionId: versionId,
      created: now,
      lastUpdated: now,
      owner,
      metadata: {
        source: 'manual',
        importCount: 0,
        tags: []
      }
    };
    
    // Update version with profileId
    initialVersion.profileId = profileId;
    
    // Save to database (implementation details omitted)
    await this.saveProfile(profile);
    await this.saveProfileVersion(initialVersion);
    
    return profile;
  }
  
  /**
   * Get the latest version of a profile
   * @param profileId The ID of the profile
   * @returns The current profile version or null if not found
   */
  async getCurrentProfileVersion(profileId: string): Promise<ProfileVersion | null> {
    const profile = await this.getProfileById(profileId);
    if (!profile) return null;
    
    return this.getProfileVersionById(profile.currentVersionId);
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
      currentVersionId: 'mock-version-id',
      created: new Date(),
      lastUpdated: new Date(),
      owner: 'Dawn Zurick Beilfuss',
      metadata: {
        source: 'manual',
        importCount: 0,
        tags: []
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
    
    const currentVersion = await this.getProfileVersionById(profile.currentVersionId);
    if (!currentVersion) {
      throw new Error(`Current version ${profile.currentVersionId} not found`);
    }
    
    // Calculate changes
    const changes = this.calculateChanges(currentVersion.data, newData);
    
    // Create new version
    const newVersion: ProfileVersion = {
      id: uuidv4(),
      profileId,
      versionNumber: currentVersion.versionNumber + 1,
      timestamp: new Date(),
      createdBy,
      previousVersionId: currentVersion.id,
      changeReason,
      importSourceId,
      data: newData,
      changes
    };
    
    // Update profile
    profile.currentVersionId = newVersion.id;
    profile.lastUpdated = newVersion.timestamp;
    
    // Save to database (implementation details omitted)
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
  private calculateChanges(oldData: ProfileData, newData: ProfileData): ProfileChange[] {
    const changes: ProfileChange[] = [];
    
    // This is a simplified implementation that can be expanded to do deeper comparison
    
    // Basic info changes
    Object.keys(newData.basicInfo).forEach(key => {
      const typedKey = key as keyof typeof newData.basicInfo;
      if (JSON.stringify(oldData.basicInfo[typedKey]) !== JSON.stringify(newData.basicInfo[typedKey])) {
        changes.push({
          field: `basicInfo.${key}`,
          oldValue: oldData.basicInfo[typedKey],
          newValue: newData.basicInfo[typedKey],
          resolutionNote: `Updated ${key}`
        });
      }
    });
    
    // Experience changes
    if (oldData.experience.length !== newData.experience.length) {
      changes.push({
        field: 'experience.length',
        oldValue: oldData.experience.length,
        newValue: newData.experience.length,
        resolutionNote: `Changed number of experience entries from ${oldData.experience.length} to ${newData.experience.length}`
      });
    }
    
    // Compare individual experience entries by ID
    const oldExperienceMap = new Map(oldData.experience.map((exp: ExperienceEntry) => [exp.id, exp]));
    const newExperienceMap = new Map(newData.experience.map((exp: ExperienceEntry) => [exp.id, exp]));
    
    // Find added experiences
    newData.experience.forEach((newExp: ExperienceEntry) => {
      if (!oldExperienceMap.has(newExp.id)) {
        changes.push({
          field: `experience.add`,
          oldValue: null,
          newValue: newExp,
          resolutionNote: `Added new experience: ${newExp.title} at ${newExp.company}`
        });
      }
    });
    
    // Find removed experiences
    oldData.experience.forEach((oldExp: ExperienceEntry) => {
      if (!newExperienceMap.has(oldExp.id)) {
        changes.push({
          field: `experience.remove`,
          oldValue: oldExp,
          newValue: null,
          resolutionNote: `Removed experience: ${oldExp.title} at ${oldExp.company}`
        });
      }
    });
    
    // Find modified experiences
    oldData.experience.forEach((oldExp: ExperienceEntry) => {
      const newExp = newExperienceMap.get(oldExp.id) as ExperienceEntry | undefined;
      if (newExp && JSON.stringify(oldExp) !== JSON.stringify(newExp)) {
        // Find which fields changed
        const expFields = ['company', 'title', 'startDate', 'endDate', 'location', 'description'];
        
        expFields.forEach(field => {
          const typedField = field as keyof typeof oldExp;
          if (JSON.stringify(oldExp[typedField]) !== JSON.stringify(newExp[typedField])) {
            changes.push({
              field: `experience.${oldExp.id}.${field}`,
              oldValue: oldExp[typedField],
              newValue: newExp[typedField],
              resolutionNote: `Updated ${field} for ${oldExp.title} at ${oldExp.company}`
            });
          }
        });
        
        // Check achievements
        if (JSON.stringify(oldExp.achievements) !== JSON.stringify(newExp.achievements)) {
          changes.push({
            field: `experience.${oldExp.id}.achievements`,
            oldValue: oldExp.achievements,
            newValue: newExp.achievements,
            resolutionNote: `Updated achievements for ${oldExp.title} at ${oldExp.company}`
          });
        }
        
        // Check technologies
        if (JSON.stringify(oldExp.technologies) !== JSON.stringify(newExp.technologies)) {
          changes.push({
            field: `experience.${oldExp.id}.technologies`,
            oldValue: oldExp.technologies,
            newValue: newExp.technologies,
            resolutionNote: `Updated technologies for ${oldExp.title} at ${oldExp.company}`
          });
        }
      }
    });
    
    // Education changes
    if (oldData.education.length !== newData.education.length) {
      changes.push({
        field: 'education.length',
        oldValue: oldData.education.length,
        newValue: newData.education.length,
        resolutionNote: `Changed number of education entries from ${oldData.education.length} to ${newData.education.length}`
      });
    }
    
    // Compare individual education entries (similar approach as for experience)
    const oldEducationMap = new Map(oldData.education.map((edu: EducationEntry) => [edu.id, edu]));
    const newEducationMap = new Map(newData.education.map((edu: EducationEntry) => [edu.id, edu]));
    
    // Find added education entries
    newData.education.forEach((newEdu: EducationEntry) => {
      if (!oldEducationMap.has(newEdu.id)) {
        changes.push({
          field: `education.add`,
          oldValue: null,
          newValue: newEdu,
          resolutionNote: `Added new education: ${newEdu.degree} in ${newEdu.fieldOfStudy}`
        });
      }
    });
    
    // Find removed education entries
    oldData.education.forEach((oldEdu: EducationEntry) => {
      if (!newEducationMap.has(oldEdu.id)) {
        changes.push({
          field: `education.remove`,
          oldValue: oldEdu,
          newValue: null,
          resolutionNote: `Removed education: ${oldEdu.degree} in ${oldEdu.fieldOfStudy}`
        });
      }
    });
    
    // Skills changes
    if (oldData.skills.length !== newData.skills.length) {
      changes.push({
        field: 'skills.length',
        oldValue: oldData.skills.length,
        newValue: newData.skills.length,
        resolutionNote: `Changed number of skills from ${oldData.skills.length} to ${newData.skills.length}`
      });
    }
    
    // Compare individual skills (by ID)
    const oldSkillsMap = new Map(oldData.skills.map((skill: SkillEntry) => [skill.id, skill]));
    const newSkillsMap = new Map(newData.skills.map((skill: SkillEntry) => [skill.id, skill]));
    
    // Find added skills
    newData.skills.forEach((newSkill: SkillEntry) => {
      if (!oldSkillsMap.has(newSkill.id)) {
        changes.push({
          field: `skills.add`,
          oldValue: null,
          newValue: newSkill,
          resolutionNote: `Added new skill: ${newSkill.name} (${newSkill.category})`
        });
      }
    });
    
    // Find removed skills
    oldData.skills.forEach((oldSkill: SkillEntry) => {
      if (!newSkillsMap.has(oldSkill.id)) {
        changes.push({
          field: `skills.remove`,
          oldValue: oldSkill,
          newValue: null,
          resolutionNote: `Removed skill: ${oldSkill.name} (${oldSkill.category})`
        });
      }
    });
    
    // Certifications changes
    if (oldData.certifications.length !== newData.certifications.length) {
      changes.push({
        field: 'certifications.length',
        oldValue: oldData.certifications.length,
        newValue: newData.certifications.length,
        resolutionNote: `Changed number of certifications from ${oldData.certifications.length} to ${newData.certifications.length}`
      });
    }
    
    // Compare individual certifications (by ID)
    const oldCertMap = new Map(oldData.certifications.map((cert: CertificationEntry) => [cert.id, cert]));
    const newCertMap = new Map(newData.certifications.map((cert: CertificationEntry) => [cert.id, cert]));
    
    // Find added certifications
    newData.certifications.forEach((newCert: CertificationEntry) => {
      if (!oldCertMap.has(newCert.id)) {
        changes.push({
          field: `certifications.add`,
          oldValue: null,
          newValue: newCert,
          resolutionNote: `Added new certification: ${newCert.name}`
        });
      }
    });
    
    // Find removed certifications
    oldData.certifications.forEach((oldCert: CertificationEntry) => {
      if (!newCertMap.has(oldCert.id)) {
        changes.push({
          field: `certifications.remove`,
          oldValue: oldCert,
          newValue: null,
          resolutionNote: `Removed certification: ${oldCert.name}`
        });
      }
    });
    
    // Find modified certifications
    oldData.certifications.forEach((oldCert: CertificationEntry) => {
      const newCert = newCertMap.get(oldCert.id) as CertificationEntry | undefined;
      if (newCert && JSON.stringify(oldCert) !== JSON.stringify(newCert)) {
        // Find which fields changed
        const certFields = ['name', 'issuer', 'dateObtained', 'expirationDate', 'credentialId', 'credentialURL'];
        
        certFields.forEach(field => {
          const typedField = field as keyof typeof oldCert;
          if (JSON.stringify(oldCert[typedField]) !== JSON.stringify(newCert[typedField])) {
            changes.push({
              field: `certifications.${oldCert.id}.${field}`,
              oldValue: oldCert[typedField],
              newValue: newCert[typedField],
              resolutionNote: `Updated ${field} for certification: ${oldCert.name}`
            });
          }
        });
      }
    });
    
    // Projects changes
    if (oldData.projects.length !== newData.projects.length) {
      changes.push({
        field: 'projects.length',
        oldValue: oldData.projects.length,
        newValue: newData.projects.length,
        resolutionNote: `Changed number of projects from ${oldData.projects.length} to ${newData.projects.length}`
      });
    }
    
    // Compare individual projects (by ID)
    const oldProjMap = new Map(oldData.projects.map((proj: ProjectEntry) => [proj.id, proj]));
    const newProjMap = new Map(newData.projects.map((proj: ProjectEntry) => [proj.id, proj]));
    
    // Find added projects
    newData.projects.forEach((newProj: ProjectEntry) => {
      if (!oldProjMap.has(newProj.id)) {
        changes.push({
          field: `projects.add`,
          oldValue: null,
          newValue: newProj,
          resolutionNote: `Added new project: ${newProj.name}`
        });
      }
    });
    
    // Find removed projects
    oldData.projects.forEach((oldProj: ProjectEntry) => {
      if (!newProjMap.has(oldProj.id)) {
        changes.push({
          field: `projects.remove`,
          oldValue: oldProj,
          newValue: null,
          resolutionNote: `Removed project: ${oldProj.name}`
        });
      }
    });
    
    // Find modified projects
    oldData.projects.forEach((oldProj: ProjectEntry) => {
      const newProj = newProjMap.get(oldProj.id) as ProjectEntry | undefined;
      if (newProj && JSON.stringify(oldProj) !== JSON.stringify(newProj)) {
        // Find which fields changed
        const projFields = ['name', 'description', 'startDate', 'endDate', 'url'];
        
        projFields.forEach(field => {
          const typedField = field as keyof typeof oldProj;
          if (JSON.stringify(oldProj[typedField]) !== JSON.stringify(newProj[typedField])) {
            changes.push({
              field: `projects.${oldProj.id}.${field}`,
              oldValue: oldProj[typedField],
              newValue: newProj[typedField],
              resolutionNote: `Updated ${field} for project: ${oldProj.name}`
            });
          }
        });
        
        // Check technologies
        if (JSON.stringify(oldProj.technologies) !== JSON.stringify(newProj.technologies)) {
          changes.push({
            field: `projects.${oldProj.id}.technologies`,
            oldValue: oldProj.technologies,
            newValue: newProj.technologies,
            resolutionNote: `Updated technologies for project: ${oldProj.name}`
          });
        }
        
        // Check highlights
        if (JSON.stringify(oldProj.highlights) !== JSON.stringify(newProj.highlights)) {
          changes.push({
            field: `projects.${oldProj.id}.highlights`,
            oldValue: oldProj.highlights,
            newValue: newProj.highlights,
            resolutionNote: `Updated highlights for project: ${oldProj.name}`
          });
        }
      }
    });
    
    return changes;
  }
  
  /**
   * Import a profile from an external source
   * This is a placeholder for future implementation
   */
  async importProfile(importSource: ImportSource, mergeConfig: MergeConfig): Promise<Profile> {
    // Placeholder implementation
    console.log(`Importing profile from ${importSource.filename} using ${mergeConfig.strategy} strategy`);
    
    // TODO: Implement actual import logic
    // 1. Parse import source based on file type
    // 2. Match with existing profile if any
    // 3. Apply merge strategy
    // 4. Create new version
    
    // For now, just create a new empty profile
    return this.createProfile('Imported Profile', {
      basicInfo: {
        name: 'Imported Profile',
        email: '',
        phone: '',
        location: '',
        title: '',
        summary: `Imported from ${importSource.filename}`,
        links: {}
      },
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      projects: []
    });
  }
}
