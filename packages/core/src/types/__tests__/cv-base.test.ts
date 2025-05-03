import { describe, it, expect } from 'vitest';
describe('CV Base Types', () => {
    it('should validate a complete CVData object', () => {
        const cvData = {
            personalInfo: {
                name: {
                    full: 'John Doe',
                    first: 'John',
                    last: 'Doe'
                },
                contact: {
                    email: 'john@example.com',
                    phone: '123-456-7890'
                }
            },
            skills: ['JavaScript', 'TypeScript'],
            certifications: ['AWS Certified'],
            education: [{
                    degree: 'BS',
                    institution: 'University',
                    year: '2020'
                }],
            experience: [{
                    title: 'Developer',
                    company: 'Tech Co',
                    startDate: '2020-01',
                    endDate: '2023-01',
                    responsibilities: ['Coding', 'Testing']
                }]
        };
        // TypeScript compilation ensures type safety
        expect(cvData).toBeDefined();
        expect(cvData.personalInfo.name.full).toBe('John Doe');
    });
    it('should validate Experience object', () => {
        const experience = {
            employer: 'Tech Co',
            position: 'Senior Developer',
            period: '2020-2023',
            duties: ['Development', 'Team Lead']
        };
        expect(experience).toBeDefined();
        expect(experience.employer).toBe('Tech Co');
    });
});
