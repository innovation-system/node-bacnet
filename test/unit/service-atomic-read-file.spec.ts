import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baServices from '../../src/lib/services'

test.describe('bacnet - Services layer AtomicReadFile unit', () => {
	test('should successfully encode and decode as stream', () => {
		const buffer = utils.getBuffer()
		baServices.atomicReadFile.encode(
			buffer,
			true,
			{ type: 13, instance: 5000 },
			-50,
			12,
		)
		const result = baServices.atomicReadFile.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: { type: 13, instance: 5000 },
			count: 12,
			isStream: true,
			position: -50,
		})
	})

	test('should successfully encode and decode as non-stream', () => {
		const buffer = utils.getBuffer()
		baServices.atomicReadFile.encode(
			buffer,
			false,
			{ type: 14, instance: 5001 },
			60,
			13,
		)
		const result = baServices.atomicReadFile.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: { type: 14, instance: 5001 },
			count: 13,
			isStream: false,
			position: 60,
		})
	})
})

test.describe('AtomicReadFileAcknowledge', () => {
	test('should successfully encode and decode as stream', () => {
		const buffer = utils.getBuffer()
		baServices.atomicReadFile.encodeAcknowledge(
			buffer,
			true,
			false,
			0,
			90,
			[[12, 12, 12]],
			[3],
		)
		const result = baServices.atomicReadFile.decodeAcknowledge(
			buffer.buffer,
			0,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			isStream: true,
			position: 0,
			endOfFile: false,
			buffer: Buffer.from([12, 12, 12]),
		})
	})

	test('should successfully encode and decode as non-stream', () => {
		const buffer = utils.getBuffer()
		baServices.atomicReadFile.encodeAcknowledge(
			buffer,
			false,
			false,
			0,
			90,
			[[12, 12, 12]],
			[3],
		)
		// TODO: AtomicReadFileAcknowledge as non-stream not yet implemented
		assert.throws(
			() => baServices.atomicReadFile.decodeAcknowledge(buffer.buffer, 0),
			/NotImplemented/,
		)
	})
})
