import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { EventInformation } from '../../src/lib/services'

test.describe('bacnet - Services layer EventInformation unit', () => {
	test('should successfully encode and decode', (t) => {
		const buffer = utils.getBuffer()
		const date1 = new Date()
		date1.setMilliseconds(990)
		const date2 = new Date()
		date2.setMilliseconds(990)
		const date3 = new Date()
		date3.setMilliseconds(990)
		EventInformation.encode(
			buffer,
			[
				{
					objectId: { type: 0, instance: 32 },
					eventState: 12,
					acknowledgedTransitions: { value: [14], bitsUsed: 6 },
					eventTimeStamps: [date1, date2, date3],
					notifyType: 5,
					eventEnable: { value: [15], bitsUsed: 7 },
					eventPriorities: [2, 3, 4],
				},
			],
			false,
		)
		const result = EventInformation.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			alarms: [
				{
					objectId: {
						type: 0,
						instance: 32,
					},
					eventState: 12,
					acknowledgedTransitions: {
						bitsUsed: 6,
						value: [14],
					},
					eventTimeStamps: [date1, date2, date3],
					notifyType: 5,
					eventEnable: {
						bitsUsed: 7,
						value: [15],
					},
					eventPriorities: [2, 3, 4],
				},
			],
			moreEvents: false,
		})
	})
})
