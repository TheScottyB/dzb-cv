import { describe, it, expect, beforeEach } from 'vitest';
import { CVService } from '../cv-service.js';
import { MemoryStorage } from '../storage/memory-storage.js';
import { MockPDFGenerator } from '../pdf/mock-pdf-generator.js';
describe('CVService', () => {
    let service;
    let storage;
    let pdfGenerator;
    let testData;
    beforeEach(() => {
        storage = new MemoryStorage();
        pdfGenerator = new MockPDFGenerator();
        service = new CVService(storage, pdfGenerator);
        testData = {
            personalInfo: {
                name: { full: 'Test User' },
                contact: {
                    email: 'test@example.com',
                    phone: '123-456-7890'
                }
            },
            experience: [{
                    title: 'Developer',
                    company: 'Tech Co',
                    startDate: '2020-01',
                    endDate: '2023-01',
                    responsibilities: ['Coding', 'Testing']
                }],
            education: [{
                    degree: 'BS Computer Science',
                    institution: 'Test University',
                    year: '2020'
                }],
            skills: ['JavaScript', 'TypeScript'],
            certifications: ['AWS Certified']
        };
    });
    describe('createCV', () => {
        it('should create a new CV profile with initial data', async () => {
            const result = await service.createCV('Test User', testData);
            expect(result).toBeDefined();
            expect(result.owner).toBe('Test User');
            expect(result.currentVersion.data).toEqual(testData);
            expect(result.versions).toHaveLength(1);
            expect(result.currentVersion.versionNumber).toBe(1);
        });
        it('should generate valid IDs and timestamps', async () => {
            const result = await service.createCV('Test User', testData);
            expect(result.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
            expect(result.currentVersion.id).toMatch(/^[0-9a-f-]{36}$/);
            expect(new Date(result.createdAt).getTime()).not.toBeNaN();
            expect(new Date(result.updatedAt).getTime()).not.toBeNaN();
        });
    });
    describe('updateCV', () => {
        it('should create a new version when updating CV data', async () => {
            const profile = await service.createCV('Test User', testData);
            const updates = {
                skills: ['JavaScript', 'TypeScript', 'React']
            };
            const result = await service.updateCV(profile.id, updates, 'Added React skill');
            expect(result.versionNumber).toBe(2);
            expect(result.data.skills).toEqual(updates.skills);
            expect(result.changeReason).toBe('Added React skill');
        });
        it('should track changes in experience entries', async () => {
            const profile = await service.createCV('Test User', testData);
            const updates = {
                experience: [
                    ...testData.experience,
                    {
                        title: 'Senior Developer',
                        company: 'New Co',
                        startDate: '2023-02',
                        responsibilities: ['Leadership', 'Architecture']
                    }
                ]
            };
            const result = await service.updateCV(profile.id, updates);
            expect(result.changes).toBeDefined();
            expect(result.changes).toHaveLength(2); // length change + new entry
            expect(result.changes?.find(c => c.field === 'experience.add')).toBeDefined();
        });
        it('should throw error when updating non-existent profile', async () => {
            await expect(service.updateCV('non-existent', { skills: [] })).rejects.toThrow('Profile non-existent not found');
        });
    });
    describe('generateCV', () => {
        it('should generate PDF format', async () => {
            const profile = await service.createCV('Test User', testData);
            const options = {
                format: 'pdf',
                pdfOptions: {
                    includeHeaderFooter: true,
                    paperSize: 'Letter'
                }
            };
            const result = await service.generateCV(profile.id, options);
            expect(result).toBeInstanceOf(Buffer);
        });
        it('should throw error for unsupported format', async () => {
            const profile = await service.createCV('Test User', testData);
            const options = {
                format: 'doc' // Type assertion for test
            };
            await expect(service.generateCV(profile.id, options)).rejects.toThrow('Format doc not supported');
        });
        it('should throw error when generating for non-existent profile', async () => {
            const options = {
                format: 'pdf'
            };
            await expect(service.generateCV('non-existent', options)).rejects.toThrow('Profile non-existent not found');
        });
    });
});
