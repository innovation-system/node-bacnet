import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { ReadRange } from '../../src/lib/services'
import { ReadRangeType } from '../../src'

test.describe('bacnet - Services layer ReadRange unit', () => {
	test('should successfully encode and decode by position', (t) => {
		const buffer = utils.getBuffer()
		ReadRange.encode(
			buffer,
			{ type: 61, instance: 35 },
			85,
			0xffffffff,
			ReadRangeType.BY_POSITION,
			10,
			null,
			0,
		)
		const result = ReadRange.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			count: 0,
			objectId: { type: 61, instance: 35 },
			position: 10,
			property: {
				index: 0xffffffff,
				id: 85,
			},
			requestType: ReadRangeType.BY_POSITION,
			time: undefined,
		})
	})

	test('should successfully encode and decode by position with array index', (t) => {
		const buffer = utils.getBuffer()
		ReadRange.encode(
			buffer,
			{ type: 61, instance: 35 },
			12,
			2,
			ReadRangeType.BY_SEQUENCE_NUMBER,
			10,
			null,
			0,
		)
		const result = ReadRange.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			count: 0,
			objectId: { type: 61, instance: 35 },
			position: 10,
			property: {
				index: 2,
				id: 12,
			},
			requestType: ReadRangeType.BY_SEQUENCE_NUMBER,
			time: undefined,
		})
	})

	test('should successfully encode and decode by sequence', (t) => {
		const buffer = utils.getBuffer()
		ReadRange.encode(
			buffer,
			{ type: 61, instance: 35 },
			85,
			0xffffffff,
			ReadRangeType.BY_SEQUENCE_NUMBER,
			11,
			null,
			1111,
		)
		const result = ReadRange.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			count: 1111,
			objectId: { type: 61, instance: 35 },
			position: 11,
			property: {
				index: 0xffffffff,
				id: 85,
			},
			requestType: ReadRangeType.BY_SEQUENCE_NUMBER,
			time: undefined,
		})
	})

	test('should successfully encode and decode by time', (t) => {
		const buffer = utils.getBuffer()
		const date = new Date(1, 1, 1)
		date.setMilliseconds(990)
		ReadRange.encode(
			buffer,
			{ type: 61, instance: 35 },
			85,
			0xffffffff,
			ReadRangeType.BY_TIME_REFERENCE_TIME_COUNT,
			null,
			date,
			-1111,
		)
		const result = ReadRange.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			count: -1111,
			objectId: { type: 61, instance: 35 },
			position: undefined,
			property: {
				index: 0xffffffff,
				id: 85,
			},
			requestType: ReadRangeType.BY_TIME_REFERENCE_TIME_COUNT,
			time: date,
		})
	})
})

test.describe('ReadRangeAcknowledge', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		ReadRange.encodeAcknowledge(
			buffer,
			{ type: 12, instance: 500 },
			5048,
			0xffffffff,
			{ bitsUsed: 24, value: [1, 2, 3] },
			12,
			Buffer.from([1, 2, 3]),
			2,
			2,
		)
		const result = ReadRange.decodeAcknowledge(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: { type: 12, instance: 500 },
			itemCount: 12,
			property: { id: 5048, index: 0xffffffff },
			resultFlag: { bitsUsed: 24, value: [1, 2, 3] },
			rangeBuffer: Buffer.from([1, 2, 3]),
		})
	})
})
