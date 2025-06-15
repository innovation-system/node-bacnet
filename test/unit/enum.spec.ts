import test from 'node:test'
import assert from 'node:assert'

import * as bacnetEnum from '../../src/lib/enum'

test.describe('bacnet - ENUM tests', () => {
	test('enum get name of BOOLEAN should be defined with 1', () => {
		assert.strictEqual(
			bacnetEnum.getEnumName(bacnetEnum.ApplicationTag, 1, false),
			bacnetEnum.ApplicationTag[1],
		)
	})

	test('enum get name of BOOLEAN(1) should be defined with 1', () => {
		assert.strictEqual(
			bacnetEnum.getEnumName(bacnetEnum.ApplicationTag, 1),
			'BOOLEAN(1)',
		)
	})

	test('enum get undefined with -1', () => {
		assert.strictEqual(
			bacnetEnum.getEnumName(bacnetEnum.ApplicationTag, -1, false),
			'-1',
		)
	})
})
