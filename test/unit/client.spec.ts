import test from 'node:test'
import assert from 'node:assert'

import Client from '../../src/lib/client'
import { ServicesSupported } from '../../src'

test.describe('bacnet - client', () => {
	test('should successfuly encode a bitstring > 32 bits', () => {
		const result = Client.createBitstring([
			ServicesSupported.CONFIRMED_COV_NOTIFICATION,
			ServicesSupported.READ_PROPERTY,
			ServicesSupported.WHO_IS,
		])
		assert.deepStrictEqual(result, {
			value: [2, 16, 0, 0, 4],
			bitsUsed: 35,
		})
	})

	test('should successfuly encode a bitstring < 8 bits', () => {
		const result = Client.createBitstring([
			ServicesSupported.GET_ALARM_SUMMARY,
		])
		assert.deepStrictEqual(result, {
			value: [8],
			bitsUsed: 4,
		})
	})

	test('should successfuly encode a bitstring of only one bit', () => {
		const result = Client.createBitstring([
			ServicesSupported.ACKNOWLEDGE_ALARM,
		])
		assert.deepStrictEqual(result, {
			value: [1],
			bitsUsed: 1,
		})
	})
})
