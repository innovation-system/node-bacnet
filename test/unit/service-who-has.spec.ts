import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baServices from '../../src/lib/services'

test.describe('bacnet - Services layer WhoHas unit', () => {
	test('should successfully encode and decode by id', (t) => {
		const buffer = utils.getBuffer()
		baServices.whoHas.encode(buffer, 3, 4000, { type: 3, instance: 15 })
		const result = baServices.whoHas.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			lowLimit: 3,
			highLimit: 4000,
			objectId: {
				type: 3,
				instance: 15,
			},
		})
	})

	test('should successfully encode and decode by name', (t) => {
		const buffer = utils.getBuffer()
		baServices.whoHas.encode(buffer, 3, 4000, undefined, 'analog-output-1')
		const result = baServices.whoHas.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			lowLimit: 3,
			highLimit: 4000,
			objectName: 'analog-output-1',
		})
	})
})
