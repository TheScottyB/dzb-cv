import { describe, it, expect } from 'vitest';
import { AcademicTemplate } from '../index.js';
describe('AcademicTemplate', () => {
    const template = new AcademicTemplate();
    const testData = {
        personalInfo: {
            name: { full: 'Dr. Jane Smith' },
            title: 'Associate Professor',
            contact: {
                email: 'jsmith@university.edu',
                phone: '(555) 123-4567',
                address: 'Department of Computer Science, University Name, City, State'
            },
            profiles: {
                linkedIn: 'linkedin.com/in/drjanesmith'
            }
        },
        experience: [
            {
                title: 'Associate Professor',
                company: 'University Name',
                startDate: '2018-09',
                endDate: '2023-01',
                responsibilities: ['Research in machine learning', 'Student advising'],
                employment_type: 'academic'
            },
            {
                title: 'Instructor',
                company: 'College Name',
                startDate: '2015-01',
                endDate: '2018-08',
                responsibilities: ['Taught introductory CS courses', 'Curriculum development'],
                employment_type: 'teaching'
            }
        ],
        education: [{
                degree: 'Ph.D.',
                institution: 'Top University',
                year: '2015',
                field: 'Computer Science',
                notes: 'Thesis: "Advanced Machine Learning Applications"'
            }],
        skills: ['Machine Learning', 'Neural Networks', 'Data Mining'],
        certifications: ['Teaching Certificate'],
        publications: [
            {
                authors: 'Smith, J., Johnson, R.',
                year: '2020',
                title: 'Advances in machine learning algorithms',
                journal: 'Journal of AI Research',
                volume: '12',
                issue: '3',
                pages: '245-267'
            }
        ],
        awards: [
            {
                title: 'Outstanding Researcher Award',
                year: '2021',
                organization: 'Computer Science Association',
                description: 'Awarded for contributions to machine learning research'
            }
        ],
        conferences: [
            {
                title: 'Advancements in Neural Network Applications',
                authors: 'Smith, J.',
                year: '2020',
                conferenceName: 'International Conference on Machine Learning',
                location: 'Montreal, Canada',
                description: 'Invited speaker presentation'
            }
        ],
        grants: [
            {
                title: 'Research on Neural Network Applications',
                year: '2019',
                amount: '$250,000',
                agency: 'National Science Foundation',
                description: 'Three-year grant for neural network research'
            }
        ]
    };
    describe('section generation', () => {
        it('should generate complete academic CV with all sections', () => {
            const result = template.generateMarkdown(testData);
            expect(result).toContain('Dr. Jane Smith');
            expect(result).toContain('## Academic Appointments');
            expect(result).toContain('## Publications');
            expect(result).toContain('## Conference Presentations');
            expect(result).toContain('## Grants and Funding');
            expect(result).toContain('## Awards and Honors');
            expect(result).toContain('## Research Expertise');
        });
        it('should handle optional sections appropriately', () => {
            const minimalData = {
                personalInfo: {
                    name: { full: 'Dr. Test' },
                    contact: {
                        email: 'test@test.edu',
                        phone: '123-456-7890'
                    }
                },
                experience: [],
                education: [],
                skills: [],
                certifications: []
            };
            const result = template.generateMarkdown(minimalData);
            expect(result).not.toContain('## Publications');
            expect(result).not.toContain('## Conference Presentations');
            expect(result).not.toContain('## Grants and Funding');
            expect(result).not.toContain('## Awards and Honors');
        });
    });
    describe('publication formatting', () => {
        it('should format publications in academic style', () => {
            const result = template.generateMarkdown(testData);
            const pubSection = result.split('## Publications')[1].split('##')[0];
            expect(pubSection).toContain('Smith, J., Johnson, R. (2020)');
            expect(pubSection).toContain('*Journal of AI Research*');
            expect(pubSection).toContain('12(3), 245-267');
        });
        it('should handle publications without issue numbers', () => {
            const dataWithoutIssue = {
                ...testData,
                publications: [{
                        ...testData.publications[0],
                        issue: undefined
                    }]
            };
            const result = template.generateMarkdown(dataWithoutIssue);
            expect(result).not.toContain('()');
        });
    });
    describe('template options', () => {
        it('should respect section inclusion options', () => {
            const result = template.generateMarkdown(testData, {
                includeEducation: false,
                includeSkills: false
            });
            expect(result).not.toContain('## Education');
            expect(result).not.toContain('## Research Expertise');
            expect(result).toContain('## Publications');
        });
        it('should handle empty sections gracefully', () => {
            const result = template.generateMarkdown({
                ...testData,
                publications: [],
                conferences: [],
                grants: [],
                awards: []
            });
            expect(result).not.toContain('## Publications');
            expect(result).not.toContain('## Conference Presentations');
            expect(result).not.toContain('## Grants and Funding');
            expect(result).not.toContain('## Awards and Honors');
        });
    });
    describe('styling', () => {
        it('should provide academic-focused CSS styles', () => {
            const styles = template.getStyles();
            expect(styles).toContain('font-family: \'Garamond\'');
            expect(styles).toContain('.publication');
            expect(styles).toContain('text-indent: -12mm');
        });
        it('should include print media queries', () => {
            const styles = template.getStyles();
            expect(styles).toContain('@media print');
            expect(styles).toContain('page-break-after: always');
        });
    });
});
