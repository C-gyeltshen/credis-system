/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'esnext'
      }
    }]
  },
  testMatch: [
    '**/src/test/**/*.test.ts',
    '**/src/test/**/*.spec.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/test/**',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
