import type { 
  CVData, 
  Experience, 
  Education, 
  Skill, 
  PersonalInfo,
  Profile,
  ProfileVersion
} from '@dzb-cv/core/types';
import { v4 as uuidv4 } from 'uuid';

export const createMockPersonalInfo = (override?: Partial<PersonalInfo>): PersonalInfo => ({
  name: {
    first: "Test",
    last: "User",
    full: "Test User"
  },
  contact: {
    email: "test@example.com",
    phone: "123-456-7890"
  },
  ...override
});

export const createMockExperience = (override?: Partial<Experience>): Experience => ({
  employer: "Test Company",
  position: "Test Position",
  startDate: "2024-01",
  responsibilities: ["Test responsibility"],
  employmentType: "full-time",
  ...override
});

export const createMockEducation = (override?: Partial<Education>): Education => ({
  institution: "Test University",
  degree: "Test Degree",
  field: "Test Field",
  graduationDate: "2025",
  ...override
});

export const createMockSkill = (override?: Partial<Skill>): Skill => ({
  name: "Test Skill",
  level: "intermediate",
  category: "Technical",
  ...override
});

export const createMockCVData = (override?: Partial<CVData>): CVData => ({
  personalInfo: createMockPersonalInfo(),
  experience: [createMockExperience()],
  education: [createMockEducation()],
  skills: [createMockSkill()],
  ...override
});

export const createMockProfileVersion = (override?: Partial<ProfileVersion>): ProfileVersion => ({
  id: uuidv4(),
  profileId: uuidv4(),
  versionNumber: 1,
  timestamp: new Date().toISOString(),
  createdBy: "test-user",
  data: createMockCVData(),
  ...override
});

export const createMockProfile = (override?: Partial<Profile>): Profile => {
  const version = createMockProfileVersion();
  return {
    id: uuidv4(),
    owner: "test-user",
    metadata: {
      tags: [],
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: [version],
    currentVersion: version,
    ...override
  };
};

