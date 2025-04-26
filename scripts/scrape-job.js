"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = require("puppeteer");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var os_1 = require("os");
function delay(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
function killExistingChromeInstances() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(process.platform === 'darwin')) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var exec = require('child_process').exec;
                            exec('pkill -f "Google Chrome"', function (error) {
                                // Ignore error since it returns error if no process found
                                resolve(null);
                            });
                        })];
                case 2:
                    _a.sent();
                    // Wait a bit for processes to clean up
                    return [4 /*yield*/, delay(1000)];
                case 3:
                    // Wait a bit for processes to clean up
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.log('Note: No existing Chrome processes found');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function scrapeWithPuppeteer(url) {
    return __awaiter(this, void 0, void 0, function () {
        var tempUserDataDir, browser, page, selectors, foundSelector, _i, selectors_1, selector, e_1, debugDir, jobData, outputDir, html, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // First ensure no conflicting Chrome instances
                return [4 /*yield*/, killExistingChromeInstances()];
                case 1:
                    // First ensure no conflicting Chrome instances
                    _a.sent();
                    tempUserDataDir = path_1.default.join(os_1.default.tmpdir(), "puppeteer_user_data_".concat(Date.now()));
                    console.log('Launching new Chrome instance...');
                    return [4 /*yield*/, puppeteer_1.default.launch({
                            headless: false,
                            args: [
                                '--no-sandbox',
                                '--disable-setuid-sandbox',
                                '--disable-dev-shm-usage',
                                '--disable-gpu',
                                '--disable-blink-features=AutomationControlled',
                                "--user-data-dir=".concat(tempUserDataDir),
                            ],
                            ignoreDefaultArgs: ['--enable-automation'],
                        })];
                case 2:
                    browser = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, , 25, 31]);
                    return [4 /*yield*/, browser.newPage()];
                case 4:
                    page = _a.sent();
                    // Additional stealth measures
                    return [4 /*yield*/, page.evaluateOnNewDocument(function () {
                            // Overwrite the navigator.webdriver property
                            Object.defineProperty(navigator, 'webdriver', {
                                get: function () { return undefined; },
                            });
                            // Overwrite the chrome property
                            // @ts-ignore
                            window.chrome = {
                                runtime: {},
                                // Add any other chrome properties that might be checked
                            };
                            // Overwrite permissions
                            var originalQuery = window.navigator.permissions.query;
                            // @ts-ignore
                            window.navigator.permissions.query = function (parameters) {
                                return parameters.name === 'notifications'
                                    ? Promise.resolve({
                                        // Convert notification permission to valid PermissionState
                                        state: Notification.permission === 'default'
                                            ? 'prompt'
                                            : Notification.permission === 'denied'
                                                ? 'denied'
                                                : 'granted',
                                        name: 'notifications',
                                        onchange: null,
                                        addEventListener: function () { },
                                        removeEventListener: function () { },
                                        dispatchEvent: function () {
                                            return true;
                                        },
                                    })
                                    : originalQuery(parameters);
                            };
                        })];
                case 5:
                    // Additional stealth measures
                    _a.sent();
                    // Set a realistic viewport
                    return [4 /*yield*/, page.setViewport({ width: 1366, height: 768 })];
                case 6:
                    // Set a realistic viewport
                    _a.sent();
                    console.log('Navigating to page...');
                    return [4 /*yield*/, page.goto(url, {
                            waitUntil: ['networkidle0', 'domcontentloaded'],
                            timeout: 30000,
                        })];
                case 7:
                    _a.sent();
                    // Add random delay to appear more human-like
                    return [4 /*yield*/, delay(Math.random() * 2000 + 1000)];
                case 8:
                    // Add random delay to appear more human-like
                    _a.sent();
                    console.log('Waiting for content to load...');
                    selectors = [
                        'div[class*="jobsearch-JobComponent"]',
                        'div[id="jobsearch-ViewJobButtons"]',
                        'div[class*="jobsearch-JobInfoHeader"]',
                    ];
                    foundSelector = false;
                    _i = 0, selectors_1 = selectors;
                    _a.label = 9;
                case 9:
                    if (!(_i < selectors_1.length)) return [3 /*break*/, 14];
                    selector = selectors_1[_i];
                    _a.label = 10;
                case 10:
                    _a.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, page.waitForSelector(selector, { timeout: 5000 })];
                case 11:
                    _a.sent();
                    console.log("Found selector: ".concat(selector));
                    foundSelector = true;
                    return [3 /*break*/, 14];
                case 12:
                    e_1 = _a.sent();
                    console.log("Selector not found: ".concat(selector));
                    return [3 /*break*/, 13];
                case 13:
                    _i++;
                    return [3 /*break*/, 9];
                case 14:
                    if (!!foundSelector) return [3 /*break*/, 17];
                    console.log('Taking screenshot for debugging...');
                    debugDir = path_1.default.join('job-postings', 'debug');
                    return [4 /*yield*/, promises_1.default.mkdir(debugDir, { recursive: true })];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, page.screenshot({
                            path: path_1.default.join(debugDir, "debug-".concat(Date.now(), ".png")),
                            fullPage: true,
                        })];
                case 16:
                    _a.sent();
                    throw new Error('Could not find any job posting elements');
                case 17: return [4 /*yield*/, page.evaluate(function () {
                        function getTextContent(selector) {
                            var _a;
                            var element = document.querySelector(selector);
                            return ((_a = element === null || element === void 0 ? void 0 : element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                        }
                        var titleSelectors = [
                            'h1.jobsearch-JobInfoHeader-title',
                            '[data-testid="jobsearch-JobInfoHeader-title"]',
                            'h1[class*="jobsearch"]',
                        ];
                        var companySelectors = [
                            'div[data-company-name="true"]',
                            '[data-testid="company-name"]',
                            'div[class*="company-name"]',
                        ];
                        var locationSelectors = [
                            '[data-testid="job-location"]',
                            'div[class*="location"]',
                            'div[class*="company-location"]',
                        ];
                        var descriptionSelectors = [
                            'div[id="jobDescriptionText"]',
                            'div[class*="description"]',
                            'div[class*="job-description"]',
                        ];
                        var title = titleSelectors.map(getTextContent).find(function (text) { return text; }) || 'Unknown Position';
                        var company = companySelectors.map(getTextContent).find(function (text) { return text; }) || 'Unknown Company';
                        var location = locationSelectors.map(getTextContent).find(function (text) { return text; }) || 'Unknown Location';
                        var description = descriptionSelectors.map(getTextContent).find(function (text) { return text; }) || 'No description available';
                        return {
                            title: title,
                            company: company,
                            location: location,
                            description: description,
                            url: window.location.href,
                            scrapedAt: new Date().toISOString(),
                        };
                    })];
                case 18:
                    jobData = _a.sent();
                    outputDir = path_1.default.join('job-postings', "indeed-".concat(Date.now()));
                    return [4 /*yield*/, promises_1.default.mkdir(outputDir, { recursive: true })];
                case 19:
                    _a.sent();
                    // Save screenshot
                    return [4 /*yield*/, page.screenshot({
                            path: path_1.default.join(outputDir, 'page.png'),
                            fullPage: true,
                        })];
                case 20:
                    // Save screenshot
                    _a.sent();
                    return [4 /*yield*/, page.content()];
                case 21:
                    html = _a.sent();
                    return [4 /*yield*/, promises_1.default.writeFile(path_1.default.join(outputDir, 'job.html'), html)];
                case 22:
                    _a.sent();
                    // Save the extracted data
                    return [4 /*yield*/, promises_1.default.writeFile(path_1.default.join(outputDir, 'job-data.json'), JSON.stringify(jobData, null, 2))];
                case 23:
                    // Save the extracted data
                    _a.sent();
                    console.log('Job details saved to:', outputDir);
                    console.log('Title:', jobData.title);
                    console.log('Company:', jobData.company);
                    console.log('Location:', jobData.location);
                    // Add delay before closing
                    return [4 /*yield*/, delay(1000)];
                case 24:
                    // Add delay before closing
                    _a.sent();
                    return [3 /*break*/, 31];
                case 25: return [4 /*yield*/, browser.close()];
                case 26:
                    _a.sent();
                    _a.label = 27;
                case 27:
                    _a.trys.push([27, 29, , 30]);
                    return [4 /*yield*/, promises_1.default.rm(tempUserDataDir, { recursive: true, force: true })];
                case 28:
                    _a.sent();
                    return [3 /*break*/, 30];
                case 29:
                    error_2 = _a.sent();
                    console.log('Note: Could not remove temporary user data directory');
                    return [3 /*break*/, 30];
                case 30: return [7 /*endfinally*/];
                case 31: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var url, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = process.argv[2];
                    if (!url) {
                        console.error('Please provide a job posting URL');
                        process.exit(1);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("Scraping job posting from: ".concat(url));
                    return [4 /*yield*/, scrapeWithPuppeteer(url)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('Error:', error_3 instanceof Error ? error_3.message : String(error_3));
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
