// Test file for CV generator
import { join } from "path";
import type { CVData } from "../types/cv-types.js";
import { loadCVData, loadTemplate } from "../utils/helpers.js";
import Handlebars from "handlebars";
import { jest, describe, test, expect, beforeAll } from '@jest/globals';

// Import helpers for registration
import '../utils/helpers.js';

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
    expect(data.workExperience.realEstate).toBeTruthy();
    expect(data.workExperience.healthcare).toBeTruthy();
  });

  test("Templates can be loaded", () => {
    expect(typeof federalTemplate).toBe("function");
    expect(typeof stateTemplate).toBe("function");
    expect(typeof privateTemplate).toBe("function");
    expect(typeof indeedTemplate).toBe("function");
    expect(typeof generalTemplate).toBe("function");
  });
  
  test("Templates render without errors", () => {
    Object.entries(renderedTemplates).forEach(([name, content]) => {
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(100);
      expect(content).not.toContain("{{");
      expect(content).not.toContain("}}");
    });
  });

  // =========================================================================
  // Helper Function Tests
  // =========================================================================
  
  describe("Helper Functions", () => {
    test("formatUSDate formats dates correctly", () => {
      // Test by extracting date formats from rendered templates
      Object.values(renderedTemplates).forEach(rendered => {
        // Check for date format MM/YYYY
        const datePattern = /\d{2}\/\d{4}/g;
        const matches = rendered.match(datePattern);
        
        // Should have multiple date matches
        expect(matches?.length).toBeGreaterThan(1);
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
  });

  // =========================================================================
  // Template-Specific Tests
  // =========================================================================
  
  describe("Indeed Template ATS Features", () => {
    test("Contains ATS-optimized sections", () => {
      const rendered = renderedTemplates.indeed;
      
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
      
      // Check for "Chapter" format in experience
      const chapterPattern = /The .+ Chapter \(\d{2}\/\d{4} - (Present|\d{2}\/\d{4})\)/;
      expect(rendered).toMatch(chapterPattern);
      
      // Should have multiple chapters
      const chapterMatches = rendered.match(new RegExp(chapterPattern, 'g'));
      expect(chapterMatches?.length).toBeGreaterThan(1);
    });
    
    test("Includes context and impact sections", () => {
      const rendered = renderedTemplates.general;
      
      // Check for context and impact sections
      expect(rendered).toContain("**Context & Challenge:**");
      expect(rendered).toContain("**Impact & Results:**");
    });
  });
  
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
      expect(rendered).toMatch(/\d{2}\/\d{4} to (Present|\d{2}\/\d{4})/);
    });
  });

  // =========================================================================
  // Cross-Template Consistency Tests
  // =========================================================================
  
  describe("Cross-Template Consistency", () => {
    test("Date formatting is consistent across templates", () => {
      // All templates should use MM/YYYY format with Present fallback
      const dateRegex = /\d{2}\/\d{4}/;
      
      Object.entries(renderedTemplates).forEach(([name, content]) => {
        expect(content).toMatch(dateRegex);
        expect(content).toContain("Present");
      });
    });
    
    test("Experience sorting is consistent across templates", () => {
      // All templates should show experiences in reverse chronological order
      Object.values(renderedTemplates).forEach(rendered => {
        // Test different company pairs to ensure proper sorting
        [
          ["Vylla", "GenStone"],
          ["GenStone", "Better Homes"],
          ["Better Homes", "O.K. & Assoc"]
        ].forEach(([newer, older]) => {
          const newerIndex = rendered.indexOf(newer);
          const olderIndex = rendered.indexOf(older);
          
          // Skip if either company isn't found
          if (newerIndex === -1 || olderIndex === -1) return;
          
          expect(newerIndex).toBeLessThan(olderIndex);
        });
      });
    });
    
    test("All templates handle conditional sections properly", () => {
      Object.values(renderedTemplates).forEach(rendered => {
        // If experience with achievements is included, "Achievements" section should appear
        if (rendered.includes("Vylla")) {
          expect(rendered).toMatch(/Achievements|Impact|Notable|Key/);
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
  });
});
