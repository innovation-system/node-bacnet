import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { AlarmSummary } from '../../src/lib/services'

test.describe('bacnet - Services layer AlarmSummary unit', () => {
	test('should successfully encode and decode', () => {
		const buffer = utils.getBuffer()
		AlarmSummary.encode(buffer, [
			{
				objectId: { type: 12, instance: 12 },
				alarmState: 12,
				acknowledgedTransitions: { value: [12], bitsUsed: 5 },
			},
			{
				objectId: { type: 13, instance: 13 },
				alarmState: 13,
				acknowledgedTransitions: { value: [13], bitsUsed: 6 },
			},
		])
		const result = AlarmSummary.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			alarms: [
				{
					objectId: { type: 12, instance: 12 },
					alarmState: 12,
					acknowledgedTransitions: { value: [12], bitsUsed: 5 },
				},
				{
					objectId: { type: 13, instance: 13 },
					alarmState: 13,
					acknowledgedTransitions: { value: [13], bitsUsed: 6 },
				},
			],
		})
	})
})
