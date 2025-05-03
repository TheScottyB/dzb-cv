module.exports = {
  root: true,
  extends: [
    "../config/src/eslint/index.cjs",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  plugins: [
    "react",
    "react-hooks",
    "jsx-a11y"
  ],
  settings: {
    react: {
      version: "detect"
    }
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    // React specific rules
    "react/prop-types": "off", // We're using TypeScript for type checking
    "react/react-in-jsx-scope": "off", // Not needed with React 17+
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    
    // Accessibility rules
    "jsx-a11y/anchor-is-valid": "warn",

    // Component naming and structure
    "react/function-component-definition": [
      "warn",
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function"
      }
    ],
    "react/jsx-sort-props": [
      "warn",
      {
        callbacksLast: true,
        shorthandFirst: true,
        ignoreCase: true,
        reservedFirst: true
      }
    ]
  }
};

