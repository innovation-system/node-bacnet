import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'

// you need to have this run against the official backstack c
// demo device started as deviceId 1234
// use "npm run docker" to execute this
test.describe('bacnet - subscribe property compliance', () => {
	let bacnetClient: any
	let discoveredAddress: any
	const onClose: ((callback: () => void) => void) | null = null

	test.before(async () => {
		return new Promise<void>((done) => {
			bacnetClient = new utils.bacnetClient({
				apduTimeout: utils.apduTimeout,
				interface: utils.clientListenerInterface,
			})
			bacnetClient.on('message', (msg: any, rinfo: any) => {
				utils.debug(msg)
				if (rinfo) utils.debug(rinfo)
			})
			bacnetClient.on('iAm', (device: any) => {
				discoveredAddress = device.header.sender
			})
			bacnetClient.on('error', (err: Error) => {
				console.error(err)
				bacnetClient.close()
			})
			bacnetClient.on('listening', () => {
				done()
			})
		})
	})

	test.after(async () => {
		return new Promise<void>((done) => {
			setTimeout(() => {
				bacnetClient.close()
				if (onClose) {
					onClose(done)
				} else {
					done()
				}
			}, 1000) // do not close too fast
		})
	})

	test('should find the device simulator device', async () => {
		return new Promise<void>((next) => {
			bacnetClient.on('iAm', (device: any) => {
				if (device.payload.deviceId === utils.deviceUnderTest) {
					discoveredAddress = device.header.sender
					assert.strictEqual(
						device.payload.deviceId,
						utils.deviceUnderTest,
					)
					assert.ok(
						discoveredAddress,
						'discoveredAddress should be an object',
					)
					assert.match(
						discoveredAddress.address,
						/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
					)
					next()
				}
			})
			bacnetClient.whoIs()
		})
	})

	// TODO tests missing for routing cases where "receiver" parameter is used to call whoIs
})
