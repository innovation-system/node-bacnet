import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'

test.describe('bacnet - acknowledgeAlarm integration', () => {
	test('should return a timeout error if no device is available', (t) => {
		return new Promise((resolve) => {
			const client = utils.createBacnetClient({ apduTimeout: 200 })
			client.acknowledgeAlarm(
				'127.0.0.2',
				{ type: 2, instance: 3 },
				2,
				'Alarm Acknowledge Test',
				{ value: new Date(), type: 2 },
				{ value: new Date(), type: 2 },
				{},
				(err) => {
					assert.strictEqual(err.message, 'ERR_TIMEOUT')
					client.close()
					resolve()
				},
			)
		})
	})
})
