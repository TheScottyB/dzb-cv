/**
 * Type definitions for the Profile Management System
 */
export interface Profile {
    id: string;
    currentVersionId: string;
    created: Date;
    lastUpdated: Date;
    owner: string;
    metadata: {
        source: string;
        importCount: number;
        tags: string[];
    };
}
export interface ProfileVersion {
    id: string;
    profileId: string;
    versionNumber: number;
    timestamp: Date;
    createdBy: string;
    previousVersionId: string | null;
    changeReason: string;
    importSourceId: string | null;
    data: ProfileData;
    changes: ProfileChange[];
}
export interface ProfileData {
    basicInfo: BasicInfo;
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: SkillEntry[];
    certifications: CertificationEntry[];
    projects: ProjectEntry[];
}
export interface BasicInfo {
    name: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    summary: string;
    links: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
        [key: string]: string | undefined;
    };
}
export interface ExperienceEntry {
    id: string;
    company: string;
    title: string;
    startDate: Date;
    endDate: Date | null;
    location: string;
    description: string;
    achievements: string[];
    technologies: string[];
}
export interface EducationEntry {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: Date;
    endDate: Date | null;
    gpa: number | null;
    activities: string[];
    achievements: string[];
}
export interface SkillEntry {
    id: string;
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
    category: string;
    yearsOfExperience: number;
}
export interface CertificationEntry {
    id: string;
    name: string;
    issuer: string;
    dateObtained: Date;
    expirationDate: Date | null;
    credentialId: string | null;
    credentialURL: string | null;
}
export interface ProjectEntry {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date | null;
    url: string | null;
    technologies: string[];
    highlights: string[];
}
export interface ProfileChange {
    field: string;
    oldValue: any;
    newValue: any;
    resolutionNote: string;
}
export interface ImportSource {
    id: string;
    filename: string;
    fileType: "pdf" | "docx" | "json" | "linkedin" | "other";
    importDate: Date;
    rawContent: string;
    parsedData: any;
    status: "pending" | "processed" | "failed";
    processingErrors: string[];
    resultingVersionId: string | null;
}
export type MergeStrategy = "full-replace" | "smart-merge" | "additive-only" | "interactive" | "section-specific";
export interface MergeConfig {
    strategy: MergeStrategy;
    sectionConfigs?: {
        [sectionName: string]: {
            strategy: MergeStrategy;
            priorityScore: number;
        };
    };
    autoResolveThreshold: number;
    preserveDeleted: boolean;
}
