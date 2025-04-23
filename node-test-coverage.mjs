export default {
	include: ['src/lib/**/*.ts'],
	exclude: ['node_modules/**', 'test/**', 'dist/**'],
	reporter: ['text', 'lcov', 'clover', 'json'],
	thresholds: {
		branches: 80,
		functions: 80,
		lines: 80,
		statements: 90,
	},
}
