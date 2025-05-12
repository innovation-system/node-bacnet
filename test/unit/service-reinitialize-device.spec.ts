import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { ReinitializeDevice } from '../../src/lib/services'

test.describe('bacnet - Services layer ReinitializeDevice unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		let password
		ReinitializeDevice.encode(buffer, 5, password)
		const result = ReinitializeDevice.decode(
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
		ReinitializeDevice.encode(buffer, 5, 'Test1234$')
		const result = ReinitializeDevice.decode(
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
