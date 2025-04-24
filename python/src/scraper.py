from typing import Dict, List, Optional, Any
import json
import os
import time
from datetime import datetime
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup

class JobPosting:
    def __init__(self, url: str):
        self.url = url
        self.title: str = ""
        self.company: str = ""
        self.location: Optional[str] = None
        self.description: str = ""
        self.responsibilities: List[str] = []
        self.qualifications: List[str] = []
        self.skills: List[str] = []
        self.education: List[str] = []
        self.experience: List[str] = []
        self.html_path: Optional[str] = None
        self.screenshot_path: Optional[str] = None
        self.pdf_path: Optional[str] = None
        self.metadata: Dict[str, Any] = {
            "postedDate": None,
            "closingDate": None,
            "salary": None,
            "employmentType": None
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "url": self.url,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "description": self.description,
            "responsibilities": self.responsibilities,
            "qualifications": self.qualifications,
            "skills": self.skills,
            "education": self.education,
            "experience": self.experience,
            "htmlPath": self.html_path,
            "screenshotPath": self.screenshot_path,
            "pdfPath": self.pdf_path,
            "metadata": self.metadata
        }

class ScraperOptions:
    def __init__(self, **kwargs):
        self.headless: bool = kwargs.get('headless', True)
        self.wait_time: int = kwargs.get('wait_time', 5000)
        self.output_dir: str = kwargs.get('output_dir', 'job-postings')
        self.save_html: bool = kwargs.get('save_html', True)
        self.save_screenshot: bool = kwargs.get('save_screenshot', True)
        self.save_pdf: bool = kwargs.get('save_pdf', True)
        self.custom_user_agent: Optional[str] = kwargs.get('custom_user_agent')

class ScraperResult:
    def __init__(self, url: str):
        self.success: bool = False
        self.data: Optional[JobPosting] = None
        self.error: Optional[str] = None
        self.metadata = {
            "timestamp": datetime.now().isoformat(),
            "duration": 0,
            "url": url
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "data": self.data.to_dict() if self.data else None,
            "error": self.error,
            "metadata": self.metadata
        }

class JobScraper:
    def __init__(self, options: Optional[ScraperOptions] = None):
        self.options = options or ScraperOptions()
        self.driver = None

    def _ensure_output_dir(self) -> str:
        os.makedirs(self.options.output_dir, exist_ok=True)
        return self.options.output_dir

    def _extract_job_info(self, soup: BeautifulSoup) -> Dict[str, Any]:
        def get_text(selector: str) -> str:
            element = soup.select_one(selector)
            return element.get_text().strip() if element else ""

        def get_list(selector: str) -> List[str]:
            return [el.get_text().strip() for el in soup.select(selector) if el.get_text().strip()]

        return {
            "title": get_text('h1, .job-title, [role="heading"]'),
            "company": get_text('.company-name, .employer, [itemprop="hiringOrganization"]'),
            "location": get_text('.location, [itemprop="jobLocation"]'),
            "description": get_text('.job-description, [itemprop="description"]'),
            "responsibilities": get_list('.responsibilities li, .duties li'),
            "qualifications": get_list('.qualifications li, .requirements li'),
            "skills": get_list('.skills li, .competencies li'),
            "education": get_list('.education li, .requirements li'),
            "experience": get_list('.experience li, .requirements li'),
            "metadata": {
                "postedDate": get_text('.posted-date, [itemprop="datePosted"]'),
                "closingDate": get_text('.closing-date, .application-deadline'),
                "salary": get_text('.salary, [itemprop="baseSalary"]'),
                "employmentType": get_text('.employment-type, [itemprop="employmentType"]')
            }
        }

    def scrape(self, url: str) -> ScraperResult:
        start_time = time.time()
        result = ScraperResult(url)

        try:
            chrome_options = Options()
            if self.options.headless:
                chrome_options.add_argument('--headless')
            if self.options.custom_user_agent:
                chrome_options.add_argument(f'user-agent={self.options.custom_user_agent}')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-setuid-sandbox')

            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.get(url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            time.sleep(self.options.wait_time / 1000)  # Convert ms to seconds

            output_dir = self._ensure_output_dir()
            timestamp = datetime.now().strftime('%Y-%m-%dT%H-%M-%S')
            base_filename = f"{Path(url).stem}-{timestamp}"

            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            job_data = self._extract_job_info(soup)
            
            job_posting = JobPosting(url)
            for key, value in job_data.items():
                if key == 'metadata':
                    job_posting.metadata.update(value)
                else:
                    setattr(job_posting, key, value)

            if self.options.save_html:
                html_path = os.path.join(output_dir, f"{base_filename}.html")
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(self.driver.page_source)
                job_posting.html_path = html_path

            if self.options.save_screenshot:
                screenshot_path = os.path.join(output_dir, f"{base_filename}.png")
                self.driver.save_screenshot(screenshot_path)
                job_posting.screenshot_path = screenshot_path

            if self.options.save_pdf:
                # PDF saving would require additional setup with Chrome DevTools Protocol
                pass

            json_path = os.path.join(output_dir, f"{base_filename}.json")
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(job_posting.to_dict(), f, indent=2)

            result.success = True
            result.data = job_posting

        except Exception as e:
            result.error = str(e)
        finally:
            if self.driver:
                self.driver.quit()
            result.metadata['duration'] = time.time() - start_time

        return result 