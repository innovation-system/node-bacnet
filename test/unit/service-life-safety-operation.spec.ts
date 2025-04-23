import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baServices from '../../src/lib/services'

test.describe('bacnet - Services layer LifeSafetyOperation unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		baServices.lifeSafetyOperation.encode(buffer, 8, 'User01', 7, {
			type: 0,
			instance: 77,
		})
		const result = baServices.lifeSafetyOperation.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			processId: 8,
			requestingSource: 'User01',
			operation: 7,
			targetObjectId: { type: 0, instance: 77 },
		})
	})
})
