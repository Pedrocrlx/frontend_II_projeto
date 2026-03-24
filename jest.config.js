import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Path to next.js app
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid)/)',
  ],
}

export default createJestConfig(customJestConfig)