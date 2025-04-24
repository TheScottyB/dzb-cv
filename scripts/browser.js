/**
 * Browser-based job scraper utility
 * Can be injected into a webpage to extract job information
 */

class BrowserJobScraper {
    constructor() {
        this.selectors = {
            title: 'h1, .job-title, [role="heading"]',
            company: '.company-name, .employer, [itemprop="hiringOrganization"]',
            location: '.location, [itemprop="jobLocation"]',
            description: '.job-description, [itemprop="description"]',
            responsibilities: '.responsibilities li, .duties li',
            qualifications: '.qualifications li, .requirements li',
            skills: '.skills li, .competencies li',
            education: '.education li, .requirements li',
            experience: '.experience li, .requirements li',
            metadata: {
                postedDate: '.posted-date, [itemprop="datePosted"]',
                closingDate: '.closing-date, .application-deadline',
                salary: '.salary, [itemprop="baseSalary"]',
                employmentType: '.employment-type, [itemprop="employmentType"]'
            }
        };
    }

    getText(selector) {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
    }

    getList(selector) {
        return Array.from(document.querySelectorAll(selector))
            .map(el => el.textContent.trim())
            .filter(Boolean);
    }

    getMetadata() {
        return {
            postedDate: this.getText(this.selectors.metadata.postedDate),
            closingDate: this.getText(this.selectors.metadata.closingDate),
            salary: this.getText(this.selectors.metadata.salary),
            employmentType: this.getText(this.selectors.metadata.employmentType)
        };
    }

    scrape() {
        return {
            title: this.getText(this.selectors.title),
            company: this.getText(this.selectors.company),
            location: this.getText(this.selectors.location),
            description: this.getText(this.selectors.description),
            responsibilities: this.getList(this.selectors.responsibilities),
            qualifications: this.getList(this.selectors.qualifications),
            skills: this.getList(this.selectors.skills),
            education: this.getList(this.selectors.education),
            experience: this.getList(this.selectors.experience),
            metadata: this.getMetadata()
        };
    }

    // Utility method to save data
    static saveData(data, filename = 'job-data.json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Export for use in browser console or as a bookmarklet
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserJobScraper;
} else {
    window.BrowserJobScraper = BrowserJobScraper;
} 