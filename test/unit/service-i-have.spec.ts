import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { IHave } from '../../src/lib/services'

test.describe('bacnet - Services layer iHave unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		IHave.encode(
			buffer,
			{ type: 8, instance: 443 },
			{ type: 0, instance: 4 },
			'LgtCmd01',
		)
		const result = IHave.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			deviceId: { type: 8, instance: 443 },
			objectId: { type: 0, instance: 4 },
			objectName: 'LgtCmd01',
		})
	})
})
