import OpenAIClient from '../../../core/services/llm/OpenAIClient.js';
/**
 * Tool for distilling CV content to a single page using an LLM
 */
export const distillContentTool = {
    name: 'distill_content',
    description: 'Distills multi-page CV content into a single-page summary',
    parameters: {
        type: 'object',
        required: ['cvData'],
        properties: {
            cvData: {
                type: 'object',
                description: 'Structured CV data',
            },
        },
    },
    async execute(input) {
        const startTime = Date.now();
        const { cvData, targetSections = [], maxLength = 2000, style = 'professional' } = input;
        // Calculate original content length
        const originalText = stringifyCV(cvData);
        const originalLength = originalText.length;
        // Use OpenAI client for actual content distillation
        const llmOptions = {
            style,
            targetSections,
            maxLength
        };
        const llmResult = await OpenAIClient.distill(cvData, llmOptions);
        const distilledContent = llmResult.content;
        const distilledLength = distilledContent.length;
        const reductionRatio = originalLength > 0 ? 1 - (distilledLength / originalLength) : 0;
        const processingTime = Date.now() - startTime;
        // Determine which sections were included based on content analysis
        const sectionsIncluded = determineSectionsIncluded(cvData, distilledContent);
        return {
            distilledContent,
            sectionsIncluded,
            reductionRatio,
            metadata: {
                originalLength,
                distilledLength,
                processingTime,
                llmModel: llmResult.model,
                confidence: 0.90 // High confidence with actual LLM
            }
        };
    },
};
/**
 * Tool for optimizing distilled content to fit a single-page layout
 */
export const optimizeContentTool = {
    name: 'optimize_content',
    description: 'Optimizes distilled content for single-page layout',
    parameters: {
        type: 'object',
        required: ['distilledContent'],
        properties: {
            distilledContent: {
                type: 'string',
                description: 'Content distilled by LLM',
            },
        },
    },
    async execute(input) {
        const { distilledContent, layoutConstraints, prioritySections = [] } = input;
        // Default layout constraints for single-page PDF
        const constraints = layoutConstraints || {
            maxLines: 45, // Typical single-page limit
            maxCharactersPerLine: 80,
            pageFormat: 'Letter',
            margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
        };
        const optimizations = [];
        const originalLength = distilledContent.length;
        // First try OpenAI optimization
        try {
            const llmResult = await OpenAIClient.optimize(distilledContent, {
                maxLines: constraints.maxLines,
                maxCharactersPerLine: constraints.maxCharactersPerLine,
                pageFormat: constraints.pageFormat
            });
            let optimizedContent = llmResult.content;
            optimizations.push('Applied LLM-based layout optimization');
            // Apply additional local optimizations if needed
            const preliminaryLines = estimateLines(optimizedContent, constraints.maxCharactersPerLine);
            if (preliminaryLines > constraints.maxLines) {
                // Apply fallback optimizations
                optimizedContent = optimizedContent.replace(/\n\s*\n/g, '\n');
                optimizations.push('Removed excessive whitespace');
                optimizedContent = optimizedContent.replace(/\n•\s*/g, ' • ');
                optimizations.push('Condensed bullet points to inline format');
                if (estimateLines(optimizedContent, constraints.maxCharactersPerLine) > constraints.maxLines) {
                    optimizedContent = applyAbbreviations(optimizedContent);
                    optimizations.push('Applied common abbreviations');
                }
                // Final truncation if still too long
                if (estimateLines(optimizedContent, constraints.maxCharactersPerLine) > constraints.maxLines) {
                    const targetLength = Math.floor(originalLength * 0.7);
                    optimizedContent = optimizedContent.substring(0, targetLength) + '...';
                    optimizations.push('Applied aggressive truncation to fit page');
                }
            }
            const finalLines = estimateLines(optimizedContent, constraints.maxCharactersPerLine);
            const compressionRatio = 1 - (optimizedContent.length / originalLength);
            return {
                optimizedContent,
                layoutMetrics: {
                    estimatedLines: finalLines,
                    fitsOnSinglePage: finalLines <= constraints.maxLines,
                    compressionRatio
                },
                optimizations
            };
        }
        catch (error) {
            console.warn('LLM optimization failed, falling back to local optimization:', error);
            // Fallback to local optimization
            let optimizedContent = distilledContent;
            // Apply local optimization strategies
            optimizedContent = optimizedContent.replace(/\n\s*\n/g, '\n');
            if (optimizedContent.length < originalLength) {
                optimizations.push('Removed excessive whitespace');
            }
            optimizedContent = optimizedContent.replace(/\n•\s*/g, ' • ');
            if (optimizedContent.includes(' • ')) {
                optimizations.push('Condensed bullet points to inline format');
            }
            if (estimateLines(optimizedContent, constraints.maxCharactersPerLine) > constraints.maxLines) {
                optimizedContent = applyAbbreviations(optimizedContent);
                optimizations.push('Applied common abbreviations');
            }
            const estimatedLines = estimateLines(optimizedContent, constraints.maxCharactersPerLine);
            const fitsOnSinglePage = estimatedLines <= constraints.maxLines;
            const compressionRatio = 1 - (optimizedContent.length / originalLength);
            if (!fitsOnSinglePage) {
                const targetLength = Math.floor(originalLength * 0.7);
                optimizedContent = optimizedContent.substring(0, targetLength) + '...';
                optimizations.push('Applied aggressive truncation to fit page');
            }
            return {
                optimizedContent,
                layoutMetrics: {
                    estimatedLines: estimateLines(optimizedContent, constraints.maxCharactersPerLine),
                    fitsOnSinglePage: estimateLines(optimizedContent, constraints.maxCharactersPerLine) <= constraints.maxLines,
                    compressionRatio
                },
                optimizations
            };
        }
    },
};
/**
 * Helper function to convert CV data to text for length calculation
 */
function stringifyCV(cvData) {
    const sections = [];
    // Personal info
    sections.push(`Name: ${cvData.personalInfo.name.full}`);
    sections.push(`Email: ${cvData.personalInfo.contact.email}`);
    if (cvData.personalInfo.contact.phone) {
        sections.push(`Phone: ${cvData.personalInfo.contact.phone}`);
    }
    // Experience - handle both direct array and nested object structure
    let experienceData = [];
    if (Array.isArray(cvData.experience)) {
        experienceData = cvData.experience;
    }
    else if (cvData.workExperience) {
        // Handle nested structure from base-info.json
        const categories = ['healthcare', 'realEstate', 'foodIndustry'];
        categories.forEach(category => {
            if (cvData.workExperience[category] && Array.isArray(cvData.workExperience[category])) {
                experienceData = experienceData.concat(cvData.workExperience[category]);
            }
        });
    }
    if (experienceData.length > 0) {
        sections.push('EXPERIENCE:');
        experienceData.forEach(exp => {
            const title = exp.title || exp.position || 'Position';
            const company = exp.company || exp.employer || 'Company';
            const period = exp.period || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
            sections.push(`${title} at ${company} (${period})`);
            if (exp.responsibilities) {
                sections.push(...exp.responsibilities);
            }
            if (exp.duties && Array.isArray(exp.duties)) {
                sections.push(...exp.duties);
            }
            if (exp.description) {
                sections.push(exp.description);
            }
        });
    }
    // Education
    if (Array.isArray(cvData.education) && cvData.education.length > 0) {
        sections.push('EDUCATION:');
        cvData.education.forEach(edu => {
            const graduationDate = edu.graduationDate || edu.endDate || 'N/A';
            const degree = edu.degree || 'Degree';
            const institution = edu.institution || 'Institution';
            sections.push(`${degree} from ${institution} (${graduationDate})`);
        });
    }
    // Skills - handle both array and object structure
    let skillsArray = [];
    if (Array.isArray(cvData.skills)) {
        skillsArray = cvData.skills.map(skill => typeof skill === 'string' ? skill : skill?.name || '');
    }
    else if (cvData.skills && typeof cvData.skills === 'object') {
        // Handle object structure from base-info.json
        const skillCategories = ['managementAndLeadership', 'realEstateOperations', 'healthcareAdministration', 'technical', 'certifications', 'realEstateCertifications', 'leadership'];
        skillCategories.forEach(category => {
            if (cvData.skills[category] && Array.isArray(cvData.skills[category])) {
                skillsArray = skillsArray.concat(cvData.skills[category]);
            }
        });
    }
    if (skillsArray.length > 0) {
        sections.push(`SKILLS: ${skillsArray.join(', ')}`);
    }
    return sections.join('\n');
}
/**
 * Determine which sections were included in the distilled content
 */
function determineSectionsIncluded(cvData, distilledContent) {
    const sections = [];
    if (cvData.personalInfo?.name?.full && distilledContent.includes(cvData.personalInfo.name.full)) {
        sections.push('personalInfo');
    }
    // Check experience in both structures
    let hasExperienceContent = false;
    if (Array.isArray(cvData.experience)) {
        hasExperienceContent = cvData.experience.some(exp => {
            const company = exp.company || exp.employer || '';
            return company && distilledContent.includes(company);
        });
    }
    else if (cvData.workExperience) {
        const categories = ['healthcare', 'realEstate', 'foodIndustry'];
        hasExperienceContent = categories.some(category => {
            if (cvData.workExperience[category] && Array.isArray(cvData.workExperience[category])) {
                return cvData.workExperience[category].some(exp => {
                    const company = exp.company || exp.employer || '';
                    return company && distilledContent.includes(company);
                });
            }
            return false;
        });
    }
    if (hasExperienceContent) {
        sections.push('experience');
    }
    if (Array.isArray(cvData.education) && cvData.education.some(edu => distilledContent.includes(edu.institution || ''))) {
        sections.push('education');
    }
    // Check skills in both structures
    let hasSkillsContent = false;
    if (Array.isArray(cvData.skills)) {
        hasSkillsContent = cvData.skills.some(skill => {
            const skillName = typeof skill === 'string' ? skill : skill?.name || '';
            return skillName && distilledContent.includes(skillName);
        });
    }
    else if (cvData.skills && typeof cvData.skills === 'object') {
        const skillCategories = ['managementAndLeadership', 'realEstateOperations', 'healthcareAdministration', 'technical', 'certifications', 'realEstateCertifications', 'leadership'];
        hasSkillsContent = skillCategories.some(category => {
            if (cvData.skills[category] && Array.isArray(cvData.skills[category])) {
                return cvData.skills[category].some(skill => distilledContent.includes(skill));
            }
            return false;
        });
    }
    if (hasSkillsContent) {
        sections.push('skills');
    }
    return sections;
}
/**
 * Estimate number of lines for given text and character limit per line
 */
function estimateLines(text, maxCharactersPerLine) {
    const lines = text.split('\n');
    let totalLines = 0;
    for (const line of lines) {
        if (line.length === 0) {
            totalLines += 1; // Empty line
        }
        else {
            totalLines += Math.ceil(line.length / maxCharactersPerLine);
        }
    }
    return totalLines;
}
/**
 * Apply common abbreviations to reduce text length
 */
function applyAbbreviations(text) {
    const abbreviations = {
        'University': 'Univ.',
        'Bachelor': 'B.',
        'Master': 'M.',
        'Doctor': 'Dr.',
        'Management': 'Mgmt',
        'Development': 'Dev',
        'Engineering': 'Eng',
        'Technology': 'Tech',
        'Information': 'Info',
        'Department': 'Dept',
        'Corporation': 'Corp',
        'Company': 'Co.',
        'International': 'Intl',
        'Professional': 'Prof',
        'Experience': 'Exp',
        'Certificate': 'Cert',
        'Project': 'Proj',
        'Manager': 'Mgr',
        'Senior': 'Sr.',
        'Junior': 'Jr.',
        'Assistant': 'Asst'
    };
    let abbreviated = text;
    for (const [full, abbrev] of Object.entries(abbreviations)) {
        const regex = new RegExp(`\\b${full}\\b`, 'g');
        abbreviated = abbreviated.replace(regex, abbrev);
    }
    return abbreviated;
}
//# sourceMappingURL=llm-tools.js.map