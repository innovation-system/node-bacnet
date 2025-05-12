import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { WritePropertyMultiple } from '../../src/lib/services'

function removeLen(obj: any): any {
	if (obj === null || typeof obj !== 'object') return obj

	if (Array.isArray(obj)) {
		return obj.map((item) => removeLen(item))
	}

	const newObj = { ...obj }
	delete newObj.len

	for (const key in newObj) {
		newObj[key] = removeLen(newObj[key])
	}

	return newObj
}

test.describe('bacnet - Services layer WritePropertyMultiple unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		const date = new Date(1, 1, 1)
		const time = new Date(1, 1, 1)
		time.setMilliseconds(990)
		WritePropertyMultiple.encode(buffer, { type: 39, instance: 2400 }, [
			{
				property: { id: 81, index: 0xffffffff },
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
					{ type: 4, value: 0.1 },
					{ type: 5, value: 100.121212 },
					{ type: 6, value: [1, 2, 100, 200] },
					{ type: 7, value: 'Test1234$' },
					{ type: 8, value: { bitsUsed: 0, value: [] } },
					{
						type: 8,
						value: { bitsUsed: 24, value: [0xaa, 0xaa, 0xaa] },
					},
					{ type: 9, value: 4 },
					{ type: 10, value: date },
					{ type: 11, value: time },
					{ type: 12, value: { type: 3, instance: 0 } },
				],
				priority: 0,
			},
		])
		const result = WritePropertyMultiple.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		const cleanResult = removeLen(result)

		const roundedResult = JSON.parse(JSON.stringify(cleanResult))
		roundedResult.values[0].value[12].value =
			Math.floor(roundedResult.values[0].value[12].value * 1000) / 1000

		roundedResult.values[0].value[19].value = date
		roundedResult.values[0].value[20].value = time

		assert.deepStrictEqual(roundedResult, {
			objectId: {
				type: 39,
				instance: 2400,
			},
			values: [
				{
					priority: 0,
					property: {
						index: 0xffffffff,
						id: 81,
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
						{ type: 4, value: 0.1 },
						{ type: 5, value: 100.121212 },
						{ type: 6, value: [1, 2, 100, 200] },
						{ type: 7, value: 'Test1234$', encoding: 0 },
						{ type: 8, value: { bitsUsed: 0, value: [] } },
						{
							type: 8,
							value: { bitsUsed: 24, value: [0xaa, 0xaa, 0xaa] },
						},
						{ type: 9, value: 4 },
						{ type: 10, value: date },
						{ type: 11, value: time },
						{ type: 12, value: { type: 3, instance: 0 } },
					],
				},
			],
		})
	})

	test('should successfully encode and decode with defined priority', (t) => {
		const buffer = utils.getBuffer()
		const time = new Date(1, 1, 1)
		time.setMilliseconds(990)
		WritePropertyMultiple.encode(buffer, { type: 39, instance: 2400 }, [
			{
				property: { id: 81, index: 0xffffffff },
				value: [{ type: 7, value: 'Test1234$' }],
				priority: 12,
			},
		])
		const result = WritePropertyMultiple.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		const cleanResult = removeLen(result)
		assert.deepStrictEqual(cleanResult, {
			objectId: {
				type: 39,
				instance: 2400,
			},
			values: [
				{
					priority: 12,
					property: {
						index: 0xffffffff,
						id: 81,
					},
					value: [{ type: 7, value: 'Test1234$', encoding: 0 }],
				},
			],
		})
	})

	test('should successfully encode and decode with defined array index', (t) => {
		const buffer = utils.getBuffer()
		const time = new Date(1, 1, 1)
		time.setMilliseconds(990)
		WritePropertyMultiple.encode(buffer, { type: 39, instance: 2400 }, [
			{
				property: { id: 81, index: 414141 },
				value: [{ type: 7, value: 'Test1234$' }],
				priority: 0,
			},
		])
		const result = WritePropertyMultiple.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		const cleanResult = removeLen(result)
		assert.deepStrictEqual(cleanResult, {
			objectId: {
				type: 39,
				instance: 2400,
			},
			values: [
				{
					priority: 0,
					property: {
						index: 414141,
						id: 81,
					},
					value: [{ type: 7, value: 'Test1234$', encoding: 0 }],
				},
			],
		})
	})
})
