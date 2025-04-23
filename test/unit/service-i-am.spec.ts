import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baServices from '../../src/lib/services'

test.describe('bacnet - Services layer Iam unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		baServices.iAm.encode(buffer, 47, 1, 1, 7)
		const result = baServices.iAm.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			deviceId: 47,
			maxApdu: 1,
			segmentation: 1,
			vendorId: 7,
		})
	})
})
