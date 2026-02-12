const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Caminho para a tua app Next.js
  dir: './',
})

// Configurações personalizadas do Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Alias para imports (se usares @/components/...)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(customJestConfig)