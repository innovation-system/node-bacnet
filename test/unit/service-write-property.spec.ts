import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { WriteProperty } from '../../src/lib/services'

test.describe('bacnet - Services layer WriteProperty unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		const date = new Date(1, 1, 1)
		const time = new Date(1, 1, 1)
		time.setMilliseconds(990)
		WriteProperty.encode(buffer, 31, 12, 80, 0xffffffff, 0, [
			{ type: 0, value: null },
			{ type: 1, value: null },
			{ type: 1, value: true },
			{ type: 1, value: false },
			{ type: 2, value: 1 },
			{ type: 2, value: 1000 },
			{ type: 2, value: 1000000 },
			{ type: 2, value: 1000000000 },
			{ type: 3, value: -1 },
			{ type: 3, value: -1000 },
			{ type: 3, value: -1000000 },
			{ type: 3, value: -1000000000 },
			{ type: 4, value: 0 },
			{ type: 5, value: 100.121212 },
			{ type: 7, value: 'Test1234$' },
			{ type: 9, value: 4 },
			{ type: 10, value: date },
			{ type: 11, value: time },
			{ type: 12, value: { type: 3, instance: 0 } },
		])
		const result = WriteProperty.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: {
				instance: 12,
				type: 31,
			},
			value: {
				priority: 16,
				property: {
					index: 4294967295,
					id: 80,
				},
				value: [
					{ type: 0, value: null },
					{ type: 0, value: null },
					{ type: 1, value: true },
					{ type: 1, value: false },
					{ type: 2, value: 1 },
					{ type: 2, value: 1000 },
					{ type: 2, value: 1000000 },
					{ type: 2, value: 1000000000 },
					{ type: 3, value: -1 },
					{ type: 3, value: -1000 },
					{ type: 3, value: -1000000 },
					{ type: 3, value: -1000000000 },
					{ type: 4, value: 0 },
					{ type: 5, value: 100.121212 },
					{ type: 7, value: 'Test1234$', encoding: 0 },
					{ type: 9, value: 4 },
					{ type: 10, value: date },
					{ type: 11, value: time },
					{ type: 12, value: { type: 3, instance: 0 } },
				],
			},
		})
	})

	test('should successfully encode and decode with defined priority', (t) => {
		const buffer = utils.getBuffer()
		const date = new Date(1, 1, 1)
		const time = new Date(1, 1, 1)
		time.setMilliseconds(990)
		WriteProperty.encode(buffer, 31, 12, 80, 0xffffffff, 8, [
			{ type: 0, value: null },
			{ type: 1, value: null },
			{ type: 1, value: true },
			{ type: 1, value: false },
			{ type: 2, value: 1 },
			{ type: 2, value: 1000 },
			{ type: 2, value: 1000000 },
			{ type: 2, value: 1000000000 },
			{ type: 3, value: -1 },
			{ type: 3, value: -1000 },
			{ type: 3, value: -1000000 },
			{ type: 3, value: -1000000000 },
			{ type: 4, value: 0 },
			{ type: 5, value: 100.121212 },
			{ type: 7, value: 'Test1234$' },
			{ type: 9, value: 4 },
			{ type: 10, value: date },
			{ type: 11, value: time },
			{ type: 12, value: { type: 3, instance: 0 } },
		])
		const result = WriteProperty.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: {
				instance: 12,
				type: 31,
			},
			value: {
				priority: 8,
				property: {
					index: 4294967295,
					id: 80,
				},
				value: [
					{ type: 0, value: null },
					{ type: 0, value: null },
					{ type: 1, value: true },
					{ type: 1, value: false },
					{ type: 2, value: 1 },
					{ type: 2, value: 1000 },
					{ type: 2, value: 1000000 },
					{ type: 2, value: 1000000000 },
					{ type: 3, value: -1 },
					{ type: 3, value: -1000 },
					{ type: 3, value: -1000000 },
					{ type: 3, value: -1000000000 },
					{ type: 4, value: 0 },
					{ type: 5, value: 100.121212 },
					{ type: 7, value: 'Test1234$', encoding: 0 },
					{ type: 9, value: 4 },
					{ type: 10, value: date },
					{ type: 11, value: time },
					{ type: 12, value: { type: 3, instance: 0 } },
				],
			},
		})
	})

	test('should successfully encode and decode with defined array index', (t) => {
		const buffer = utils.getBuffer()
		const date = new Date(1, 1, 1)
		const time = new Date(1, 1, 1)
		time.setMilliseconds(990)
		WriteProperty.encode(buffer, 31, 12, 80, 2, 0, [
			{ type: 0, value: null },
			{ type: 0, value: null },
			{ type: 1, value: true },
			{ type: 1, value: false },
			{ type: 2, value: 1 },
			{ type: 2, value: 1000 },
			{ type: 2, value: 1000000 },
			{ type: 2, value: 1000000000 },
			{ type: 3, value: -1 },
			{ type: 3, value: -1000 },
			{ type: 3, value: -1000000 },
			{ type: 3, value: -1000000000 },
			{ type: 4, value: 0 },
			{ type: 5, value: 100.121212 },
			{ type: 7, value: 'Test1234$', encoding: 0 },
			{ type: 9, value: 4 },
			{ type: 10, value: date },
			{ type: 11, value: time },
			{ type: 12, value: { type: 3, instance: 0 } },
		])
		const result = WriteProperty.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: {
				instance: 12,
				type: 31,
			},
			value: {
				priority: 16,
				property: {
					index: 2,
					id: 80,
				},
				value: [
					{ type: 0, value: null },
					{ type: 0, value: null },
					{ type: 1, value: true },
					{ type: 1, value: false },
					{ type: 2, value: 1 },
					{ type: 2, value: 1000 },
					{ type: 2, value: 1000000 },
					{ type: 2, value: 1000000000 },
					{ type: 3, value: -1 },
					{ type: 3, value: -1000 },
					{ type: 3, value: -1000000 },
					{ type: 3, value: -1000000000 },
					{ type: 4, value: 0 },
					{ type: 5, value: 100.121212 },
					{ type: 7, value: 'Test1234$', encoding: 0 },
					{ type: 9, value: 4 },
					{ type: 10, value: date },
					{ type: 11, value: time },
					{ type: 12, value: { type: 3, instance: 0 } },
				],
			},
		})
	})
})
