import Handlebars from 'handlebars';
import { promises as fs } from 'fs';
import type { CVData } from '../types/cv-types.js';

interface Experience {
  date?: string;
  startDate: string;
  endDate?: string;
  [key: string]: unknown;
}

interface SortableItem {
  date: string;
  [key: string]: unknown;
}

export function registerHelpers() {
  // Register all helpers
  Handlebars.registerHelper('sortByDate', sortByDate);
  Handlebars.registerHelper('formatUSDate', formatUSDate);
  Handlebars.registerHelper('formatFederalDateRange', formatFederalDateRange);
  Handlebars.registerHelper('calculateGradeLevel', calculateGradeLevel);
  Handlebars.registerHelper('calculateTotalYears', calculateTotalYears);
  Handlebars.registerHelper('formatSalary', formatSalary);
  Handlebars.registerHelper('defaultValue', defaultValue);
  Handlebars.registerHelper('formatWithPrefix', formatWithPrefix);
}

export function sortByDate(items: SortableItem[]): SortableItem[] {
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatUSDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatFederalDateRange(start: string, end?: string): string {
  const startDate = formatUSDate(start);
  return end ? `${startDate} - ${formatUSDate(end)}` : `${startDate} - Present`;
}

export function calculateGradeLevel(experience: number): string {
  return `GS-${Math.min(Math.floor(experience / 2) + 7, 15)}`;
}

export function calculateTotalYears(experience: Experience[]): number {
  return experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0);
}

export function formatSalary(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function defaultValue<T>(value: T | undefined | null, defaultVal: T): T {
  return value ?? defaultVal;
}

export function formatWithPrefix(prefix: string, value: string): string {
  return value ? `${prefix}${value}` : '';
}

export async function loadTemplate(path: string): Promise<HandlebarsTemplateDelegate> {
  const template = await fs.readFile(path, 'utf-8');
  return Handlebars.compile(template);
}

export async function loadCVData(path: string): Promise<CVData> {
  const data = await fs.readFile(path, 'utf-8');
  return JSON.parse(data);
} 