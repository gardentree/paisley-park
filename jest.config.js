const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js", "jest-localstorage-mock"],
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/pages/(.*)$": "<rootDir>/pages/$1",
    "^@/borders/(.*)$": "<rootDir>/borders/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@/libraries/(.*)$": "<rootDir>/libraries/$1",
  },
  testEnvironment: "jest-environment-jsdom-global",
};

module.exports = createJestConfig(customJestConfig);
