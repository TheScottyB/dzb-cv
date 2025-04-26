from playwright.sync_api import sync_playwright
import os
import sys

# Usage: python scrape_job_posting.py <job_posting_url> <output_dir>
if len(sys.argv) != 3:
    print("Usage: python scrape_job_posting.py <job_posting_url> <output_dir>")
    sys.exit(1)

url = sys.argv[1]
output_dir = sys.argv[2]

print("[INFO] Make sure Chrome is running with --remote-debugging-port=9222 and the correct profile.")
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    print("[INFO] Connecting to the running Chrome instance via CDP...")
    browser = p.chromium.connect_over_cdp("http://localhost:9222")
    # Use the first context (should be your open profile)
    context = browser.contexts[0]
    page = context.new_page()
    print(f"[INFO] Navigating to {url} ...")
    page.goto(url)
    print(f"[INFO] Page title: {page.title()}")
    print("[INFO] If there is a CAPTCHA or login, solve it in the browser window.")
    input("[INFO] When the page is fully loaded, press Enter here to continue...")

    # Check for CAPTCHA/block page
    page_content = page.content()
    if any(keyword in page_content.lower() for keyword in ["captcha", "blocked", "cloudflare"]):
        print("[WARNING] The page content looks like a CAPTCHA or block page. Please verify in the browser window.")
    else:
        print("[INFO] Page appears to be loaded normally.")

    # Save screenshot
    screenshot_path = os.path.join(output_dir, "screenshot.png")
    page.screenshot(path=screenshot_path, full_page=True)
    print(f"[INFO] Screenshot saved to {screenshot_path}")

    # Save HTML
    html_path = os.path.join(output_dir, "page.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(page_content)
    print(f"[INFO] HTML saved to {html_path}")

    # Save PDF (Chromium only)
    pdf_path = os.path.join(output_dir, "page.pdf")
    page.pdf(path=pdf_path, format="A4")
    print(f"[INFO] PDF saved to {pdf_path}")

    browser.close()
    print("[INFO] Done!")