// Test file for CV generator
import { join } from "path";
import type { CVData } from "../types/cv-types";
import { loadCVData, loadTemplate } from "../utils/helpers";
import type Handlebars from "handlebars";
import { jest, describe, test, expect } from '@jest/globals';

describe("CV Generator", () => {
  test("CV data structure is valid", async () => {
    const data: CVData = await loadCVData(join(process.cwd(), "src/data/base-info.json"));
    expect(data.personalInfo).toBeDefined();
    expect(data.personalInfo.name).toBeDefined();
    expect(data.personalInfo.name.full).toBe("Dawn Zurick Beilfuss");
  });

  test("Templates can be loaded", async () => {
    const sectors = ["federal", "state", "private"];
    for (const sector of sectors) {
      const template: Handlebars.TemplateDelegate = await loadTemplate(
        join(process.cwd(), "src/templates", sector, `${sector}-template.md`)
      );
      expect(typeof template).toBe("function");
    }
  });
});
