import { vi } from 'vitest';

export class Browser {
  async newPage() {
    return new Page();
  }
  async close() {}
  async disconnect() {}
}

export class Page {
  async setContent() {}
  async pdf() {
    return Buffer.from('mock pdf content');
  }
  async close() {}
  async evaluate<T>(fn: () => T | Promise<T>): Promise<T> {
    return Promise.resolve('mock content' as unknown as T);
  }
}

// Create mock implementations
const launch = vi.fn().mockImplementation(async () => new Browser());
const connect = vi.fn().mockImplementation(async () => new Browser());

// Spy on instance methods
vi.spyOn(Browser.prototype, 'newPage');
vi.spyOn(Browser.prototype, 'close');
vi.spyOn(Browser.prototype, 'disconnect');
vi.spyOn(Page.prototype, 'setContent');
vi.spyOn(Page.prototype, 'pdf');
vi.spyOn(Page.prototype, 'close');
vi.spyOn(Page.prototype, 'evaluate');

// Export as both named exports and default export
export { launch, connect };
export default { launch, connect, Browser, Page };
