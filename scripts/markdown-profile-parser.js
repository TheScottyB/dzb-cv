import { v4 as uuidv4 } from 'uuid';
/**
 * Specialized parser for Dawn's markdown CV format
 */
export class MarkdownProfileParser {
    constructor(markdownContent) {
        this.content = markdownContent;
        this.lines = markdownContent.split('\n');
        this.sectionMap = this.mapSections();
    }
    /**
     * Main parse method - converts markdown to structured ProfileData
     */
    parse() {
        console.log("Starting to parse CV markdown...");
        // Extract data from each section
        const basicInfo = this.parseBasicInfo();
        const skills = this.parseSkills();
        const experience = this.parseWorkExperience();
        const education = this.parseEducation();
        const certifications = this.parseCertifications();
        const projects = this.parseVolunteerExperience();
        // Log found items for debugging
        // Log found items for debugging
        console.log("Found " + experience.length + " work experiences");
        console.log("Found " + skills.length + " skills");
        console.log("Found " + education.length + " education entries");
        console.log("Found " + certifications.length + " certifications");
        console.log("Found " + projects.length + " project/volunteer entries");
        // Return the complete ProfileData
        return {
            basicInfo,
            skills,
            experience,
            education,
            certifications,
            projects
        };
    }
    /**
     * Map all sections in the document to their line ranges
     */
    mapSections() {
        const sectionMap = new Map();
        const sectionHeadings = [
            '**SUMMARY OF SKILLS**',
            '**WORK EXPERIENCE**',
            '**EDUCATION**',
            '**CERTIFICATIONS & LICENSES**',
            '**PROFESSIONAL AFFILIATIONS & LEADERSHIP**',
            '**VOLUNTEER / COMMUNITY SERVICE EXPERIENCE**',
            '**AWARDS AND ACHIEVEMENTS**'
        ];
        // Find the start index of each section
        const sectionStartIndices = [];
        // First try exact matches
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i].trim();
            if (sectionHeadings.includes(line)) {
                sectionStartIndices.push({ heading: line, index: i });
                console.log("Found section: " + line + " at line " + i);
            }
        }
        // If we didn't find any sections with exact matches, try more flexible matching
        if (sectionStartIndices.length === 0) {
            console.log("No exact section matches found, trying flexible matching...");
            // Try matching section headings without ** marks
            for (let i = 0; i < this.lines.length; i++) {
                const line = this.lines[i].trim();
                for (const heading of sectionHeadings) {
                    const plainHeading = heading.replace(/\*\*/g, '');
                    if (line.includes(plainHeading)) {
                        sectionStartIndices.push({ heading, index: i });
                        console.log("Found section (flexible match): " + heading + " at line " + i);
                        break;
                    }
                }
            }
        }
        console.log("Found " + sectionStartIndices.length + " sections in CV");
        // Calculate the end index for each section (start of next section - 1)
        for (let i = 0; i < sectionStartIndices.length; i++) {
            const currentSection = sectionStartIndices[i];
            const nextSection = sectionStartIndices[i + 1];
            const endIndex = nextSection ? nextSection.index - 1 : this.lines.length - 1;
            sectionMap.set(currentSection.heading, {
                startIndex: currentSection.index,
                endIndex
            });
        }
        return sectionMap;
    }
    /**
     * Get lines within a specific section
     */
    getSectionLines(sectionHeading) {
        const section = this.sectionMap.get(sectionHeading);
        if (!section) {
            console.log(`Section "${sectionHeading}" not found`);
            return [];
        }
        const sectionLines = this.lines.slice(section.startIndex + 1, section.endIndex + 1);
        console.log("Section \"" + sectionHeading + "\" contains " + sectionLines.length + " lines");
        console.log("First few lines: " + sectionLines.slice(0, 3).map(l => "\"" + l + "\"").join(", "));
        return sectionLines;
    }
    /**
     * Parse skills from the SUMMARY OF SKILLS section
     */
    parseSkills() {
        const skills = [];
        const skillsSection = this.getSectionLines('**SUMMARY OF SKILLS**');
        if (skillsSection.length === 0) {
            console.log("No SUMMARY OF SKILLS section found.");
            return skills;
        }
        console.log("Found skills section with " + skillsSection.length + " lines");
        console.log("RAW SKILLS SECTION:");
        skillsSection.forEach((line, i) => console.log("[" + i + "]: " + line));
        // Track the current category
        let currentCategory = 'Uncategorized';
        try {
            // Extract skills directly for Dawn's specific categories
            for (const line of skillsSection) {
                if (!line)
                    continue;
                const trimmedLine = line.trim();
                if (!trimmedLine)
                    continue;
                // Management & Leadership skills
                if (trimmedLine.includes('Management & Leadership:')) {
                    currentCategory = 'Management & Leadership';
                    console.log("Found Management & Leadership skills");
                    // Get text after colon
                    const colonIndex = trimmedLine.indexOf(':');
                    if (colonIndex >= 0) {
                        const skillsText = trimmedLine.substring(colonIndex + 1).trim();
                        this.extractSkillsFromText(skillsText, currentCategory, skills);
                    }
                }
                // Real Estate Operations skills
                else if (trimmedLine.includes('Real Estate Operations:')) {
                    currentCategory = 'Real Estate Operations';
                    console.log("Found Real Estate Operations skills");
                    const colonIndex = trimmedLine.indexOf(':');
                    if (colonIndex >= 0) {
                        const skillsText = trimmedLine.substring(colonIndex + 1).trim();
                        this.extractSkillsFromText(skillsText, currentCategory, skills);
                    }
                }
                // Healthcare Administration skills
                else if (trimmedLine.includes('Healthcare Administration:')) {
                    currentCategory = 'Healthcare Administration';
                    console.log("Found Healthcare Administration skills");
                    const colonIndex = trimmedLine.indexOf(':');
                    if (colonIndex >= 0) {
                        const skillsText = trimmedLine.substring(colonIndex + 1).trim();
                        this.extractSkillsFromText(skillsText, currentCategory, skills);
                    }
                }
                // Administration & Technical skills
                else if (trimmedLine.includes('Administration & Technical:')) {
                    currentCategory = 'Administration & Technical';
                    console.log("Found Administration & Technical skills");
                    const colonIndex = trimmedLine.indexOf(':');
                    if (colonIndex >= 0) {
                        const skillsText = trimmedLine.substring(colonIndex + 1).trim();
                        this.extractSkillsFromText(skillsText, currentCategory, skills);
                    }
                }
            }
        }
        catch (error) {
            console.error("Error parsing skills section:", error);
        }
        console.log("Extracted " + skills.length + " skills in total");
        return skills;
    }
    /**
     * Helper to extract skills from text
     */
    extractSkillsFromText(text, category, skills) {
        if (!text)
            return;
        // First remove markdown
        const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
        // Split by commas
        const skillItems = cleanText.split(/,/).map(s => s.trim()).filter(Boolean);
        console.log("Found " + skillItems.length + " skills in category: " + category);
        for (const skillName of skillItems) {
            if (skillName && skillName.length > 2) {
                console.log("Adding skill: " + skillName);
                skills.push({
                    id: uuidv4(),
                    name: skillName,
                    level: 'advanced',
                    category,
                    yearsOfExperience: 0
                });
            }
        }
    }
    /**
     * Parse basic information (name, contact, etc.)
     */
    parseBasicInfo() {
        const basicInfo = {
            name: '',
            email: '',
            phone: '',
            location: '',
            title: '',
            summary: '',
            links: {}
        };
        // Name is typically in the first line
        if (this.lines.length > 0) {
            const nameLine = this.lines[0].trim();
            basicInfo.name = nameLine.replace(/\*\*/g, '').trim();
        }
        // Location is typically in the second line
        if (this.lines.length > 1) {
            basicInfo.location = this.lines[1].trim();
        }
        // Extract phone and email from the first few lines
        for (let i = 0; i < Math.min(10, this.lines.length); i++) {
            const line = this.lines[i].trim();
            // Phone extraction
            if (line.toLowerCase().includes('phone') || line.toLowerCase().includes('home:')) {
                const phoneMatch = line.match(/(\d{3}[.-]?\d{3}[.-]?\d{4})/);
                if (phoneMatch) {
                    basicInfo.phone = phoneMatch[1];
                }
            }
            // Email extraction
            if (line.toLowerCase().includes('email:')) {
                const emailMatch = line.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
                if (emailMatch) {
                    basicInfo.email = emailMatch[0];
                }
            }
        }
        // Title - use the most recent position from work experience
        const experienceSection = this.getSectionLines('**WORK EXPERIENCE**');
        if (experienceSection.length > 0) {
            for (const line of experienceSection) {
                if (line.startsWith('*') && line.endsWith('*') && !line.includes('**') &&
                    !line.includes('*Salary*') && !line.includes('*Grade*')) {
                    basicInfo.title = line.replace(/\*/g, '').trim();
                    break;
                }
            }
        }
        // Summary - extract from the skills section
        const skillsSection = this.getSectionLines('**SUMMARY OF SKILLS**');
        if (skillsSection.length > 0) {
            basicInfo.summary = skillsSection
                .filter(line => line.trim().startsWith('*'))
                .map(line => line.trim())
                .join(' ');
        }
        return basicInfo;
    }
    /**
     * Parse work experience entries
     */
    parseWorkExperience() {
        const experience = [];
        const workSection = this.getSectionLines('**WORK EXPERIENCE**');
        if (workSection.length === 0) {
            console.log("No WORK EXPERIENCE section found.");
            return experience;
        }
        workSection.slice(0, 10).forEach((line, i) => console.log("[" + i + "]: " + line));
        let currentCompany = null;
        let currentLocation = null;
        let currentSupervisor = null;
        let currentPosition = null;
        let currentStartDate = null;
        let currentEndDate = null;
        let currentAchievements = [];
        // Process each line in the work section
        for (const line of workSection) {
            const trimmedLine = line.trim();
            // Skip empty lines
            if (!trimmedLine)
                continue;
            // Try to find a company name (bold format)
            // Dawn's CV has company names in bold: "**Company**"
            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') &&
                !trimmedLine.includes('SUMMARY') && !trimmedLine.includes('WORK EXPERIENCE')) {
                // If we were processing a company with enough details to make a valid entry, save it
                if (currentCompany && currentPosition && currentStartDate) {
                    console.log("Saving work experience: " + currentPosition + " at " + currentCompany +
                        " (" + currentStartDate + " to " + (currentEndDate || 'Present') + ")");
                    // Parse dates
                    const startDate = currentStartDate ? this.parseDate(currentStartDate) : new Date();
                    let endDate = null;
                    if (currentEndDate && currentEndDate !== 'Present') {
                        endDate = this.parseDate(currentEndDate);
                    }
                    // Add the experience entry
                    experience.push({
                        id: uuidv4(),
                        company: currentCompany,
                        title: currentPosition,
                        startDate,
                        endDate,
                        location: currentLocation || '',
                        description: currentSupervisor || '',
                        achievements: currentAchievements,
                        technologies: [] // No specific technologies mentioned in CV
                    });
                    console.log("Added work experience: " + currentPosition + " at " + currentCompany);
                    // Reset for new company
                    currentLocation = null;
                    currentSupervisor = null;
                    currentPosition = null;
                    currentStartDate = null;
                    currentEndDate = null;
                    currentAchievements = [];
                }
                // Set the new company
                currentCompany = trimmedLine.replace(/\*\*/g, '').trim();
                console.log("Processing company: " + currentCompany);
                continue;
            }
            // Company location (line after company name)
            if (currentCompany && !currentLocation && !trimmedLine.startsWith('*') && !trimmedLine.startsWith('Supervisor:')) {
                currentLocation = trimmedLine;
                console.log("Found location: " + currentLocation);
                continue;
            }
            // Supervisor info
            if (trimmedLine.startsWith('Supervisor:')) {
                currentSupervisor = trimmedLine;
                console.log("Found supervisor: " + currentSupervisor);
                continue;
            }
            // Position title in Dawn's CV is in italics: "*Position*"
            if (trimmedLine.startsWith('*') && trimmedLine.endsWith('*') &&
                !trimmedLine.includes('**') &&
                !trimmedLine.includes('Salary') && !trimmedLine.includes('Grade')) {
                currentPosition = trimmedLine.replace(/\*/g, '').trim();
                console.log("Found position: " + currentPosition);
                continue;
            }
            // Date range - Dawn's format: "Month YYYY - Present" or "Month YYYY - Month YYYY"
            // The hyphen is escaped with \ in markdown
            const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\s*\\?-\s*(Present|January|February|March|April|May|June|July|August|September|October|November|December)?\s*(\d{4})?\s*/i;
            const dateMatch = trimmedLine.match(datePattern);
            if (dateMatch) {
                currentStartDate = dateMatch[1] + " " + dateMatch[2];
                currentEndDate = dateMatch[3] === 'Present' ? 'Present' : (dateMatch[3] + " " + (dateMatch[4] || '')).trim();
                console.log("Found date range: " + currentStartDate + " to " + currentEndDate);
                continue;
            }
            // Skip hours and salary/grade lines
            if (trimmedLine.includes('hours per week') || trimmedLine.includes('Salary:') || trimmedLine.includes('Grade')) {
                continue;
            }
            // Achievement bullet points in Dawn's CV
            if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**') &&
                !trimmedLine.includes('Salary') && !trimmedLine.includes('Grade')) {
                const achievement = trimmedLine.replace(/^\* /, '').trim();
                console.log("Found achievement: " + achievement.substring(0, 30) + "...");
                currentAchievements.push(achievement);
            }
        }
        // Add the last company if it exists with enough details
        if (currentCompany && currentPosition && currentStartDate) {
            console.log("Saving final work experience: " + currentPosition + " at " + currentCompany);
            // Parse dates
            const startDate = currentStartDate ? this.parseDate(currentStartDate) : new Date();
            let endDate = null;
            if (currentEndDate && currentEndDate !== 'Present') {
                endDate = this.parseDate(currentEndDate);
            }
            // Add the experience entry
            experience.push({
                id: uuidv4(),
                company: currentCompany,
                title: currentPosition,
                startDate,
                endDate,
                location: currentLocation || '',
                description: currentSupervisor || '',
                achievements: currentAchievements,
                technologies: [] // No specific technologies mentioned in CV
            });
            console.log("Added final work experience: " + currentPosition + " at " + currentCompany);
        }
        console.log("Extracted " + experience.length + " work experiences in total");
        return experience;
    }
    /**
     * Parse education entries
     */
    parseEducation() {
        const education = [];
        const educationSection = this.getSectionLines('**EDUCATION**');
        if (educationSection.length === 0) {
            console.log("No EDUCATION section found.");
            return education;
        }
        console.log("RAW EDUCATION SECTION:");
        educationSection.forEach((line, i) => console.log("[" + i + "]: " + line));
        let currentFieldOfStudy = '';
        let currentInstitution = '';
        let currentCompletionYear = '';
        for (let i = 0; i < educationSection.length; i++) {
            const line = educationSection[i].trim();
            // Field of study pattern in Dawn's CV: * **Coursework:** Subject
            if (line.startsWith('* **') && line.includes(':**')) {
                // If we were processing an education entry, save it first
                if (currentFieldOfStudy && currentInstitution) {
                    console.log("Saving education entry: " + currentFieldOfStudy + " at " + currentInstitution);
                    education.push({
                        id: uuidv4(),
                        institution: currentInstitution,
                        degree: 'Certificate', // Default since specific degree not provided
                        fieldOfStudy: currentFieldOfStudy,
                        startDate: new Date(parseInt(currentCompletionYear || '2000') - 1, 0, 1), // Year before completion
                        endDate: currentCompletionYear ? new Date(parseInt(currentCompletionYear), 11, 31) : null,
                        gpa: null, // Not specified in CV
                        activities: [],
                        achievements: []
                    });
                    console.log("Added education entry: " + currentFieldOfStudy + " at " + currentInstitution);
                    // Reset for next entry
                    currentInstitution = '';
                    currentCompletionYear = '';
                }
                // Extract field of study from the current line
                const fieldMatch = line.match(/\* \*\*(.*?):\*\*/);
                if (fieldMatch) {
                    currentFieldOfStudy = fieldMatch[1].trim();
                    console.log("Found field of study: " + currentFieldOfStudy);
                }
                continue;
            }
            // Institution line (indented bullet after field of study)
            if (line.startsWith('    *')) {
                currentInstitution = line.replace(/^\s*\* /, '').trim();
                console.log("Found institution: " + currentInstitution);
                continue;
            }
            // Completion year - Dawn's format: "Completed: YYYY"
            if (line.includes('Completed:')) {
                const yearMatch = line.match(/Completed: (\d{4})/);
                if (yearMatch) {
                    currentCompletionYear = yearMatch[1];
                    console.log("Found completion year: " + currentCompletionYear);
                }
                continue;
            }
        }
        // Add the last entry if it exists
        if (currentFieldOfStudy && currentInstitution) {
            console.log("Saving final education entry: " + currentFieldOfStudy + " at " + currentInstitution);
            education.push({
                id: uuidv4(),
                institution: currentInstitution,
                degree: 'Certificate', // Default since specific degree not provided
                fieldOfStudy: currentFieldOfStudy,
                startDate: new Date(parseInt(currentCompletionYear || '2000') - 1, 0, 1), // Year before completion
                endDate: currentCompletionYear ? new Date(parseInt(currentCompletionYear), 11, 31) : null,
                gpa: null, // Not specified in CV
                activities: [],
                achievements: []
            });
            console.log("Added final education entry: " + currentFieldOfStudy + " at " + currentInstitution);
        }
        console.log("Extracted " + education.length + " education entries in total");
        return education;
    }
    /**
     * Helper to add an education entry from parsed data
     */
    addEducationEntry(education, fieldOfStudy, institution, completionYear) {
        let startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1); // Estimate 1 year for completion
        let endDate = null;
        if (completionYear) {
            endDate = new Date(parseInt(completionYear), 11, 31); // December 31st of completion year
        }
        education.push({
            id: uuidv4(),
            institution,
            degree: 'Certificate', // Default since specific degree not provided
            fieldOfStudy,
            startDate,
            endDate,
            gpa: null, // Not specified in CV
            activities: [],
            achievements: []
        });
    }
    /**
     * Parse certifications and licenses
     */
    parseCertifications() {
        const certifications = [];
        const certSection = this.getSectionLines('**CERTIFICATIONS & LICENSES**');
        if (certSection.length === 0) {
            console.log("No CERTIFICATIONS & LICENSES section found.");
            return certifications;
        }
        console.log("RAW CERTIFICATIONS SECTION - First few lines:");
        certSection.slice(0, 5).forEach((line, i) => console.log("[" + i + "]: " + line));
        for (let i = 0; i < certSection.length; i++) {
            const line = certSection[i].trim();
            // Skip empty lines
            if (!line)
                continue;
            // Certification pattern: * **Certification Name** (Issuer)
            if (line.startsWith('* **')) {
                // Extract certification name
                const nameMatch = line.match(/\* \*\*(.*?)[,\*]/);
                if (!nameMatch) {
                    console.log("Couldn't extract certification name from: " + line);
                    continue;
                }
                const name = nameMatch[1].trim();
                console.log("Found certification: " + name);
                // Extract issuer if available on the same line
                let issuer = '';
                const issuerMatch = line.match(/\((.*?)\)/);
                if (issuerMatch) {
                    issuer = issuerMatch[1].trim();
                    console.log("Found issuer: " + issuer);
                }
                // Look for date information in subsequent lines
                let dateObtained = new Date();
                let expirationDate = null;
                let credentialId = null;
                let credentialURL = null;
                // Check the next few lines for date information
                for (let j = i + 1; j < Math.min(i + 5, certSection.length); j++) {
                    const dateLine = certSection[j].trim();
                    // Skip if we've reached a new certification
                    if (dateLine.startsWith('* **'))
                        break;
                    // Look for issue dates
                    if (dateLine.includes('Issued:') || dateLine.includes('Held:')) {
                        console.log("Found date line: " + dateLine);
                        const dateRangeMatch = dateLine.match(/(Issued|Held): (.*?) ?[-–] ?(Current|\d{4})/);
                        if (dateRangeMatch) {
                            // Parse start date
                            const startDateStr = dateRangeMatch[2].trim();
                            const startYearMatch = startDateStr.match(/\d{4}/);
                            if (startYearMatch) {
                                dateObtained = new Date(parseInt(startYearMatch[0]), 0, 1); // January 1st of year
                                console.log("Set date obtained to: " + dateObtained.toISOString());
                            }
                            // If there's an end date that's not "Current"
                            if (dateRangeMatch[3] && dateRangeMatch[3] !== 'Current') {
                                const endYear = parseInt(dateRangeMatch[3]);
                                expirationDate = new Date(endYear, 11, 31); // December 31st of year
                                console.log("Set expiration date to: " + expirationDate.toISOString());
                            }
                        }
                    }
                }
                // Add certification
                certifications.push({
                    id: uuidv4(),
                    name,
                    issuer: issuer || 'Unknown',
                    dateObtained,
                    expirationDate,
                    credentialId,
                    credentialURL
                });
                console.log("Added certification: " + name + " (" + (issuer || 'Unknown') + ")");
            }
        }
        console.log("Extracted " + certifications.length + " certifications in total");
        return certifications;
    }
    /**
     * Parse volunteer experience as projects
     */
    parseVolunteerExperience() {
        const projects = [];
        const volunteerSection = this.getSectionLines('**VOLUNTEER / COMMUNITY SERVICE EXPERIENCE**');
        if (volunteerSection.length === 0) {
            return projects;
        }
        let currentOrg = null;
        let currentLocation = null;
        let currentRole = null;
        let currentDates = null;
        let currentHighlights = [];
        for (let i = 0; i < volunteerSection.length; i++) {
            const line = volunteerSection[i].trim();
            // Skip empty lines
            if (!line)
                continue;
            // Organization pattern: * **Organization Name**
            if (line.startsWith('* **') && line.endsWith('**')) {
                // If we were processing an organization, save it first
                if (currentOrg) {
                    this.addProjectEntry(projects, currentOrg, currentLocation, currentRole, currentDates, currentHighlights);
                    // Reset for new organization
                    currentLocation = null;
                    currentRole = null;
                    currentDates = null;
                    currentHighlights = [];
                }
                currentOrg = line.replace(/\* \*\*|\*\*/g, '').trim();
                continue;
            }
            // Location (usually follows organization)
            if (line.startsWith('    *') && !currentLocation) {
                currentLocation = line.replace(/^\s*\*\s*/, '').trim();
                continue;
            }
            // Role (volunteer position)
            if (line.includes('Volunteer') || line.includes('Service')) {
                currentRole = line.replace(/^\s*\*\s*/, '').trim();
                continue;
            }
            // Skip supervisor and hours lines
            if (line.includes('Supervisor:') || line.includes('Approx. Hours')) {
                continue;
            }
            // Dates of service
            if (line.includes('Dates of Service:')) {
                currentDates = line.replace('Dates of Service:', '').trim();
                continue;
            }
            // Highlights/Responsibilities
            if (line.startsWith('    *') && line.includes('Provided') || line.includes('Assisted') || line.includes('Managed')) {
                currentHighlights.push(line.replace(/^\s*\*\s*/, '').trim());
                continue;
            }
        }
        // Add the last organization if it exists
        if (currentOrg) {
            this.addProjectEntry(projects, currentOrg, currentLocation, currentRole, currentDates, currentHighlights);
        }
        return projects;
    }
    /**
     * Helper to add a project entry from parsed data
     */
    addProjectEntry(projects, name, location, role, dates, highlights) {
        // Create description from role and location
        const description = [
            role ? ("Role: " + role) : '',
            location ? ("Location: " + location) : ''
        ].filter(Boolean).join(', ');
        // Parse dates if available
        let startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1); // Default to 1 year ago if dates unknown
        let endDate = null;
        // Extract date if available
        if (dates) {
            const dateMatch = dates.match(/(\d{4})/);
            if (dateMatch) {
                startDate = new Date(parseInt(dateMatch[1]), 0, 1);
            }
        }
        projects.push({
            id: uuidv4(),
            name,
            description,
            startDate,
            endDate,
            url: null,
            technologies: [],
            highlights
        });
    }
    /**
     * Parse a date string into a Date object
     */
    parseDate(dateString) {
        if (!dateString) {
            return new Date();
        }
        // Month name to number mapping
        const months = {
            'January': 0,
            'February': 1,
            'March': 2,
            'April': 3,
            'May': 4,
            'June': 5,
            'July': 6,
            'August': 7,
            'September': 8,
            'October': 9,
            'November': 10,
            'December': 11
        };
        // Handle formats like "January 2023"
        const monthYearMatch = dateString.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/);
        if (monthYearMatch) {
            const month = months[monthYearMatch[1]] || 0;
            const year = parseInt(monthYearMatch[2]);
            return new Date(year, month, 1); // First day of month
        }
        // Handle just year like "2023"
        const yearMatch = dateString.match(/^\d{4}$/);
        if (yearMatch) {
            return new Date(parseInt(dateString), 0, 1); // January 1st of year
        }
        // Default return current date if format not recognized
        return new Date();
    }
}
// Export a factory function for easier use
export function createProfileFromMarkdown(markdownContent) {
    const parser = new MarkdownProfileParser(markdownContent);
    return parser.parse();
}
//# sourceMappingURL=markdown-profile-parser.js.map