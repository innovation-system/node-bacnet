import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { ServicesMap } from '../../src/lib/services'

test.describe('bacnet - Services layer DeviceCommunicationControl unit', () => {
	test('should successfully encode and decode', () => {
		const buffer = utils.getBuffer()
		let password
		ServicesMap.deviceCommunicationControl.encode(buffer, 30, 1, password)
		const result = ServicesMap.deviceCommunicationControl.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			timeDuration: 30,
			enableDisable: 1,
		})
	})

	test('should successfully encode and decode with password', () => {
		const buffer = utils.getBuffer()
		ServicesMap.deviceCommunicationControl.encode(
			buffer,
			30,
			1,
			'Test1234!',
		)
		const result = ServicesMap.deviceCommunicationControl.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			timeDuration: 30,
			enableDisable: 1,
			password: 'Test1234!',
		})
	})
})
