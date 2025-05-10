import '@testing-library/jest-dom';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
declare global {
    namespace Vi {
        interface JestAssertion<T = unknown> extends TestingLibraryMatchers<T, void> {
        }
    }
}
//# sourceMappingURL=vitest.setup.d.ts.map