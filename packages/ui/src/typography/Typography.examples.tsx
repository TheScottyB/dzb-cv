import React from 'react';
import { Heading, Text, List, ListItem } from '../components/Typography/index.js';

/**
 * Typography Examples
 *
 * This file showcases comprehensive usage patterns for @dzb-cv/ui typography components
 * in the context of a CV/resume application. Each example demonstrates different
 * combinations and variants to illustrate best practices.
 */

/**
 * Example 1: CV Header Section
 *
 * Demonstrates combining heading and text components to create a professional
 * header section for a resume, with proper hierarchy and styling.
 */
export const CVHeaderExample: React.FC = () => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <Heading level={1} size="3xl" style={{ textAlign: 'center' }}>
        Jane Doe
      </Heading>
      <Text size="lg" style={{ textAlign: 'center' }}>
        Senior Software Engineer
      </Text>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
        <Text size="sm" weight="medium">
          jane.doe@example.com
        </Text>
        <Text size="sm" weight="medium">
          (555) 123-4567
        </Text>
        <Text size="sm" weight="medium">
          San Francisco, CA
        </Text>
      </div>
    </div>
  );
};

/**
 * Example 2: Professional Summary
 *
 * Shows how to construct a professional summary section using
 * text components with appropriate styling.
 */
export const ProfessionalSummaryExample: React.FC = () => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <Heading level={2} size="xl">
        Professional Summary
      </Heading>
      <Text size="md" style={{ marginTop: '0.5rem' }}>
        Experienced software engineer with over 8 years of expertise in full-stack development,
        specializing in React, Node.js, and cloud infrastructure. Proven track record of delivering
        scalable applications and leading cross-functional teams to success.
      </Text>
    </div>
  );
};

/**
 * Example 3: Skills Section
 *
 * Demonstrates using a combination of heading and list components
 * to showcase skills in a visually organized manner.
 */
export const SkillsExample: React.FC = () => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <Heading level={2} size="xl">
        Technical Skills
      </Heading>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginTop: '0.5rem',
        }}
      >
        <div>
          <Heading level={4} size="md">
            Frontend Development
          </Heading>
          <List type="unordered" marker="disc" spaced>
            <ListItem>React.js & React Native</ListItem>
            <ListItem>TypeScript & JavaScript (ES6+)</ListItem>
            <ListItem>HTML5, CSS3, SASS</ListItem>
            <ListItem>Redux, Context API</ListItem>
          </List>
        </div>

        <div>
          <Heading level={4} size="md">
            Backend Development
          </Heading>
          <List type="unordered" marker="disc" spaced>
            <ListItem>Node.js, Express</ListItem>
            <ListItem>RESTful API Design</ListItem>
            <ListItem>PostgreSQL, MongoDB</ListItem>
            <ListItem>GraphQL, Apollo</ListItem>
          </List>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 4: Work Experience
 *
 * Shows how to structure work experience with appropriate typography
 * hierarchy and mixed component usage.
 */
export const WorkExperienceExample: React.FC = () => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <Heading level={2} size="xl">
        Work Experience
      </Heading>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Heading level={3} size="lg" weight="semibold">
            Senior Software Engineer
          </Heading>
          <Text size="sm" weight="medium">
            May 2020 - Present
          </Text>
        </div>

        <Text size="md" weight="medium" style={{ marginTop: '0.25rem' }}>
          TechCorp Inc., San Francisco, CA
        </Text>

        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>
            <Text size="md">
              Led the development of a microservices architecture that improved system scalability
              by 40%
            </Text>
          </li>
          <li>
            <Text size="md">
              Mentored junior developers and conducted code reviews to ensure quality and best
              practices
            </Text>
          </li>
          <li>
            <Text size="md">
              Collaborated with product and design teams to deliver features aligned with user needs
            </Text>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Heading level={3} size="lg" weight="semibold">
            Software Engineer
          </Heading>
          <Text size="sm" weight="medium">
            June 2018 - April 2020
          </Text>
        </div>

        <Text size="md" weight="medium" style={{ marginTop: '0.25rem' }}>
          InnovateTech, Austin, TX
        </Text>

        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>
            <Text size="md">
              Developed and maintained RESTful APIs supporting mobile and web applications
            </Text>
          </li>
          <li>
            <Text size="md">
              Implemented automated testing strategies that reduced bugs in production by 25%
            </Text>
          </li>
        </ul>
      </div>
    </div>
  );
};
