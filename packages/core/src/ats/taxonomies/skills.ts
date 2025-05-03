/**
 * Skills taxonomy for resume analysis
 */

export interface SkillCategory {
  name: string;
  skills: string[];
  aliases?: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Programming Languages',
    skills: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby',
      'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'Scala', 'R'
    ]
  },
  {
    name: 'Web Technologies',
    skills: [
      'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express',
      'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'GraphQL', 'REST API'
    ]
  },
  {
    name: 'Databases',
    skills: [
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra', 'Neo4j'
    ]
  },
  {
    name: 'Cloud & DevOps',
    skills: [
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
      'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible', 'Prometheus'
    ]
  },
  {
    name: 'Machine Learning',
    skills: [
      'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras', 'NLP',
      'Computer Vision', 'Deep Learning', 'Neural Networks', 'OpenCV'
    ]
  },
  {
    name: 'Data Science',
    skills: [
      'Pandas', 'NumPy', 'Jupyter', 'Data Analysis', 'Data Visualization',
      'Matplotlib', 'Tableau', 'Power BI', 'Statistics', 'Big Data'
    ]
  },
  {
    name: 'Mobile Development',
    skills: [
      'iOS', 'Android', 'React Native', 'Flutter', 'Xamarin',
      'Swift UI', 'Kotlin Multiplatform', 'Mobile UI/UX'
    ]
  },
  {
    name: 'Testing & QA',
    skills: [
      'Jest', 'Mocha', 'Selenium', 'Cypress', 'JUnit', 'TestNG',
      'Unit Testing', 'Integration Testing', 'E2E Testing'
    ]
  },
  {
    name: 'Security',
    skills: [
      'Cybersecurity', 'Penetration Testing', 'OAuth', 'JWT',
      'Encryption', 'Security Auditing', 'OWASP', 'SSL/TLS'
    ]
  },
  {
    name: 'Project Management',
    skills: [
      'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence',
      'Project Planning', 'Risk Management', 'Team Leadership'
    ]
  }
];

/**
 * Flattened set of all skills for quick lookup
 */
export const SKILLS_SET = new Set(
  SKILL_CATEGORIES.flatMap(category => [
    ...category.skills,
    ...(category.aliases ?? [])
  ])
); 