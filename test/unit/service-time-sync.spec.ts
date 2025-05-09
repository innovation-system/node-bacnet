import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { ServicesMap } from '../../src/lib/services'

test.describe('bacnet - Services layer TimeSync unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		const date = new Date()
		date.setMilliseconds(990)
		ServicesMap.timeSync.encode(buffer, date)
		const result = ServicesMap.timeSync.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			value: date,
		})
	})
})
