export const mockJobPostings = {
  linkedin: {
    html: `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Software Engineer - Test Company - LinkedIn</title>
                <script type="application/ld+json">
                {
                    "@type": "JobPosting",
                    "title": "Senior Software Engineer",
                    "description": "We are looking for a Senior Software Engineer to join our team. Overview<br><br>As a Senior Software Engineer, you will be responsible for designing and implementing scalable solutions.<br><br>Responsibilities<br><br>• Lead technical projects from conception to deployment<br>• Write clean, maintainable code<br>• Mentor junior developers<br><br>Education and Experience<br><br>• Bachelor's degree in Computer Science or related field<br>• 5+ years of experience in software development<br><br>Skills<br><br>• JavaScript/TypeScript<br>• React<br>• Node.js<br>• AWS<br><br>Benefits<br><br>• Competitive salary<br>• Health insurance<br>• 401(k) matching",
                    "datePosted": "2024-01-01",
                    "validThrough": "2024-12-31",
                    "employmentType": "FULL_TIME",
                    "hiringOrganization": {
                        "name": "Test Company"
                    },
                    "jobLocation": {
                        "address": {
                            "streetAddress": "123 Main St",
                            "addressLocality": "San Francisco",
                            "addressRegion": "CA",
                            "postalCode": "94105",
                            "addressCountry": "US"
                        }
                    }
                }
                </script>
            </head>
            <body>
                <h1 class="top-card-layout__title">Senior Software Engineer</h1>
                <div class="topcard__org-name-link">Test Company</div>
                <div class="topcard__flavor--bullet">San Francisco, CA</div>
                <div class="description__text">
                    <h2>Overview</h2>
                    <p>As a Senior Software Engineer, you will be responsible for designing and implementing scalable solutions.</p>
                    
                    <h2>Responsibilities</h2>
                    <ul>
                        <li>Lead technical projects from conception to deployment</li>
                        <li>Write clean, maintainable code</li>
                        <li>Mentor junior developers</li>
                    </ul>
                    
                    <h2>Requirements</h2>
                    <ul>
                        <li>Bachelor's degree in Computer Science or related field</li>
                        <li>5+ years of experience in software development</li>
                    </ul>
                    
                    <h2>Skills</h2>
                    <ul>
                        <li>JavaScript/TypeScript</li>
                        <li>React</li>
                        <li>Node.js</li>
                        <li>AWS</li>
                    </ul>
                    
                    <h2>Benefits</h2>
                    <ul>
                        <li>Competitive salary</li>
                        <li>Health insurance</li>
                        <li>401(k) matching</li>
                    </ul>
                </div>
            </body>
            </html>
        `,
  },
  indeed: {
    html: `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Full Stack Developer - Test Corp - Indeed</title>
                <script type="application/ld+json">
                {
                    "@type": "JobPosting",
                    "title": "Full Stack Developer",
                    "description": "Join our dynamic team as a Full Stack Developer. Overview<br><br>We're seeking a talented Full Stack Developer to help build our next-generation platform.<br><br>Responsibilities<br><br>• Develop full-stack web applications<br>• Work with cross-functional teams<br>• Optimize application performance<br><br>Requirements<br><br>• 3+ years of full-stack development experience<br>• Strong knowledge of JavaScript and Python<br><br>Benefits<br><br>• Remote work options<br>• Flexible hours<br>• Professional development budget",
                    "datePosted": "2024-01-15",
                    "validThrough": "2024-12-31",
                    "employmentType": "FULL_TIME",
                    "hiringOrganization": {
                        "name": "Test Corp"
                    },
                    "jobLocation": {
                        "address": {
                            "addressLocality": "Remote",
                            "addressRegion": "US"
                        }
                    }
                }
                </script>
            </head>
            <body>
                <h1 class="jobsearch-JobInfoHeader-title">Full Stack Developer</h1>
                <div class="jobsearch-InlineCompanyRating-companyName">Test Corp</div>
                <div class="jobsearch-JobInfoHeader-subtitle">
                    <div class="jobsearch-JobInfoHeader-locationText">Remote</div>
                </div>
                <div id="jobDescriptionText">
                    <h2>Overview</h2>
                    <p>We're seeking a talented Full Stack Developer to help build our next-generation platform.</p>
                    
                    <h2>Responsibilities</h2>
                    <ul>
                        <li>Develop full-stack web applications</li>
                        <li>Work with cross-functional teams</li>
                        <li>Optimize application performance</li>
                    </ul>
                    
                    <h2>Requirements</h2>
                    <ul>
                        <li>3+ years of full-stack development experience</li>
                        <li>Strong knowledge of JavaScript and Python</li>
                    </ul>
                    
                    <h2>Benefits</h2>
                    <ul>
                        <li>Remote work options</li>
                        <li>Flexible hours</li>
                        <li>Professional development budget</li>
                    </ul>
                </div>
            </body>
            </html>
        `,
  },
};

export function getMockJobHtml(site) {
  return mockJobPostings[site]?.html || null;
}
