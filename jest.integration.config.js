module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.integration.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["<rootDir>/tests/integration/**/*.test.(ts|tsx)"],
  collectCoverageFrom: [
    "app/api/**/*.ts",
    "lib/**/*.ts",
    "!app/**/layout.tsx",
    "!app/**/page.tsx",
    "!app/**/loading.tsx",
  ],
  coverageReporters: ['text', 'lcov', 'json'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
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
  transformIgnorePatterns: ["node_modules/(?!(next-auth|@auth/core)/)"],
};
