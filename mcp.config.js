// mcp.config.js
export default {
  tools: {
    eslint: {
      name: 'eslint',
      description: 'ESLint MCP server for TypeScript and React',
      version: '8.31.1',
      commands: {
        lint: {
          description: 'Lint files using ESLint',
          parameters: {
            files: {
              type: 'array',
              description: 'Files to lint',
              items: { type: 'string' },
            },
            fix: {
              type: 'boolean',
              description: 'Auto-fix problems',
              default: false,
            },
          },
        },
        status: {
          description: 'Get ESLint server status',
          parameters: {},
        },
      },
      configuration: {
        eslint: {
          linterOptions: {
            reportUnusedDisableDirectives: true,
            noInlineConfig: true,
          },
          languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            parser: '@typescript-eslint/parser',
            parserOptions: {
              project: './tsconfig.json',
              tsconfigRootDir: '.',
              ecmaFeatures: {
                jsx: true,
              },
            },
          },
          plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
          settings: {
            'import/resolver': {
              typescript: true,
              node: true,
            },
            react: {
              version: 'detect',
            },
          },
        },
      },
    },
  },

  server: {
    port: 3000,
    host: 'localhost',
    cors: true,
  },

  // Integration settings for different editors
  editors: {
    vscode: {
      extension: {
        id: 'eslint-mcp',
        contributes: {
          configuration: {
            type: 'object',
            title: 'ESLint MCP',
            properties: {
              'eslint-mcp.enable': {
                type: 'boolean',
                default: true,
                description: 'Enable ESLint MCP server',
              },
              'eslint-mcp.autoFixOnSave': {
                type: 'boolean',
                default: false,
                description: 'Auto-fix ESLint issues on save',
              },
            },
          },
        },
      },
    },
    cursor: {
      settings: {
        'eslint.MCPServer.enable': true,
        'eslint.MCPServer.validateOnType': true,
      },
    },
  },
};
