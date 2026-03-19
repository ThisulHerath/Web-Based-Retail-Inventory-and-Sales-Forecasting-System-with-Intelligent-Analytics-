export default {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    collectCoverageFrom: ['middleware/**/*.js', 'routes/**/*.js'],
    coverageDirectory: 'coverage',
};
