import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { DeleteObject } from '../../src/lib/services'

test.describe('bacnet - Services layer DeleteObject unit', () => {
	test('should successfully encode and decode', () => {
		const buffer = utils.getBuffer()
		DeleteObject.encode(buffer, { type: 1, instance: 10 })
		const result = DeleteObject.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			objectType: 1,
			instance: 10,
		})
	})
})
