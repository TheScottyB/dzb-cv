# DZB-CV Architecture

## Overview

DZB-CV is designed as a one-user, pluggable CV management system. The architecture enables any user to create a fully personalized CV and job application workflow by simply providing their own data file (`base-info.json`).

## Key Concepts

- **One Repo Per User:** Each user has their own repository, containing their data, templates, and job search history. This ensures privacy, modularity, and full data ownership.
- **Pluggable Data Source:** The core user data is stored in `base-info.json`. Swapping this file instantly personalizes the system for a new user—no code changes required.
- **Advanced Markdown Templates:** Templates act like abstract classes, defining the structure of CVs and cover letters. User data fills in the details, enabling highly customized outputs for any job sector.
- **Automated Workflow:** Scripts and CLI commands generate, analyze, score, and catalog application materials, all driven by the user's data and template selection.

## High-Level Architecture Diagram

```
+-------------------+
|   base-info.json  |  <--- User-specific data (pluggable)
+-------------------+
           |
           v
+-------------------+
|   Markdown & PDF  |  <--- Advanced templates (sector-specific)
|    Templates      |
+-------------------+
           |
           v
+-------------------+
|   dzb-cv CLI &    |  <--- Generation, analysis, scoring, cataloging
|   Automation      |
+-------------------+
           |
           v
+-------------------+
|  Output: CVs,     |  <--- Personalized, sector-specific, ATS-optimized
|  Cover Letters,   |
|  Catalogs         |
+-------------------+
```

## How to Onboard a New User

1. **Clone the repo** (or use as a template).
2. **Replace `base-info.json`** with the new user's data.
3. **(Optional) Customize templates** for specific needs or branding.
4. **Run the CLI** to generate, analyze, and manage application materials.

No code changes are required—just data and (optionally) template updates.

## Benefits

- **Privacy & Ownership:** Each user controls their own data and repo.
- **Instant Personalization:** Swap in a new `base-info.json` and go.
- **No Vendor Lock-In:** No central service or SaaS dependency.
- **Maximum Flexibility:** Templates and scripts can be extended or customized per user.
- **Consistent, Automated Output:** All materials are generated from a single source of truth.

## Example: Dawn's Workflow

- Dawn's repo contains her `base-info.json`, job-postings, and tailored templates.
- All CVs, cover letters, and catalogs are generated and scored automatically for each job application.
- If another user wants to use DZB-CV, they simply start with a fresh repo and their own data file.

---

For more details, see the [README](../README.md) and user guides. 