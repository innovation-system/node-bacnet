import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baServices from '../../src/lib/services'

test.describe('bacnet - Services layer subscribeCov unit', () => {
	test('should successfully encode and decode a cancelation request', (t) => {
		const buffer = utils.getBuffer()
		baServices.subscribeCov.encode(
			buffer,
			10,
			{ type: 3, instance: 1 },
			true,
		)
		const result = baServices.subscribeCov.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			cancellationRequest: true,
			monitoredObjectId: { type: 3, instance: 1 },
			subscriberProcessId: 10,
		})
	})

	test('should successfully encode and decode subscription request', (t) => {
		const buffer = utils.getBuffer()
		baServices.subscribeCov.encode(
			buffer,
			11,
			{ type: 3, instance: 2 },
			false,
			true,
			5000,
		)
		const result = baServices.subscribeCov.decode(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			cancellationRequest: false,
			issueConfirmedNotifications: true,
			lifetime: 5000,
			monitoredObjectId: { type: 3, instance: 2 },
			subscriberProcessId: 11,
		})
	})
})
