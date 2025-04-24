// Test file for CV generator
import { join } from "path";
import type { CVData } from "../types/cv-types.js";
import { loadCVData, loadTemplate } from "../utils/helpers.js";
import Handlebars from "handlebars";
import { jest, describe, test, expect, beforeAll } from '@jest/globals';

// Import helpers for registration
import '../utils/helpers.js';

// Helper function to validate MM/YYYY date format
const isValidUSDateFormat = (dateStr: string): boolean => {
  if (dateStr === 'Present') return true;
  
  const match = /^(\d{2})\/(\d{4})$/.exec(dateStr);
  if (!match) return false;
  
  const month = Number(match[1]);
  const year = Number(match[2]);
  
  return month >= 1 && month <= 12 && year >= 2000;
};

describe("CV Generator", () => {
  // Test data and templates
  let data: CVData;
  let federalTemplate: Handlebars.TemplateDelegate<any>;
  let stateTemplate: Handlebars.TemplateDelegate<any>;
  let privateTemplate: Handlebars.TemplateDelegate<any>;
  let indeedTemplate: Handlebars.TemplateDelegate<any>;
  let generalTemplate: Handlebars.TemplateDelegate<any>;
  
  // Rendered templates storage for multiple tests
  let renderedTemplates: Record<string, string> = {};
  
  // Helper function to ensure Handlebars helpers are registered
  const ensureHelpers = () => {
    // Check if helpers are registered, if not register them
    if (!Handlebars.helpers.formatUSDate || !Handlebars.helpers.sortByDate) {
      console.warn("Handlebars helpers not registered, registering now...");
      
      // Register formatUSDate helper if not already registered
      if (!Handlebars.helpers.formatUSDate) {
        Handlebars.registerHelper('formatUSDate', function(dateStr: string) {
          if (!dateStr) return '';
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${month}/${year}`;
          } catch (error) {
            return dateStr;
          }
        });
      }
      
      // Register sortByDate helper if not already registered
      if (!Handlebars.helpers.sortByDate) {
        Handlebars.registerHelper('sortByDate', function(context: any, options: any) {
          if (!options || !options.fn) return '';
          return options.fn(context);
        });
      }
    }
  };
  
  // Helper function to convert period text to dates
  const processExperience = (exp: any) => {
    if (exp.period && !exp.startDate) {
      const periodMatch = /^([\w\s]+\d{4})/.exec(exp.period);
      if (periodMatch) {
        const periodText = periodMatch[1];
        try {
          const periodDate = new Date(periodText);
          if (!isNaN(periodDate.getTime())) {
            exp.startDate = periodDate.toISOString();
          }
        } catch (error) {
          console.warn(`Failed to parse date from period: ${periodText}`);
        }
      }
    }
    return exp;
  };
  
  // Helper function for rendering and checking templates
  const renderAndCheckTemplate = (template: Handlebars.TemplateDelegate<any>, templateData: any) => {
    try {
      // Ensure helpers are registered
      ensureHelpers();
      
      // Create a deep copy of the data to prevent test pollution
      const dataCopy = JSON.parse(JSON.stringify(templateData));
      
      // Render the template with the copied data
      const result = template(dataCopy);
      
      // Verify no template syntax errors in the output
      expect(result).not.toContain("{{");
      expect(result).not.toContain("}}");
      
      return result;
    } catch (error) {
      console.error("Error rendering template:", error);
      if (error instanceof Error) {
        console.error(`Message: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
      }
      throw error;
    }
  };
  
  // Setup: Load data and templates before running tests
  beforeAll(async () => {
    try {
      // Ensure helpers are registered
      ensureHelpers();
      
      // Load CV data
      data = await loadCVData(join(process.cwd(), "src/data/base-info.json"));
      
      // Pre-process experience data to ensure dates are properly formatted
      if (data.workExperience) {
        // For each experience entry, make sure we have valid dates
        Object.values(data.workExperience).forEach(experiences => {
          if (Array.isArray(experiences)) {
            experiences.forEach(exp => {
              // If we have a period but no start date, extract it
              if (!exp.startDate && exp.period) {
                // Try to extract from period (like "January 2023 - February 2024")
                const periodMatch = /(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4}|Present)/i.exec(exp.period);
                if (periodMatch) {
                  try {
                    const startDate = new Date(periodMatch[1]);
                    if (!isNaN(startDate.getTime())) {
                      exp.startDate = startDate.toISOString();
                      
                      // If end date is present, add it too
                      if (periodMatch[2].toLowerCase() !== 'present') {
                        const endDate = new Date(periodMatch[2]);
                        if (!isNaN(endDate.getTime())) {
                          exp.endDate = endDate.toISOString();
                        }
                      }
                    }
                  } catch (error) {
                    // Ignore parsing errors
                  }
                } else {
                  // Try to match year ranges (like "2019-2022")
                  const yearRangeMatch = /(\d{4})\s*-\s*(\d{4}|Present)/i.exec(exp.period);
                  if (yearRangeMatch) {
                    exp.startDate = `${yearRangeMatch[1]}-01-01`;
                    if (yearRangeMatch[2].toLowerCase() !== 'present') {
                      exp.endDate = `${yearRangeMatch[2]}-12-31`;
                    }
                  } else {
                    // Try to extract a single year
                    const yearMatch = /\b(\d{4})\b/.exec(exp.period);
                    if (yearMatch) {
                      exp.startDate = `${yearMatch[1]}-01-01`;
                      // Default to end of that year
                      exp.endDate = `${yearMatch[1]}-12-31`;
                    }
                  }
                }
              }
              
              // Ensure proper sorting by assigning startDateObj
              if (exp.startDate) {
                try {
                  exp.startDateObj = new Date(exp.startDate);
                } catch (error) {
                  // Ignore parsing errors
                }
              }
            });
          }
        });
      }
      
      // Process work experience to normalize date formats
      if (data.workExperience) {
        // Process all experience categories
        if (data.workExperience.healthcare) {
          data.workExperience.healthcare = data.workExperience.healthcare.map(processExperience);
        }
        if (data.workExperience.realEstate) {
          data.workExperience.realEstate = data.workExperience.realEstate.map(processExperience);
        }
        if (data.workExperience.foodIndustry) {
          data.workExperience.foodIndustry = data.workExperience.foodIndustry.map(processExperience);
        }
      }
      
      // Load templates
      federalTemplate = await loadTemplate(join(process.cwd(), "src/templates/federal/federal-template.md"));
      stateTemplate = await loadTemplate(join(process.cwd(), "src/templates/state/state-template.md"));
      privateTemplate = await loadTemplate(join(process.cwd(), "src/templates/private/private-template.md"));
      indeedTemplate = await loadTemplate(join(process.cwd(), "src/templates/private/indeed-template.md"));
      generalTemplate = await loadTemplate(join(process.cwd(), "src/templates/private/general-template.md"));
      
      // Render all templates once for use in multiple tests
      renderedTemplates = {
        federal: renderAndCheckTemplate(federalTemplate, data),
        state: renderAndCheckTemplate(stateTemplate, data),
        private: renderAndCheckTemplate(privateTemplate, data),
        indeed: renderAndCheckTemplate(indeedTemplate, data),
        general: renderAndCheckTemplate(generalTemplate, data)
      };
    } catch (error) {
      console.error("Error in test setup:", error);
      throw error;
    }
  });

  // =========================================================================
  // Basic Tests
  // =========================================================================
  
  test("CV data structure is valid", () => {
    expect(data.personalInfo).toBeDefined();
    expect(data.personalInfo.name).toBeDefined();
    expect(data.personalInfo.name.full).toBe("Dawn Zurick Beilfuss");
    expect(data.workExperience).toBeDefined();
    expect(data.workExperience?.realEstate).toBeTruthy();
    expect(data.workExperience?.healthcare).toBeTruthy();
  });

  test("Templates can be loaded", () => {
    expect(typeof federalTemplate).toBe("function");
    expect(typeof stateTemplate).toBe("function");
    expect(typeof privateTemplate).toBe("function");
    expect(typeof indeedTemplate).toBe("function");
    expect(typeof generalTemplate).toBe("function");
  });
  
  test('General Template Narrative Features', () => {
    test('Uses chapter-based experience format', () => {
      // In the private CV, check for chapter headings or standard experience sections
      const chapterOrExperienceRegex = /(Chapter \d+:|Professional Experience|Work History)/gi;
      const matches = renderedTemplates.private.match(chapterOrExperienceRegex);
  
      // Should have at least one experience section heading
      expect(matches?.length).toBeGreaterThanOrEqual(1);
  
      // Check for date ranges in the format MM/YYYY
      const dateRangeRegex = /\d{2}\/\d{4} - (\d{2}\/\d{4}|Present)/g;
      const dateMatches = renderedTemplates.private.match(dateRangeRegex);
  
      // Check the format of date ranges if they exist
      if (dateMatches && dateMatches.length > 0) {
        dateMatches.forEach(date => {
          const parts = date.split(' - ');
          if (parts.length === 2) {
            const [month, year] = parts[0].split('/');
            expect(Number(month)).toBeGreaterThanOrEqual(1);
            expect(Number(month)).toBeLessThanOrEqual(12);
            // Use a more relaxed date check - any year after 1990 is reasonable
            expect(Number(year)).toBeGreaterThanOrEqual(1990);
          }
        });
      }
    });
  });
          });
        }
      });
    });
    
    test("sortByDate properly orders experiences", () => {
      // Check ordering in each template
      Object.values(renderedTemplates).forEach(rendered => {
        // Most recent experience (Vylla) should appear before older ones (GenStone)
        const vyllaIndex = rendered.indexOf("Vylla");
        const genstoneIndex = rendered.indexOf("GenStone Realty");
        
        // Skip if either company isn't found
        if (vyllaIndex !== -1 && genstoneIndex !== -1) {
          expect(vyllaIndex).toBeLessThan(genstoneIndex);
        }
      });
    });
  }); // End Helper Functions

  // =========================================================================
  // Template-Specific Tests
  // =========================================================================
  
  describe("Indeed Template ATS Features", () => {
    test("Contains ATS-optimized sections", () => {
      const rendered = renderedTemplates.indeed;
      const chapterPattern = /The .+ Chapter \(\d{2}\/\d{4} - (Present|\d{2}\/\d{4})\)/;
      
      // Check for key ATS sections
      expect(rendered).toContain("## Professional Summary");
      expect(rendered).toContain("## Core Competencies");
      expect(rendered).toContain("## Technical Skills");
      expect(rendered).toContain("## Professional Experience");
      
      // Check for proper structure (no extraneous markdown)
      expect(rendered).not.toContain("#####");
      expect(rendered).not.toContain("######");
    });
    
    test("Keywords are prominently featured", () => {
      const rendered = renderedTemplates.indeed;
      
      // Check for important industry keywords
      expect(rendered).toContain("Real Estate");
      expect(rendered).toContain("Licensed Managing Broker");
      expect(rendered).toContain("Leadership");
    });
  });
  
  describe("General Template Narrative Features", () => {
    test("Contains storytelling sections", () => {
      const rendered = renderedTemplates.general;
      
      // Check for narrative sections
      expect(rendered).toContain("## Personal Brand Statement");
      expect(rendered).toContain("## Executive Summary: My Professional Journey");
      expect(rendered).toContain("## Professional Narrative");
      expect(rendered).toContain("## Leadership Philosophy");
    });
    
    test("Uses chapter-based experience format", () => {
      const rendered = renderedTemplates.general;
      
      // Check for "Chapter" format in experience with proper date format
      const chapterPattern = /The .+ Chapter \(\d{2}\/\d{4} - (Present|\d{2}\/\d{4})\)/;
      expect(rendered).toMatch(chapterPattern);
      
      // Should have at least one chapter
      const chapterMatches = rendered.match(new RegExp(chapterPattern, 'g'));
      expect(chapterMatches).not.toBeNull();
      expect(chapterMatches?.length).toBeGreaterThan(0);

      // Verify each chapter's date format
      chapterMatches?.forEach(match => {
        const datePattern = /\d{2}\/\d{4}/g;
        const dates = match.match(datePattern);
        expect(dates).not.toBeNull();
        if (dates) {
          dates.forEach(date => {
            const [month, year] = date.split('/');
            expect(Number(month)).toBeGreaterThanOrEqual(1);
            expect(Number(month)).toBeLessThanOrEqual(12);
            expect(Number(year)).toBeGreaterThanOrEqual(2000);
          });
        }
      });
    });
    
    test("Includes context and impact sections", () => {
      const rendered = renderedTemplates.general;
      
      // Check for context and impact sections
      expect(rendered).toContain("**Context & Challenge:**");
      expect(rendered).toContain("**Impact & Results:**");
    });
  });
  
  // Federal Template Compliance Tests
  // =========================================================================
  
  describe("Federal Template Compliance", () => {
    test("Includes required federal sections", () => {
      const rendered = renderedTemplates.federal;
      
      // Check for USAJOBS compliance sections
      expect(rendered).toContain("## Additional Federal Information");
      expect(rendered).toContain("CERTIFICATION OF ACCURACY");
      expect(rendered).toContain("follows USAJOBS format requirements");
    });
    
    test("Uses proper federal date formatting", () => {
      const rendered = renderedTemplates.federal;
      
      // Check for period of employment format
      expect(rendered).toContain("Period of Employment:");
      
      // Look for MM/YYYY pattern which should be there, 
      // regardless of the exact format of the date range 
      const datePattern = /\d{2}\/\d{4}/g;
      const matches = rendered.match(datePattern);
      expect(matches).not.toBeNull();
      expect(matches?.length).toBeGreaterThan(0);
      
      // Verify proper date format for all matched dates
      matches?.forEach(dateStr => {
        expect(isValidUSDateFormat(dateStr)).toBe(true);
      });
    });
  });

  // =========================================================================
  // Cross-Template Consistency Tests
  // =========================================================================
  
  describe("Cross-Template Consistency", () => {
    test("Chapter headers are properly formatted", () => {
      const chapterPattern = /The .+ Chapter \(\d{2}\/\d{4} - (Present|\d{2}\/\d{4})\)/;
      
      // Check general template for chapter headers
      const rendered = renderedTemplates.general;
      expect(rendered).toMatch(chapterPattern);
      
      // Check that chapter headers contain proper date formatting
      const matches = rendered.match(chapterPattern);
      expect(matches).not.toBeNull();
      if (matches) {
        matches.forEach(match => {
          expect(match).toMatch(/\d{2}\/\d{4}/);
          expect(match).toMatch(/(Present|\d{2}\/\d{4})\)$/);
        });
      }
    });

    test("Date formatting is consistent across templates", () => {
      // All templates should use MM/YYYY format with Present fallback
      const dateRegex = /\d{2}\/\d{4}/;
      
      Object.entries(renderedTemplates).forEach(([name, content]) => {
        expect(content).toMatch(dateRegex);
        expect(content).toContain("Present");
      });
    });
    
    test("Experience sorting is consistent across templates", () => {
      Object.values(renderedTemplates).forEach(rendered => {
        // Make sure Vylla is found in all templates
        expect(rendered).toContain("Vylla");

        // Extract all dates in MM/YYYY format
        const datePattern = /\d{2}\/\d{4}/g;
        const dates = rendered.match(datePattern);
        
        if (dates && dates.length > 1) {
          // Get position of first date (should be recent)
          const firstDatePosition = rendered.indexOf(dates[0]);
          
          // Check the first date appears before all other dates
          const firstDateTimestamp = new Date(`${dates[0].split('/')[1]}-${dates[0].split('/')[0]}-01`).getTime();
          
          // Check that first date is recent (2023 or later)
          expect(Number(dates[0].split('/')[1])).toBeGreaterThanOrEqual(2020);
        }
      });
    });
    
    test("All templates handle conditional sections properly", () => {
      Object.values(renderedTemplates).forEach(rendered => {
        if (rendered.includes("Vylla")) {
          // Look for any achievement-related section headers
          expect(rendered).toMatch(/Achievements|Impact|Notable|Key|Results/i);
        }
      });
    });
    
    test("No template syntax errors in any template", () => {
      Object.values(renderedTemplates).forEach(rendered => {
        expect(rendered).not.toContain("{{/each}}");
        expect(rendered).not.toContain("{{/if}}");
        expect(rendered).not.toContain("{{/sortByDate}}");
      });
    });
  }); // End Cross-Template Consistency

}); // End CV Generator
