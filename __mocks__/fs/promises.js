/**
 * Manual Jest mock for fs/promises.
 * Place this file in __mocks__/fs/promises.js at project root.
 * Jest will automatically load this for any 'fs/promises' import.
 */
const actual = jest.requireActual('fs/promises');
module.exports = {
  ...actual,
  stat: jest.fn(),
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
};

