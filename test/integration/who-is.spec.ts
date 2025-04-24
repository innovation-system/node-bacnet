import test from 'node:test'

import * as utils from './utils'

test.describe('bacnet - whoIs integration', () => {
	test('should not invoke a event if no device is available', (t) => {
		return new Promise((resolve, reject) => {
			const client = new utils.BacnetClient({ apduTimeout: 200 })
			client.on('iAm', () => {
				client.close()
				reject(new Error('Unallowed Callback'))
			})
			setTimeout(() => {
				client.close()
				resolve()
			}, 300)
			client.whoIs()
		})
	})
})
