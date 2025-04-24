import pytest
from unittest.mock import Mock, patch
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from bs4 import BeautifulSoup
from src.scraper import JobScraper, ScraperOptions, JobPosting, ScraperResult

@pytest.fixture
def scraper():
    return JobScraper(ScraperOptions(
        headless=True,
        wait_time=1000,
        output_dir='test-output'
    ))

@pytest.fixture
def mock_driver():
    driver = Mock(spec=WebDriver)
    driver.page_source = '<html><body><h1>Test Job</h1></body></html>'
    return driver

@pytest.fixture
def mock_soup():
    html = '''
    <html>
        <body>
            <h1>Test Job</h1>
            <div class="company">Test Company</div>
            <div class="location">Test Location</div>
            <div class="description">Test Description</div>
            <ul class="responsibilities">
                <li>Responsibility 1</li>
            </ul>
            <ul class="qualifications">
                <li>Qualification 1</li>
            </ul>
            <ul class="skills">
                <li>Skill 1</li>
            </ul>
            <ul class="education">
                <li>Education 1</li>
            </ul>
            <ul class="experience">
                <li>Experience 1</li>
            </ul>
            <div class="metadata">
                <div class="posted-date">2024-01-01</div>
                <div class="closing-date">2024-02-01</div>
                <div class="salary">$50,000</div>
                <div class="employment-type">Full-time</div>
            </div>
        </body>
    </html>
    '''
    return BeautifulSoup(html, 'html.parser')

def test_extract_job_info(scraper, mock_soup):
    result = scraper._extract_job_info(mock_soup)
    
    assert result['title'] == 'Test Job'
    assert result['company'] == 'Test Company'
    assert result['location'] == 'Test Location'
    assert result['description'] == 'Test Description'
    assert 'Responsibility 1' in result['responsibilities']
    assert 'Qualification 1' in result['qualifications']
    assert 'Skill 1' in result['skills']
    assert 'Education 1' in result['education']
    assert 'Experience 1' in result['experience']
    assert result['metadata']['postedDate'] == '2024-01-01'
    assert result['metadata']['closingDate'] == '2024-02-01'
    assert result['metadata']['salary'] == '$50,000'
    assert result['metadata']['employmentType'] == 'Full-time'

@patch('selenium.webdriver.Chrome')
def test_scrape_success(mock_chrome, scraper, mock_driver):
    mock_chrome.return_value = mock_driver
    mock_driver.get.return_value = None
    mock_driver.save_screenshot.return_value = None
    
    result = scraper.scrape('https://example.com/jobs/123')
    
    assert result.success is True
    assert isinstance(result.data, JobPosting)
    assert result.data.title == 'Test Job'
    assert result.metadata['duration'] > 0

@patch('selenium.webdriver.Chrome')
def test_scrape_error(mock_chrome, scraper):
    mock_chrome.side_effect = Exception('Test error')
    
    result = scraper.scrape('https://example.com/jobs/123')
    
    assert result.success is False
    assert result.error == 'Test error'
    assert result.metadata['duration'] > 0

def test_job_posting_to_dict():
    job = JobPosting('https://example.com/jobs/123')
    job.title = 'Test Job'
    job.company = 'Test Company'
    job.location = 'Test Location'
    job.description = 'Test Description'
    job.responsibilities = ['Responsibility 1']
    job.qualifications = ['Qualification 1']
    job.skills = ['Skill 1']
    job.education = ['Education 1']
    job.experience = ['Experience 1']
    job.metadata = {
        'postedDate': '2024-01-01',
        'closingDate': '2024-02-01',
        'salary': '$50,000',
        'employmentType': 'Full-time'
    }
    
    result = job.to_dict()
    
    assert result['title'] == 'Test Job'
    assert result['company'] == 'Test Company'
    assert result['location'] == 'Test Location'
    assert result['description'] == 'Test Description'
    assert 'Responsibility 1' in result['responsibilities']
    assert 'Qualification 1' in result['qualifications']
    assert 'Skill 1' in result['skills']
    assert 'Education 1' in result['education']
    assert 'Experience 1' in result['experience']
    assert result['metadata']['postedDate'] == '2024-01-01' 