module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  testMatch: ["<rootDir>/tests/**/*.test.(ts|tsx)"],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "!app/**/layout.tsx",
    "!app/**/page.tsx",
    "!app/**/loading.tsx",
  ],
  coverageReporters: ["text", "lcov", "json"],
  coverageThreshold: {
    global: {
      branches: 77,
      functions: 36,
      lines: 67,
      statements: 66,
    },
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
        },
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(next-auth|@auth/core|@auth)/)"],
  testTimeout: 10000,
};
