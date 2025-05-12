import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { ErrorService } from '../../src/lib/services'

test.describe('bacnet - Services layer Error unit', () => {
	test('should successfully encode and decode', () => {
		const buffer = utils.getBuffer()
		ErrorService.encode(buffer, 15, 25)
		const result = ErrorService.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			class: 15,
			code: 25,
		})
	})
})
