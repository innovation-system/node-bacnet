import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { TimeSync } from '../../src/lib/services'

test.describe('bacnet - Services layer TimeSync unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		const date = new Date()
		date.setMilliseconds(990)
		TimeSync.encode(buffer, date)
		const result = TimeSync.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			value: date,
		})
	})
})
