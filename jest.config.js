const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/pages/(.*)$": "<rootDir>/pages/$1",
    "^@/borders/(.*)$": "<rootDir>/borders/$1",
    "^@/styles/(.*)$": "<rootDir>/styles/$1",
  },
  testEnvironment: "jest-environment-jsdom-global",
};

module.exports = createJestConfig(customJestConfig);
