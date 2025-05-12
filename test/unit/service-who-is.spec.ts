import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { WhoIs } from '../../src/lib/services'

test.describe('bacnet - Services layer WhoIs unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		WhoIs.encode(buffer, 1, 3000)
		const result = WhoIs.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			lowLimit: 1,
			highLimit: 3000,
		})
	})
})
