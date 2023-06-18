module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^utils/(.*)$': '<rootDir>/utils/$1',
    '^components/(.*)$': '<rootDir>/components/$1',
    '^context/(.*)$': '<rootDir>/context/$1',
    '^assets/(.*)$': '<rootDir>/assets/$1',
    // Handle CSS/style imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: false,
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!(react-native|@react-native|expo|@expo|nativewind)/)'],
  collectCoverageFrom: [
    'utils/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'context/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    // Focus coverage thresholds on utility functions with complex logic
    'utils/classesHelpers.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'utils/deceasedHelpers.ts': {
      branches: 80,
      functions: 70,
      lines: 80,
      statements: 80,
    },
    'utils/utils.ts': {
      branches: 30,
      functions: 50,
      lines: 40,
      statements: 40,
    },
    'utils/zmanim_wrapper.ts': {
      branches: 5,
      functions: 90,
      lines: 60,
      statements: 60,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  clearMocks: true,
  resetMocks: false,
  testTimeout: 10000,
};
