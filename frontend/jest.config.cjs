module.exports = {
  // Environnement de test
  testEnvironment: 'jsdom',
  
  // Transformations
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  
  // Patterns à ignorer lors de la transformation
  transformIgnorePatterns: [
    '/node_modules/(?!(axios|@testing-library|zustand)/)'
  ],
  
  // Mappages pour les imports de fichiers non-JS
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/tests/mocks/fileMock.js',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  // Fichiers de configuration à exécuter avant les tests
  setupFilesAfterEnv: [
    '<rootDir>/src/tests/setupTests.js'
  ],
  
  // Extensions de fichiers à considérer
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Répertoires où chercher les modules
  moduleDirectories: ['node_modules', 'src'],
  
  // Patterns de fichiers de test
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  
  // Couverture de code
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],
  
  // Répertoire pour les rapports de couverture
  coverageDirectory: 'coverage',
  
  // Seuil de couverture
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  }
};
