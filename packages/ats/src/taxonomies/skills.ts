/**
 * Skill category definitions
 */
export enum SkillCategory {
  Programming = 'programming',
  Database = 'database',
  Cloud = 'cloud',
  DevOps = 'devops',
  Management = 'management',
  Design = 'design',
  Communication = 'communication',
  Soft = 'soft',
}

/**
 * Skill proficiency levels
 */
export enum ProficiencyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
}

/**
 * Skill definition with category and aliases
 */
export interface SkillDefinition {
  /** Primary name of the skill */
  name: string;
  /** Alternative names/variations */
  aliases?: string[];
  /** Skill category */
  category: SkillCategory;
  /** Related skills */
  related?: string[];
}

/**
 * Common programming languages and their aliases
 */
export const ProgrammingSkills: SkillDefinition[] = [
  {
    name: 'JavaScript',
    aliases: ['JS', 'ECMAScript', 'Node.js', 'NodeJS'],
    category: SkillCategory.Programming,
    related: ['TypeScript', 'React', 'Vue', 'Angular'],
  },
  {
    name: 'TypeScript',
    aliases: ['TS'],
    category: SkillCategory.Programming,
    related: ['JavaScript', 'Angular'],
  },
  {
    name: 'Python',
    aliases: ['py'],
    category: SkillCategory.Programming,
    related: ['Django', 'Flask', 'FastAPI'],
  },
  // Add more as needed
];

/**
 * Common database technologies and their aliases
 */
export const DatabaseSkills: SkillDefinition[] = [
  {
    name: 'PostgreSQL',
    aliases: ['Postgres', 'PSQL'],
    category: SkillCategory.Database,
    related: ['SQL', 'Database Design'],
  },
  {
    name: 'MongoDB',
    aliases: ['Mongo', 'Document DB'],
    category: SkillCategory.Database,
    related: ['NoSQL', 'Database Design'],
  },
  // Add more as needed
];

/**
 * Common cloud platforms and services
 */
export const CloudSkills: SkillDefinition[] = [
  {
    name: 'AWS',
    aliases: ['Amazon Web Services', 'Amazon Cloud'],
    category: SkillCategory.Cloud,
    related: ['Cloud Computing', 'DevOps'],
  },
  {
    name: 'Azure',
    aliases: ['Microsoft Azure', 'MS Azure'],
    category: SkillCategory.Cloud,
    related: ['Cloud Computing', 'DevOps'],
  },
  // Add more as needed
];

/**
 * Soft skills and their variations
 */
export const SoftSkills: SkillDefinition[] = [
  {
    name: 'Leadership',
    aliases: ['Team Lead', 'Project Lead'],
    category: SkillCategory.Management,
    related: ['Management', 'Team Building'],
  },
  {
    name: 'Communication',
    aliases: ['Written Communication', 'Verbal Communication'],
    category: SkillCategory.Communication,
    related: ['Presentation', 'Documentation'],
  },
  // Add more as needed
];

// Combine all skill definitions
export const AllSkills: SkillDefinition[] = [
  ...ProgrammingSkills,
  ...DatabaseSkills,
  ...CloudSkills,
  ...SoftSkills,
];

/**
 * Skill matching utilities
 */
export class SkillMatcher {
  private skillMap: Map<string, SkillDefinition>;
  private aliasMap: Map<string, string>;

  constructor(skills: SkillDefinition[] = AllSkills) {
    this.skillMap = new Map();
    this.aliasMap = new Map();
    
    skills.forEach(skill => {
      this.skillMap.set(skill.name.toLowerCase(), skill);
      skill.aliases?.forEach(alias => {
        this.aliasMap.set(alias.toLowerCase(), skill.name.toLowerCase());
      });
    });
  }

  /**
   * Find a skill by name or alias
   */
  public findSkill(name: string): SkillDefinition | undefined {
    const lowerName = name.toLowerCase();
    return (
      this.skillMap.get(lowerName) ||
      this.skillMap.get(this.aliasMap.get(lowerName) || '')
    );
  }

  /**
   * Get related skills for a given skill
   */
  public getRelatedSkills(name: string): SkillDefinition[] {
    const skill = this.findSkill(name);
    if (!skill?.related) return [];
    
    return skill.related
      .map(related => this.findSkill(related))
      .filter((s): s is SkillDefinition => s !== undefined);
  }

  /**
   * Find skills by category
   */
  public findByCategory(category: SkillCategory): SkillDefinition[] {
    return Array.from(this.skillMap.values())
      .filter(skill => skill.category === category);
  }

  /**
   * Check if two skills are related
   */
  public areRelated(skill1: string, skill2: string): boolean {
    const s1 = this.findSkill(skill1);
    const s2 = this.findSkill(skill2);
    
    if (!s1 || !s2) return false;
    
    return Boolean(
      s1.related?.includes(s2.name) ||
      s2.related?.includes(s1.name)
    );
  }
}

export const createSkillMatcher = (skills?: SkillDefinition[]): SkillMatcher =>
  new SkillMatcher(skills);

