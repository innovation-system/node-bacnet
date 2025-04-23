import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baServices from '../../src/lib/services'

test.describe('bacnet - Services layer Error unit', () => {
	test('should successfully encode and decode', () => {
		const buffer = utils.getBuffer()
		baServices.error.encode(buffer, 15, 25)
		const result = baServices.error.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			class: 15,
			code: 25,
		})
	})
})
