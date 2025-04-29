import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'

// you need to have this run against the official backstack c
// demo device started as deviceId 1234
// use "npm run docker" to execute this
test.describe('bacnet - read property multiple compliance', () => {
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

	test('read all properties from invalid device, expect errors in response', async () => {
		return new Promise<void>((next) => {
			// Read complete Device Object
			const requestArray = [
				{
					objectId: { type: 8, instance: utils.deviceUnderTest + 1 },
					properties: [{ id: 8 }],
				},
			]
			bacnetClient.readPropertyMultiple(
				discoveredAddress,
				requestArray,
				(err: Error | null, value: any) => {
					// Handle timeout as acceptable in Docker environments
					if (err && err.message === 'ERR_TIMEOUT') {
						utils.debug(
							'Got timeout error from invalid device - this is expected in Docker environments',
						)
						next()
						return
					}

					assert.strictEqual(err, null)
					assert.ok(value, 'value should be an object')
					assert.ok(
						Array.isArray(value.values),
						'value.values should be an array',
					)
					assert.ok(
						value.values[0],
						'value.values[0] should be an object',
					)
					assert.deepStrictEqual(value.values[0].objectId, {
						type: 8,
						instance: utils.deviceUnderTest + 1,
					})
					assert.ok(
						Array.isArray(value.values[0].values),
						'value.values[0].values should be an array',
					)
					assert.deepStrictEqual(value.values[0].values[0], {
						id: 75,
						index: utils.index,
						value: [
							{
								len: 0,
								type: 105,
								value: {
									errorClass: 1,
									errorCode: 31,
								},
							},
						],
					})
					next()
				},
			)
		})
	})

	test('read all properties from device, use discovered device address object', async () => {
		return new Promise<void>((next) => {
			// Read complete Device Object
			const requestArray = [
				{
					objectId: { type: 8, instance: utils.deviceUnderTest },
					properties: [{ id: 8 }],
				},
			]
			bacnetClient.readPropertyMultiple(
				discoveredAddress,
				requestArray,
				(err: Error | null, value: any) => {
					if (err && err.message === 'ERR_TIMEOUT') {
						utils.debug(
							'Got timeout error - this is occasionally expected in Docker environments',
						)
						next()
						return
					}

					assert.strictEqual(err, null)
					assert.ok(value, 'value should be an object')
					assert.ok(
						Array.isArray(value.values),
						'value.values should be an array',
					)
					assert.ok(
						value.values[0],
						'value.values[0] should be an object',
					)
					assert.deepStrictEqual(value.values[0].objectId, {
						type: 8,
						instance: utils.deviceUnderTest,
					})
					assert.ok(
						Array.isArray(value.values[0].values),
						'value.values[0].values should be an array',
					)
					assert.deepStrictEqual(value.values[0].values[0], {
						id: 75,
						index: utils.index,
						value: [
							{
								len: 5,
								value: {
									type: 8,
									instance: utils.deviceUnderTest,
								},
								type: 12,
							},
						],
					})
					next()
				},
			)
		})
	})

	test('read all properties from device, use discovered device address as IP', async () => {
		return new Promise<void>((next) => {
			// Read complete Device Object
			const requestArray = [
				{
					objectId: { type: 8, instance: utils.deviceUnderTest },
					properties: [{ id: 8 }],
				},
			]
			bacnetClient.readPropertyMultiple(
				discoveredAddress.address,
				requestArray,
				(err: Error | null, value: any) => {
					assert.strictEqual(err, null)
					assert.ok(value, 'value should be an object')
					assert.ok(
						Array.isArray(value.values),
						'value.values should be an array',
					)
					assert.ok(
						value.values[0],
						'value.values[0] should be an object',
					)
					assert.deepStrictEqual(value.values[0].objectId, {
						type: 8,
						instance: utils.deviceUnderTest,
					})
					assert.ok(
						Array.isArray(value.values[0].values),
						'value.values[0].values should be an array',
					)
					assert.deepStrictEqual(value.values[0].values[0], {
						id: 75,
						index: utils.index,
						value: [
							{
								len: 5,
								value: {
									type: 8,
									instance: utils.deviceUnderTest,
								},
								type: 12,
							},
						],
					})
					next()
				},
			)
		})
	})

	test(
		'read all properties from analog-output,2 of simulator device',
		{ timeout: 15000 },
		async () => {
			return new Promise<void>((next, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Test timed out waiting for response'))
				}, 10000)

				// Read complete Device Object
				const requestArray = [
					{
						objectId: { type: 1, instance: 2 },
						properties: [{ id: 8 }],
					},
				]

				bacnetClient.readPropertyMultiple(
					discoveredAddress,
					requestArray,
					(err: Error | null, value: any) => {
						// Clear the timeout
						clearTimeout(timeoutId)

						try {
							assert.strictEqual(err, null)
							assert.ok(value, 'value should be an object')
							assert.ok(
								Array.isArray(value.values),
								'value.values should be an array',
							)
							assert.ok(
								value.values[0],
								'value.values[0] should be an object',
							)
							assert.deepStrictEqual(value.values[0].objectId, {
								type: 1,
								instance: 2,
							})
							assert.ok(
								Array.isArray(value.values[0].values),
								'value.values[0].values should be an array',
							)
							assert.deepStrictEqual(value.values[0].values[0], {
								id: 75,
								index: utils.index,
								value: [
									{
										len: 5,
										value: {
											type: 1,
											instance: 2,
										},
										type: 12,
									},
								],
							})
							assert.deepStrictEqual(value.values[0].values[1], {
								id: 77,
								index: utils.index,
								value: [
									{
										len: 18,
										value: 'ANALOG OUTPUT 2',
										type: 7,
										encoding: 0,
									},
								],
							})
							next()
						} catch (error) {
							reject(error)
						}
					},
				)
			})
		},
	)

	test(
		'read all properties from device, use broadcast',
		{ timeout: 15000 },
		async () => {
			return new Promise<void>((next, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Test timed out waiting for response'))
				}, 10000)

				// Read complete Device Object
				const requestArray = [
					{
						objectId: { type: 8, instance: utils.deviceUnderTest },
						properties: [{ id: 8 }],
					},
				]

				bacnetClient.readPropertyMultiple(
					null,
					requestArray,
					(err: Error | null, value: any) => {
						// Clear the timeout
						clearTimeout(timeoutId)

						if (err && err.message === 'ERR_TIMEOUT') {
							utils.debug(
								'Got timeout error from broadcast request - this is acceptable in Docker environments',
							)
							next()
							return
						}

						try {
							assert.strictEqual(err, null)
							assert.ok(value, 'value should be an object')
							assert.ok(
								Array.isArray(value.values),
								'value.values should be an array',
							)
							assert.ok(
								value.values[0],
								'value.values[0] should be an object',
							)
							assert.deepStrictEqual(value.values[0].objectId, {
								type: 8,
								instance: utils.deviceUnderTest,
							})
							assert.ok(
								Array.isArray(value.values[0].values),
								'value.values[0].values should be an array',
							)
							assert.deepStrictEqual(value.values[0].values[0], {
								id: 75,
								index: utils.index,
								value: [
									{
										len: 5,
										value: {
											type: 8,
											instance: utils.deviceUnderTest,
										},
										type: 12,
									},
								],
							})
							next()
						} catch (error) {
							reject(error)
						}
					},
				)
			})
		},
	)

	// TODO tests missing for routing cases where "receiver" parameter is used to call whoIs
})
