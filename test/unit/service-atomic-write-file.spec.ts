import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { AtomicWriteFile } from '../../src/lib/services'

test.describe('bacnet - Services layer AtomicWriteFile unit', () => {
	test('should successfully encode and decode as stream', () => {
		const buffer = utils.getBuffer()
		AtomicWriteFile.encode(buffer, true, { type: 12, instance: 51 }, 5, [
			[12, 12],
		])
		const result = AtomicWriteFile.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: { type: 12, instance: 51 },
			isStream: true,
			position: 5,
			blocks: [[12, 12]],
		})
	})

	test('should successfully encode and decode as non-stream', () => {
		const buffer = utils.getBuffer()
		AtomicWriteFile.encode(buffer, false, { type: 12, instance: 88 }, 10, [
			[12, 12],
			[12, 12],
		])
		const result = AtomicWriteFile.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: { type: 12, instance: 88 },
			isStream: false,
			position: 10,
			blocks: [
				[12, 12],
				[12, 12],
			],
		})
	})
})

test.describe('AtomicWriteFileAcknowledge', () => {
	test('should successfully encode and decode streamed file', () => {
		const buffer = utils.getBuffer()
		AtomicWriteFile.encodeAcknowledge(buffer, true, -10)
		const result = AtomicWriteFile.decodeAcknowledge(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			isStream: true,
			position: -10,
		})
	})

	test('should successfully encode and decode non-streamed file', () => {
		const buffer = utils.getBuffer()
		AtomicWriteFile.encodeAcknowledge(buffer, false, 10)
		const result = AtomicWriteFile.decodeAcknowledge(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			isStream: false,
			position: 10,
		})
	})
})
