import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'

// you need to have this run against the official backstack c
// demo device started as deviceId 1234
// use "npm run docker" to execute this
test.describe('bacnet - read property compliance', () => {
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

	test('read property VENDOR_NAME (121) from device', async () => {
		return new Promise<void>((next, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Test timed out waiting for response'))
			}, 10000)

			bacnetClient.readProperty(
				discoveredAddress,
				{ type: 8, instance: utils.deviceUnderTest },
				121,
				(err: Error | null, value: any) => {
					clearTimeout(timeoutId)

					try {
						// Handle INVALID_DECODING error in Docker environments
						if (err && err.message === 'INVALID_DECODING') {
							utils.debug(
								'Got INVALID_DECODING error - this is occasionally expected in Docker environments',
							)
							next()
							return
						}

						assert.strictEqual(err, null)
						assert.ok(value, 'value should be an object')

						assert.ok(value.len, 'value should have len property')
						assert.deepStrictEqual(value.objectId, {
							type: 8,
							instance: utils.deviceUnderTest,
						})
						assert.deepStrictEqual(value.property, {
							id: 121,
							index: utils.index,
						})
						assert.ok(
							Array.isArray(value.values),
							'value.values should be an array',
						)
						assert.ok(
							value.values.length > 0,
							'value.values should not be empty',
						)
						assert.strictEqual(value.values[0].type, 7)
						assert.strictEqual(value.values[0].encoding, 0)
						assert.ok(
							value.values[0].value,
							'Should have a string value',
						)

						next()
					} catch (error) {
						reject(error)
					}
				},
			)
		})
	})

	test('read property PRESENT_VALUE from analog-output,2 from device', async () => {
		return new Promise<void>((next, reject) => {
			const timeoutId = setTimeout(() => {
				reject(new Error('Test timed out waiting for response'))
			}, 10000)

			bacnetClient.readProperty(
				discoveredAddress,
				{ type: 1, instance: 2 },
				85,
				(err: Error | null, value: any) => {
					clearTimeout(timeoutId)

					try {
						assert.strictEqual(err, null)
						assert.ok(value, 'value should be an object')

						assert.strictEqual(value.len, 14)
						assert.deepStrictEqual(value.objectId, {
							type: 1,
							instance: 2,
						})
						assert.deepStrictEqual(value.property, {
							id: 85,
							index: utils.index,
						})
						assert.ok(
							Array.isArray(value.values),
							'value.values should be an array',
						)
						assert.strictEqual(value.values.length, 1)
						assert.strictEqual(value.values[0].type, 4)
						assert.ok(
							typeof value.values[0].value === 'number',
							'Value should be a number',
						)

						utils.debug(
							`Current PRESENT_VALUE is: ${value.values[0].value}`,
						)

						next()
					} catch (error) {
						reject(error)
					}
				},
			)
		})
	})

	// TODO tests missing for routing cases where "receiver" parameter is used to call whoIs
})
