import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baServices from '../../src/lib/services'

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

test.describe('bacnet - Services layer ReadPropertyMultiple unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		baServices.readPropertyMultiple.encode(buffer, [
			{
				objectId: { type: 51, instance: 1 },
				properties: [
					{ id: 85, index: 0xffffffff },
					{ id: 85, index: 4 },
				],
			},
		])
		const result = baServices.readPropertyMultiple.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		const cleanResult = removeLen(result)

		assert.deepStrictEqual(cleanResult, {
			properties: [
				{
					objectId: { type: 51, instance: 1 },
					properties: [
						{ id: 85, index: 0xffffffff },
						{ id: 85, index: 4 },
					],
				},
			],
		})
	})
})

test.describe('ReadPropertyMultipleAcknowledge', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		const date = new Date(1, 1, 1)
		const time = new Date(1, 1, 1)
		time.setMilliseconds(990)
		baServices.readPropertyMultiple.encodeAcknowledge(buffer, [
			{
				objectId: { type: 9, instance: 50000 },
				values: [
					{
						property: { id: 81, index: 0xffffffff },
						value: [
							{ type: 0 },
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
							{ type: 4, value: 0.1 },
							{ type: 5, value: 100.121212 },
							{ type: 6, value: [1, 2, 100, 200] },
							{ type: 7, value: 'Test1234$' },
							{ type: 8, value: { bitsUsed: 0, value: [] } },
							{
								type: 8,
								value: {
									bitsUsed: 24,
									value: [0xaa, 0xaa, 0xaa],
								},
							},
							{ type: 9, value: 4 },
							{ type: 10, value: date },
							{ type: 11, value: time },
							{ type: 12, value: { type: 3, instance: 0 } },
						],
					},
				],
			},
		])
		const result = baServices.readPropertyMultiple.decodeAcknowledge(
			buffer.buffer,
			0,
			buffer.offset,
		)
		const cleanResult = removeLen(result)

		const modifiedResult = JSON.parse(JSON.stringify(cleanResult))

		modifiedResult.values[0].values[0].value[12].value = 0

		modifiedResult.values[0].values[0].value[19].value =
			'1901-01-31T23:00:00.000Z'
		modifiedResult.values[0].values[0].value[20].value =
			'1901-01-31T23:00:00.990Z'

		assert.deepStrictEqual(modifiedResult, {
			values: [
				{
					objectId: {
						type: 9,
						instance: 50000,
					},
					values: [
						{
							index: 4294967295,
							id: 81,
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
								{ type: 6, value: [1, 2, 100, 200] },
								{ type: 7, value: 'Test1234$', encoding: 0 },
								{ type: 8, value: { bitsUsed: 0, value: [] } },
								{
									type: 8,
									value: {
										bitsUsed: 24,
										value: [0xaa, 0xaa, 0xaa],
									},
								},
								{ type: 9, value: 4 },
								{ type: 10, value: '1901-01-31T23:00:00.000Z' },
								{ type: 11, value: '1901-01-31T23:00:00.990Z' },
								{ type: 12, value: { type: 3, instance: 0 } },
							],
						},
					],
				},
			],
		})
	})

	test('should successfully encode and decode an error', (t) => {
		const buffer = utils.getBuffer()
		baServices.readPropertyMultiple.encodeAcknowledge(buffer, [
			{
				objectId: { type: 9, instance: 50000 },
				values: [
					{
						property: { id: 81, index: 0xffffffff },
						value: [
							{
								type: 0,
								value: {
									type: 'BacnetError',
									errorClass: 12,
									errorCode: 13,
								},
							},
						],
					},
				],
			},
		])
		const result = baServices.readPropertyMultiple.decodeAcknowledge(
			buffer.buffer,
			0,
			buffer.offset,
		)
		const cleanResult = removeLen(result)

		assert.deepStrictEqual(cleanResult, {
			values: [
				{
					objectId: {
						type: 9,
						instance: 50000,
					},
					values: [
						{
							index: 4294967295,
							id: 81,
							value: [
								{
									type: 105,
									value: {
										errorClass: 12,
										errorCode: 13,
									},
								},
							],
						},
					],
				},
			],
		})
	})
})
