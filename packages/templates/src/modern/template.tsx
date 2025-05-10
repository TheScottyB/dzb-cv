import React from 'react';
import ReactDOMServer from 'react-dom/server';
import type {
  CVData,
  Template,
  PDFGenerationOptions,
  Education,
  Experience,
  Skill,
} from '@dzb-cv/types';
import { Heading } from '@dzb-cv/ui/Heading';
import { Text } from '@dzb-cv/ui/Text';
import { List, ListItem } from '@dzb-cv/ui/List';
import './template.css';

// Extended data interfaces with additional properties needed for the template
interface ExtendedEducation extends Education {
  startDate?: string;
  endDate?: string;
  honors?: string[];
}

interface Project {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

interface Language {
  language: string;
  proficiency: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
}

interface ExtendedCVData {
  projects?: Project[];
  languages?: Language[];
  certifications?: Certification[];
}

/**
 * ModernTemplate implements a clean, contemporary CV layout
 * using @dzb-cv/ui Typography components.
 *
 * Features:
 * - Responsive design for both screen and print media
 * - Two-column layout for optimal content organization
 * - Visual hierarchy using consistent typography
 * - Print-optimized styling
 *
 * @implements {Template}
 */
export class ModernTemplate implements Template {
  readonly id = 'modern';
  readonly name = 'modern';
  readonly description =
    'A clean, modern CV template with professional styling and optimized typography.';

  /**
   * Renders the CV data as HTML string
   * @param data The CV data to be rendered
   * @param options Optional PDF generation options
   * @returns The rendered HTML as a string
   */
  render(data: CVData & Partial<ExtendedCVData>, options?: PDFGenerationOptions): string {
    return ReactDOMServer.renderToString(this.renderComponent(data, options));
  }

  /**
   * Renders the CV data as a React component using modern UI elements
   * @param data The CV data to be rendered
   * @param options Optional PDF generation options
   * @returns React element with the rendered CV
   */
  private renderComponent(
    data: CVData & Partial<ExtendedCVData>,
    _options?: PDFGenerationOptions
  ): React.ReactElement {
    return (
      <div className="modern-cv">
        {/* Header Section */}
        <header className="cv-header">
          <div className="header-content">
            <Heading level={1} size="3xl" weight="bold">
              {data.personalInfo.name?.full || ''}
            </Heading>

            {data.personalInfo.professionalTitle && (
              <Text size="lg" color="primary" className="professional-title">
                {data.personalInfo.professionalTitle}
              </Text>
            )}

            <div className="contact-info">
              {data.personalInfo.contact?.email && (
                <Text size="sm" color="muted">
                  {data.personalInfo.contact.email}
                </Text>
              )}

              {data.personalInfo.contact?.phone && (
                <Text size="sm" color="muted">
                  {data.personalInfo.contact.phone}
                </Text>
              )}

              {data.personalInfo.contact?.address && (
                <Text size="sm" color="muted">
                  {data.personalInfo.contact.address}
                </Text>
              )}

              {data.personalInfo.contact?.linkedin && (
                <Text size="sm" color="muted">
                  {data.personalInfo.contact.linkedin}
                </Text>
              )}

              {data.personalInfo.contact?.github && (
                <Text size="sm" color="muted">
                  {data.personalInfo.contact.github}
                </Text>
              )}
            </div>
          </div>
        </header>

        <div className="cv-content">
          <div className="main-column">
            {/* Professional Summary Section */}
            {data.personalInfo.summary && (
              <section className="cv-section">
                <Heading level={2} size="xl" weight="semibold">
                  Professional Summary
                </Heading>
                <Text>{data.personalInfo.summary}</Text>
              </section>
            )}

            {/* Experience Section */}
            {data.experience?.length > 0 && (
              <section className="cv-section">
                <Heading level={2} size="xl" weight="semibold">
                  Experience
                </Heading>

                {data.experience.map((exp: Experience, index: number) => (
                  <div key={index} className="experience-item">
                    <div className="item-header">
                      <Heading level={3} size="lg" weight="semibold">
                        {exp.position}
                      </Heading>
                      <Text size="sm" color="primary" weight="medium">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </Text>
                    </div>

                    <Text weight="medium">
                      {exp.employer}
                      {exp.location ? `, ${exp.location}` : ''}
                    </Text>

                    {exp.responsibilities?.length > 0 && (
                      <List type="unordered" marker="disc" className="responsibilities-list">
                        {exp.responsibilities?.map((item: string, i: number) => (
                          <ListItem key={i}>
                            <Text size="sm">{item}</Text>
                          </ListItem>
                        ))}
                      </List>
                    )}

                    {Boolean(exp.achievements?.length) && (
                      <>
                        <Text size="sm" weight="medium" className="achievements-header">
                          Key Achievements:
                        </Text>
                        <List type="unordered" marker="circle" className="achievements-list">
                          {exp.achievements?.map((achievement: string, i: number) => (
                            <ListItem key={i}>
                              <Text size="sm">{achievement}</Text>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Projects Section - if data includes projects */}
            {Boolean(data.projects?.length) && (
              <section className="cv-section">
                <Heading level={2} size="xl" weight="semibold">
                  Projects
                </Heading>

                {data.projects?.map((project: any, index: number) => (
                  <div key={index} className="project-item">
                    <Heading level={3} size="lg" weight="semibold">
                      {project.name}
                    </Heading>

                    <Text>{project.description}</Text>

                    {project.technologies?.length > 0 && (
                      <div className="technologies">
                        <Text size="sm" weight="medium">
                          Technologies:
                        </Text>
                        <div className="tech-tags">
                          {project.technologies?.map((tech: string, i: number) => (
                            <span key={i} className="tech-tag">
                              <Text size="xs">{tech}</Text>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.url && (
                      <Text size="sm" className="project-url">
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                          {project.url}
                        </a>
                      </Text>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          <div className="side-column">
            {/* Education Section */}
            {data.education?.length > 0 && (
              <section className="cv-section">
                <Heading level={2} size="xl" weight="semibold">
                  Education
                </Heading>

                {data.education?.map((edu: ExtendedEducation, index: number) => (
                  <div key={index} className="education-item">
                    <Heading level={3} size="md" weight="semibold">
                      {edu.degree}
                      {edu.field ? ` in ${edu.field}` : ''}
                    </Heading>

                    <Text weight="medium">{edu.institution}</Text>

                    <Text size="sm" color="muted">
                      {edu.graduationDate ||
                        (edu.startDate && edu.endDate
                          ? `${edu.startDate} - ${edu.endDate || 'Present'}`
                          : '')}
                    </Text>

                    {edu.gpa && <Text size="sm">GPA: {edu.gpa}</Text>}

                    {Boolean(edu.honors?.length) && (
                      <List type="unordered" marker="none" className="honors-list">
                        {edu.honors?.map((honor: string, i: number) => (
                          <ListItem key={i}>
                            <Text size="sm" italic>
                              {honor}
                            </Text>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Skills Section */}
            {data.skills?.length > 0 && (
              <section className="cv-section">
                <Heading level={2} size="xl" weight="semibold">
                  Skills
                </Heading>

                <div className="skills-container">
                  {/* Group skills by category if present */}
                  {(() => {
                    // Check if skills have categories
                    const hasCategories = data.skills.some((skill: Skill) => skill.category);

                    if (hasCategories) {
                      // Group skills by category
                      const skillsByCategory: Record<string, typeof data.skills> = {};

                      data.skills.forEach((skill: Skill) => {
                        const category = skill.category || 'Other';
                        if (!skillsByCategory[category]) {
                          skillsByCategory[category] = [];
                        }
                        skillsByCategory[category].push(skill);
                      });

                      return Object.entries(skillsByCategory).map(([category, skills]) => (
                        <div key={category} className="skill-category">
                          <Heading level={3} size="md" weight="semibold">
                            {category}
                          </Heading>
                          <div className="skill-tags">
                            {skills.map((skill: Skill, i: number) => (
                              <span
                                key={i}
                                className={`skill-tag ${skill.level ? `level-${skill.level}` : ''}`}
                              >
                                <Text size="sm">{skill.name}</Text>
                              </span>
                            ))}
                          </div>
                        </div>
                      ));
                    } else {
                      // Display as a simple list of tags
                      return (
                        <div className="skill-tags">
                          {data.skills.map((skill: Skill, i: number) => (
                            <span
                              key={i}
                              className={`skill-tag ${skill.level ? `level-${skill.level}` : ''}`}
                            >
                              <Text size="sm">{skill.name}</Text>
                            </span>
                          ))}
                        </div>
                      );
                    }
                  })()}
                </div>
              </section>
            )}

            {/* Languages Section - if data includes languages */}
            {Boolean(data.languages?.length) && (
              <section className="cv-section">
                <Heading level={2} size="xl" weight="semibold">
                  Languages
                </Heading>

                <List type="unordered" marker="none" className="languages-list">
                  {data.languages?.map((lang: any, index: number) => (
                    <ListItem key={index} className="language-item" data-testid="language-item">
                      <Text size="sm" weight="medium">
                        {lang.language}
                      </Text>
                      <Text size="sm" color="muted">
                        {lang.proficiency}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              </section>
            )}

            {/* Certifications Section - if data includes certifications */}
            {Boolean(data.certifications?.length) && (
              <section className="cv-section">
                <Heading level={2} size="xl" weight="semibold">
                  Certifications
                </Heading>

                <List type="unordered" marker="none" className="certifications-list">
                  {data.certifications?.map((cert: any, index: number) => (
                    <ListItem
                      key={index}
                      className="certification-item"
                      data-testid="certification-item"
                    >
                      <Text size="sm" weight="medium">
                        {cert.name}
                      </Text>
                      <Text size="xs" color="muted">
                        {cert.issuer}, {cert.date}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Provides CSS styling for the modern template
   * @returns CSS styles as a string
   */
  getStyles(): string {
    return `
      .modern-cv {
        font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
        color: var(--color-text-default, #1a202c);
        line-height: 1.5;
        background-color: var(--color-background-default, #ffffff);
        max-width: 100%;
        margin: 0 auto;
        padding: 0;
      }
      
      .cv-header {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 2px solid var(--color-primary-100, #e6f7ff);
      }
      
      .header-content {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      
      .professional-title {
        margin-top: 0.5rem;
        margin-bottom: 1rem;
      }
      
      .contact-info {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;
      }
      
      .cv-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
      }
      
      .cv-section {
        margin-bottom: 2rem;
      }
      
      .experience-item,
      .education-item,
      .project-item {
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--color-border-default, #e5e5e5);
      }
      
      .experience-item:last-child,
      .education-item:last-child,
      .project-item:last-child {
        border-bottom: none;
      }
      
      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
        flex-wrap: wrap;
      }
      
      .responsibilities-list,
      .achievements-list {
        margin-top: 0.75rem;
      }
      
      .achievements-header {
        margin-top: 1rem;
        margin-bottom: 0.25rem;
      }
      
      .skill-category {
        margin-bottom: 1rem;
      }
      
      .skill-tags,
      .tech-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      
      .skill-tag,
      .tech-tag {
        background-color: var(--color-background-muted, #f5f5f5);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        display: inline-block;
      }
      
      .skill-tag.level-expert {
        background-color: var(--color-primary-100, #e6f7ff);
        border-left: 3px solid var(--color-primary, #1890ff);
      }
      
      .skill-tag.level-advanced {
        background-color: var(--color-primary-50, #f0f9ff);
        border-left: 3px solid var(--color-primary-400, #69c0ff);
      }
      
      .skill-tag.level-intermediate {
        background-color: var(--color-secondary-50, #f9fafb);
        border-left: 3px solid var(--color-secondary-400, #a0aec0);
      }
      
      .skill-tag.level-beginner {
        background-color: var(--color-background-muted, #f5f5f5);
        border-left: 3px solid var(--color-text-muted, #718096);
      }
      
      .technologies {
        margin-top: 0.75rem;
      }
      
      .project-url {
        margin-top: 0.5rem;
      }
      
      .project-url a {
        color: var(--color-primary, #1890ff);
        text-decoration: none;
      }
      
      .project-url a:hover {
        text-decoration: underline;
      }
      
      .language-item,
      .certification-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .cv-content {
          grid-template-columns: 1fr;
        }
        
        .item-header {
          flex-direction: column;
        }
        
        .contact-info {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
      
      /* Print Optimization */
      @media print {
        .modern-cv {
          font-size: 11pt;
        }
        
        .cv-header {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
        }
        
        .cv-content {
          gap: 1.5rem;
        }
        
        .cv-section {
          margin-bottom: 1rem;
          page-break-inside: avoid;
        }
        
        .experience-item,
        .education-item,
        .project-item {
          page-break-inside: avoid;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
        }
        
        /* Ensures white background for printing */
        body {
          background-color: white !important;
          color: black !important;
        }
        
        /* Hide URLs when printing unless it's a link */
        a:link:after, a:visited:after {
          content: "" !important;
        }
        
        /* Adjust font sizes for print */
        h1 {
          font-size: 16pt !important;
        }
        
        h2 {
          font-size: 14pt !important;
        }
        
        h3 {
          font-size: 12pt !important;
        }
        
        p, li {
          font-size: 10pt !important;
        }
        
        .page-break-avoid {
          page-break-inside: avoid;
        }
      }
    `;
  }
}
