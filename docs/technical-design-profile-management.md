# Technical Design: Profile Management System

## Overview

This document outlines the technical design for a profile management system that allows importing, versioning, and tracking changes to CV/resume data for Dawn. The system ensures data integrity, avoids duplication, and maintains a complete history of profile changes with explanations.

> **Note**: For a complete understanding of the tools organization and format specifications used in this project, please also refer to the new [Technical Design: Formatting Specifications](technical-design-formatting.md) document.

## Core Requirements

1. **Version-controlled profile storage**: Track all changes to profiles over time
2. **Import capability for legacy documents**: Support importing from various CV/resume formats 
3. **Change tracking with resolution history**: Record why changes were made
4. **Efficient data storage**: Avoid data duplication while maintaining comprehensive history

## Data Models

### Profile

```typescript
interface Profile {
  id: string;             // Unique identifier
  currentVersionId: string; // Reference to current version
  created: Date;          // Creation timestamp
  lastUpdated: Date;      // Last update timestamp
  owner: string;          // Profile owner (e.g., "Dawn")
  // Metadata fields
  metadata: {
    source: string;       // Original source system
    importCount: number;  // Number of imports that affected this profile
    tags: string[];       // Organizational tags
  };
}
```

### ProfileVersion

```typescript
interface ProfileVersion {
  id: string;             // Unique version identifier
  profileId: string;      // Reference to parent profile
  versionNumber: number;  // Sequential version number
  timestamp: Date;        // When this version was created
  createdBy: string;      // User or system that created this version
  previousVersionId: string | null; // Reference to previous version (null for first version)
  changeReason: string;   // Explanation of why changes were made
  importSourceId: string | null; // If from import, reference to source
  
  // Actual profile data - stored as a document to allow for schema evolution
  data: {
    basicInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      title: string;
      summary: string;
      // Additional basic fields
    };
    experience: ExperienceEntry[];
    education: EducationEntry[];
    skills: SkillEntry[];
    certifications: CertificationEntry[];
    projects: ProjectEntry[];
    // Additional sections as needed
  };
  
  // Changeset compared to previous version (for efficient querying)
  changes: {
    field: string;        // Path to changed field
    oldValue: any;        // Previous value
    newValue: any;        // New value
    resolutionNote: string; // Explanation for this specific change
  }[];
}
```

### Experience, Education, and other sub-models

```typescript
interface ExperienceEntry {
  id: string;             // Unique identifier for this entry
  company: string;
  title: string;
  startDate: Date;
  endDate: Date | null;   // null means "present"
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

interface EducationEntry {
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

interface SkillEntry {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: string;
  yearsOfExperience: number;
}

// Additional models as needed
```

### ImportSource

```typescript
interface ImportSource {
  id: string;             // Unique identifier
  filename: string;       // Original filename
  fileType: "pdf" | "docx" | "json" | "linkedin" | "other";
  importDate: Date;       // When the import occurred
  rawContent: string;     // Original content (may be stored in blob storage instead)
  parsedData: any;        // Structured data extracted from the import
  status: "pending" | "processed" | "failed";
  processingErrors: string[]; // Any errors during import
  resultingVersionId: string | null; // The version created from this import
}
```

## Storage Strategy

### Database Design

We'll use a combination of:

1. **Document Database** (e.g., MongoDB, Firestore)
   - Store complete ProfileVersion documents
   - Efficient for retrieving full versions and handling schema evolution
   - Suitable for the dynamic nature of resume data

2. **Relational Tables** (optional, for advanced querying)
   - Profile metadata
   - Import source tracking
   - Version relationships
   - Change records (for efficient filtering and reporting)

### File Storage

- Store original imported documents in blob storage
- Link to document database records
- Support original document retrieval when needed

## Import & Merge Logic

### Import Process

1. **Document Upload**
   - Accept CV/resume in various formats (PDF, DOCX, JSON, LinkedIn export)
   - Store original in blob storage
   - Create ImportSource record

2. **Document Parsing**
   - Extract structured data using appropriate parser for file type
   - Handle different formats and structures
   - Apply data normalization

3. **Profile Matching**
   - Determine if this document belongs to an existing profile
   - Use fuzzy matching on name, email, and other identifiers
   - Allow manual confirmation when uncertain

4. **Differential Analysis**
   - Compare imported data with the latest profile version
   - Identify new, changed, and missing information
   - Score changes by confidence and significance

5. **Merge Strategy Execution**
   - Apply the selected merge strategy (see below)
   - Generate change explanations
   - Create new version with detailed change records

### Merge Strategies

1. **Full Replace**: Replace entire profile with imported data
2. **Smart Merge**: Selectively update fields based on recency and completeness
3. **Additive Only**: Only add new information, never remove existing data
4. **Interactive**: Present differences for manual resolution
5. **Section Specific**: Apply different merge strategies per section

### Conflict Resolution

For each conflicting field, the system will:
1. Apply a confidence score based on data source and completeness
2. Use timestamps when available to determine recency
3. Generate a suggested resolution with explanation
4. Allow for manual override when needed
5. Record the resolution rationale in the change history

## Version Control Approach

### Immutable History

- All profile versions are immutable once created
- Each change creates a new version
- Complete history is preserved
- Deletions are logical, not physical

### Version Navigation

- Support for viewing any historical version
- Diff view between any two versions
- Audit trail of who made changes and why
- Ability to revert to previous versions by creating a new version based on previous data

### Change Tracking

For each version:
- Record what changed
- Record why it changed
- Record who made the change
- Record when the change was made
- Store original document reference when from import

## Implementation Plan

### Phase 1: Core Data Model and Storage
- Implement Profile and ProfileVersion models
- Set up database structure
- Create basic CRUD operations

### Phase 2: Import System
- Implement document upload and storage
- Create parsers for common formats
- Develop profile matching logic

### Phase 3: Versioning System
- Implement versioning logic
- Create change detection system
- Build history display and navigation

### Phase 4: Merge and Resolution
- Implement merge strategies
- Build conflict resolution system
- Add support for explanations and notes

### Phase 5: UI and Integration
- Create user interfaces for all operations
- Integrate with existing systems
- Add export capabilities

## Technical Considerations

### Performance
- Use database indexing for version retrieval
- Consider caching for current profile versions
- Use incremental changes to minimize storage

### Security
- Implement proper access controls
- Encrypt sensitive data
- Maintain audit logs for compliance

### Extensibility
- Design for schema evolution over time
- Use interfaces and generics for flexibility
- Support plug-in architecture for document parsers

## Conclusion

This design creates a robust system for managing Dawn's professional profile data with complete history tracking, efficient storage, and flexible import capabilities. The version control system ensures no information is lost while the merge strategies minimize duplicate data and manual work.

