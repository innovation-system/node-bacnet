import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { ObjectType, PropertyIdentifier } from '../../src'
import { SubscribeProperty } from '../../src/lib/services'

test.describe('bacnet - Services layer SubscribeProperty unit', () => {
	test('should successfully encode and decode with cancellation request', (t) => {
		const buffer = utils.getBuffer()
		SubscribeProperty.encode(
			buffer,
			7,
			{ type: ObjectType.DEVICE, instance: 362 },
			true,
			false,
			1,
			{ id: PropertyIdentifier.PRESENT_VALUE, index: 0xffffffff },
			true,
			1,
		)
		const result = SubscribeProperty.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			cancellationRequest: true,
			covIncrement: 1,
			issueConfirmedNotifications: false,
			lifetime: 0,
			monitoredObjectId: {
				instance: 362,
				type: ObjectType.DEVICE,
			},
			monitoredProperty: {
				index: 4294967295,
				id: PropertyIdentifier.PRESENT_VALUE,
			},
			subscriberProcessId: 7,
		})
	})

	test('should successfully encode and decode without cancellation request', (t) => {
		const buffer = utils.getBuffer()
		SubscribeProperty.encode(
			buffer,
			8,
			{ type: ObjectType.DEVICE, instance: 363 },
			false,
			true,
			2,
			{ id: PropertyIdentifier.PRIORITY, index: 3 },
			false,
			10,
		)
		const result = SubscribeProperty.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			cancellationRequest: false,
			covIncrement: 0,
			issueConfirmedNotifications: true,
			lifetime: 2,
			monitoredObjectId: {
				instance: 363,
				type: ObjectType.DEVICE,
			},
			monitoredProperty: {
				index: 3,
				id: PropertyIdentifier.PRIORITY,
			},
			subscriberProcessId: 8,
		})
	})
})
