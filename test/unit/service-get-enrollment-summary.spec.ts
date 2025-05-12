import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { GetEnrollmentSummary } from '../../src/lib/services'

test.describe('bacnet - Services layer GetEnrollmentSummary unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		GetEnrollmentSummary.encode(buffer, 2)
		const result = GetEnrollmentSummary.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			acknowledgmentFilter: 2,
		})
	})

	test('should successfully encode and decode full payload', (t) => {
		const buffer = utils.getBuffer()
		GetEnrollmentSummary.encode(
			buffer,
			2,
			{ objectId: { type: 5, instance: 33 }, processId: 7 },
			1,
			3,
			{ min: 1, max: 65 },
			5,
		)
		const result = GetEnrollmentSummary.decode(buffer.buffer, 0)
		delete result.len
		assert.deepStrictEqual(result, {
			acknowledgmentFilter: 2,
			enrollmentFilter: {
				objectId: { type: 5, instance: 33 },
				processId: 7,
			},
			eventStateFilter: 1,
			eventTypeFilter: 3,
			priorityFilter: { min: 1, max: 65 },
			notificationClassFilter: 5,
		})
	})
})

test.describe('GetEnrollmentSummaryAcknowledge', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		GetEnrollmentSummary.encodeAcknowledge(buffer, [
			{
				objectId: { type: 12, instance: 120 },
				eventType: 3,
				eventState: 2,
				priority: 18,
				notificationClass: 11,
			},
		])
		const result = GetEnrollmentSummary.decodeAcknowledge(
			buffer.buffer,
			0,
			buffer.offset,
		)
		delete result.len
		assert.deepStrictEqual(result, {
			enrollmentSummaries: [
				{
					objectId: { type: 12, instance: 120 },
					eventType: 3,
					eventState: 2,
					priority: 18,
					notificationClass: 11,
				},
			],
		})
	})
})
