import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'

// you need to have this run against the official backstack c
// demo device started as deviceId 1234
// use "npm run docker" to execute this
test.describe('bacnet - whoIs compliance', () => {
	let bacnetClient: any

	test.beforeEach(async () => {
		return new Promise<void>((done) => {
			bacnetClient = new utils.bacnetClient({
				apduTimeout: utils.apduTimeout,
				interface: utils.clientListenerInterface,
			})
			bacnetClient.on('message', (msg: any, rinfo: any) => {
				utils.debug(msg)
				if (rinfo) utils.debug(rinfo)
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

	test.afterEach(async () => {
		return new Promise<void>((done) => {
			setTimeout(() => {
				bacnetClient.close()
				done()
			}, 1000) // do not close too fast
		})
	})

	test('should find the device simulator', async () => {
		return new Promise<void>((next, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Test timed out waiting for device'))
			}, 10000)

			bacnetClient.on('iAm', (device: any) => {
				if (device.payload.deviceId === utils.deviceUnderTest) {
					clearTimeout(timeoutId)
					try {
						assert.ok(device.header, 'device.header should exist')
						assert.ok(device.payload, 'device.payload should exist')
						assert.strictEqual(
							device.payload.deviceId,
							utils.deviceUnderTest,
						)
						assert.strictEqual(
							device.payload.maxApdu,
							utils.maxApdu,
						)
						assert.strictEqual(device.payload.segmentation, 3) // NO_SEGMENTATION
						assert.strictEqual(
							device.payload.vendorId,
							utils.vendorId,
						)
						assert.ok(
							device.header.sender,
							'device.header.sender should exist',
						)
						assert.ok(
							device.header.sender.address,
							'device.header.sender.address should exist',
						)
						assert.strictEqual(
							device.header.sender.forwardedFrom,
							null,
						)
						next()
					} catch (error) {
						reject(error)
					}
				}
			})
			bacnetClient.whoIs()
		})
	})

	test('should find the device simulator with provided min device ID', async () => {
		return new Promise<void>((next, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Test timed out waiting for device'))
			}, 10000)

			bacnetClient.on('iAm', (device: any) => {
				if (device.payload.deviceId === utils.deviceUnderTest) {
					clearTimeout(timeoutId)
					try {
						assert.strictEqual(
							device.payload.deviceId,
							utils.deviceUnderTest,
						)
						next()
					} catch (error) {
						reject(error)
					}
				}
			})
			bacnetClient.whoIs({ lowLimit: utils.deviceUnderTest - 1 })
		})
	})

	test('should find the device simulator with provided min/max device ID and IP', async () => {
		return new Promise<void>((next, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Test timed out waiting for device'))
			}, 10000)

			bacnetClient.on('iAm', (device: any) => {
				if (device.payload.deviceId === utils.deviceUnderTest) {
					clearTimeout(timeoutId)
					try {
						assert.strictEqual(
							device.payload.deviceId,
							utils.deviceUnderTest,
						)
						next()
					} catch (error) {
						reject(error)
					}
				}
			})
			bacnetClient.whoIs({
				lowLimit: utils.deviceUnderTest - 1,
				highLimit: utils.deviceUnderTest + 1,
			})
		})
	})

	test('should NOT find any device', async () => {
		return new Promise<void>((next) => {
			let notFoundTimeout: NodeJS.Timeout | null = null

			const iAmHandler = (device: any) => {
				assert.fail('No discovery result to be expected')
				if (notFoundTimeout) {
					clearTimeout(notFoundTimeout)
					notFoundTimeout = null
				}
				next()
			}

			bacnetClient.on('iAm', iAmHandler)

			bacnetClient.whoIs({
				lowLimit: utils.deviceUnderTest + 1,
				highLimit: utils.deviceUnderTest + 3,
			})

			// ok when no result came in 4s
			notFoundTimeout = setTimeout(() => {
				bacnetClient.removeListener('iAm', iAmHandler)
				notFoundTimeout = null
				next()
			}, 4000)
		})
	})

	// TODO tests missing for routing cases where "receiver" parameter is used to call whoIs
})
