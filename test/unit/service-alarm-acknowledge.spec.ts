import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import { TimeStamp } from '../../src'
import { AlarmAcknowledge } from '../../src/lib/services'

test.describe('bacnet - Services layer AlarmAcknowledge unit', () => {
	test('should successfully encode and decode with time timestamp', () => {
		const buffer = utils.getBuffer()
		const eventTime = new Date(1, 1, 1)
		eventTime.setMilliseconds(990)
		const ackTime = new Date(1, 1, 1)
		ackTime.setMilliseconds(880)
		AlarmAcknowledge.encode(
			buffer,
			57,
			{ type: 0, instance: 33 },
			5,
			'Alarm Acknowledge Test',
			{ value: eventTime, type: TimeStamp.TIME },
			{ value: ackTime, type: TimeStamp.TIME },
		)
		const result = AlarmAcknowledge.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			acknowledgedProcessId: 57,
			eventObjectId: {
				type: 0,
				instance: 33,
			},
			eventStateAcknowledged: 5,
			acknowledgeSource: 'Alarm Acknowledge Test',
			eventTimeStamp: eventTime,
			acknowledgeTimeStamp: ackTime,
		})
	})

	test('should successfully encode and decode with sequence timestamp', () => {
		const buffer = utils.getBuffer()
		const eventTime = 5
		const ackTime = 6
		AlarmAcknowledge.encode(
			buffer,
			57,
			{ type: 0, instance: 33 },
			5,
			'Alarm Acknowledge Test',
			{ value: eventTime, type: TimeStamp.SEQUENCE_NUMBER },
			{ value: ackTime, type: TimeStamp.SEQUENCE_NUMBER },
		)
		const result = AlarmAcknowledge.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			acknowledgedProcessId: 57,
			eventObjectId: {
				type: 0,
				instance: 33,
			},
			eventStateAcknowledged: 5,
			acknowledgeSource: 'Alarm Acknowledge Test',
			eventTimeStamp: eventTime,
			acknowledgeTimeStamp: ackTime,
		})
	})

	test('should successfully encode and decode with datetime timestamp', () => {
		const buffer = utils.getBuffer()
		const eventTime = new Date(1, 1, 1)
		eventTime.setMilliseconds(990)
		const ackTime = new Date(1, 1, 2)
		ackTime.setMilliseconds(880)
		AlarmAcknowledge.encode(
			buffer,
			57,
			{ type: 0, instance: 33 },
			5,
			'Alarm Acknowledge Test',
			{ value: eventTime, type: TimeStamp.DATETIME },
			{ value: ackTime, type: TimeStamp.DATETIME },
		)
		const result = AlarmAcknowledge.decode(buffer.buffer, 0, buffer.offset)
		delete result.len
		assert.deepStrictEqual(result, {
			acknowledgedProcessId: 57,
			eventObjectId: {
				type: 0,
				instance: 33,
			},
			eventStateAcknowledged: 5,
			acknowledgeSource: 'Alarm Acknowledge Test',
			eventTimeStamp: eventTime,
			acknowledgeTimeStamp: ackTime,
		})
	})
})
