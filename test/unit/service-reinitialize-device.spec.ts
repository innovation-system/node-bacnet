import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baServices from '../../src/lib/services'

test.describe('bacnet - Services layer ReinitializeDevice unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		let password
		baServices.reinitializeDevice.encode(buffer, 5, password)
		const result = baServices.reinitializeDevice.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			state: 5,
		})
	})

	test('should successfully encode and decode with password', (t) => {
		const buffer = utils.getBuffer()
		baServices.reinitializeDevice.encode(buffer, 5, 'Test1234$')
		const result = baServices.reinitializeDevice.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			state: 5,
			password: 'Test1234$',
		})
	})
})
