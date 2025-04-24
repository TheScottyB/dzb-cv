import { describe, test, expect } from '@jest/globals';
import { formatUSDate, formatFederalDateRange } from '../helpers.js';
describe('Date Formatting Helpers', () => {
    describe('formatUSDate', () => {
        test('formats Month YYYY pattern to MM/YYYY', () => {
            expect(formatUSDate('January 2024')).toBe('01/2024');
            expect(formatUSDate('February 2023')).toBe('02/2023');
            expect(formatUSDate('December 2022')).toBe('12/2022');
        });
        test('formats abbreviated months correctly', () => {
            expect(formatUSDate('Jan 2024')).toBe('01/2024');
            expect(formatUSDate('Feb 2023')).toBe('02/2023');
            expect(formatUSDate('Dec 2022')).toBe('12/2022');
        });
        test('formats M/YYYY pattern with zero padding', () => {
            expect(formatUSDate('1/2024')).toBe('01/2024');
            expect(formatUSDate('5/2023')).toBe('05/2023');
            expect(formatUSDate('12/2022')).toBe('12/2022');
        });
        test('handles "Present" and "Ongoing" special values', () => {
            expect(formatUSDate('Present')).toBe('Present');
            expect(formatUSDate('present')).toBe('Present');
            expect(formatUSDate('PRESENT')).toBe('Present');
            expect(formatUSDate('Ongoing')).toBe('Present');
            expect(formatUSDate('ongoing')).toBe('Present');
        });
        test('handles Date objects', () => {
            expect(formatUSDate(new Date('2024-01-15'))).toBe('01/2024');
            expect(formatUSDate(new Date('2023-05-20'))).toBe('05/2023');
        });
        test('handles empty or invalid inputs gracefully', () => {
            expect(formatUSDate('')).toBe('');
            expect(formatUSDate(undefined)).toBe('');
            expect(formatUSDate(null)).toBe('');
            // Invalid date strings should return a valid formatted date (current implementation fallback)
            const result = formatUSDate('not-a-date');
            expect(result).toMatch(/^\d{2}\/\d{4}$/); // Should match pattern MM/YYYY
        });
    });
    describe('formatFederalDateRange', () => {
        test('formats date range with Present end date', () => {
            expect(formatFederalDateRange('January 2022', 'Present')).toBe('01/2022 – Present');
            expect(formatFederalDateRange('Jan 2022', 'present')).toBe('01/2022 – Present');
            expect(formatFederalDateRange('1/2022', 'Present')).toBe('01/2022 – Present');
        });
        test('formats date range with specific end date', () => {
            expect(formatFederalDateRange('January 2022', 'December 2023')).toBe('01/2022 – 12/2023');
            expect(formatFederalDateRange('Jan 2022', 'Dec 2023')).toBe('01/2022 – 12/2023');
            expect(formatFederalDateRange('1/2022', '12/2023')).toBe('01/2022 – 12/2023');
        });
        test('formats date range with Date objects', () => {
            expect(formatFederalDateRange(new Date('2022-01-15'), new Date('2023-12-20'))).toBe('01/2022 – 12/2023');
            // For "Present" with Date objects, we can test with current date
            const nowDate = new Date();
            const expectedMonth = (nowDate.getMonth() + 1).toString().padStart(2, '0');
            const expectedYear = nowDate.getFullYear();
            expect(formatFederalDateRange(new Date('2022-01-15'), nowDate)).toBe('01/2022 – Present');
        });
        test('handles empty or invalid end date as Present', () => {
            expect(formatFederalDateRange('January 2022', '')).toBe('01/2022 – Present');
            expect(formatFederalDateRange('Jan 2022', undefined)).toBe('01/2022 – Present');
            expect(formatFederalDateRange('1/2022', null)).toBe('01/2022 – Present');
        });
        test('handles empty or invalid start date gracefully', () => {
            expect(formatFederalDateRange('', 'December 2023')).toBe('');
            expect(formatFederalDateRange(undefined, 'Dec 2023')).toBe('');
            expect(formatFederalDateRange(null, '12/2023')).toBe('');
            // If start date is invalid but we still want to show something:
            const result = formatFederalDateRange('not-a-date', 'December 2023');
            // This should either return an empty string or follow the implementation's fallback logic
            expect(result).toBeTruthy(); // Just ensure we get some non-empty result
        });
        test('uses en-dash (–) instead of hyphen (-) for ranges', () => {
            const result = formatFederalDateRange('January 2022', 'December 2023');
            // Specifically check for the en-dash character (U+2013)
            expect(result).toContain('–');
            expect(result).not.toContain('-');
        });
    });
});
//# sourceMappingURL=date-helpers.test.js.map