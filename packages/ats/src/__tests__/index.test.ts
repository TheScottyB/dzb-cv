import { describe, it, expect } from 'vitest';
import { makeCV } from '../test-utils';
import * as ATS from '../index';

describe('test-utils', () => {
  it('makeCV should override sampleCV fields', () => {
    const custom = makeCV({
      personalInfo: {
        name: { first: 'Test', last: 'User', full: 'Test User' },
        contact: { email: 'test@example.com', phone: '123-456-7890' },
      },
    });
    expect(custom.personalInfo.name.first).toBe('Test');
    expect(custom.personalInfo.name.last).toBe('User');
    expect(custom.personalInfo.name.full).toBe('Test User');
  });
});

describe('ATS index exports', () => {
  it('should export createATSEngine from the root index', () => {
    expect(ATS).toHaveProperty('createATSEngine');
    expect(typeof ATS.createATSEngine).toBe('function');
  });
});
