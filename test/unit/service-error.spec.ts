import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { ServicesMap } from '../../src/lib/services'

test.describe('bacnet - Services layer Error unit', () => {
	test('should successfully encode and decode', () => {
		const buffer = utils.getBuffer()
		ServicesMap.error.encode(buffer, 15, 25)
		const result = ServicesMap.error.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			class: 15,
			code: 25,
		})
	})
})
