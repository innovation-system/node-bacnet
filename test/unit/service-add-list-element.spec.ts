import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { AddListElement } from '../../src/lib/services'

test.describe('bacnet - Services layer AddListElement unit', () => {
	test('should successfully encode and decode', () => {
		const buffer = utils.getBuffer()
		AddListElement.encode(buffer, { type: 11, instance: 560 }, 85, 2, [
			{ type: 1, value: false },
			{ type: 2, value: 1 },
		])
		const result = AddListElement.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			objectId: { type: 11, instance: 560 },
			property: { id: 85, index: 2 },
			values: [
				{ type: 1, value: false },
				{ type: 2, value: 1 },
			],
		})
	})
})
