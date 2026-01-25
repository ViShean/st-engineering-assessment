/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          target: "ESNext",
          module: "ESNext",
          moduleResolution: "NodeNext",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/middleware/*.ts",
    "src/services/*.ts",
    "src/utils/*.ts",

    "!src/app.ts",
    "!src/db/index.ts",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
};
