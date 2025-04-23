import test from 'node:test'
import assert from 'node:assert'

import Client from '../../src/lib/client'
import * as baEnum from '../../src/lib/enum'

test.describe('bacnet - whoIs compliance', () => {
	let client
	let externalClient

	test.beforeEach(() => {
		client = new Client()
		externalClient = new Client()
	})

	test.afterEach(() => {
		client.close()
		externalClient.close()
	})

	test('should find the device simulator', async (t) => {
		client.on('iAm', (device) => {
			assert.strictEqual(device.deviceId, 1234)
			assert.strictEqual(device.maxApdu, 1482)
			assert.strictEqual(
				device.segmentation,
				baEnum.Segmentation.NO_SEGMENTATION,
			)
			assert.strictEqual(device.vendorId, 260)
		})

		externalClient.on('whoIs', () => {
			externalClient.iAmResponse(
				1234,
				baEnum.Segmentation.NO_SEGMENTATION,
				260,
			)
		})

		client.whoIs()
	})

	test('should find the device simulator with provided min device ID', async (t) => {
		client.on('iAm', (device) => {
			assert.strictEqual(device.deviceId, 1234)
		})

		externalClient.on('whoIs', () => {
			externalClient.iAmResponse(
				1234,
				baEnum.Segmentation.NO_SEGMENTATION,
				260,
			)
		})

		client.whoIs({ lowLimit: 1233 })
	})

	test('should find the device simulator with provided min/max device ID and IP', async (t) => {
		client.on('iAm', (device) => {
			assert.strictEqual(device.deviceId, 1234)
		})

		externalClient.on('whoIs', () => {
			externalClient.iAmResponse(
				1234,
				baEnum.Segmentation.NO_SEGMENTATION,
				260,
			)
		})

		client.whoIs({ lowLimit: 1233, highLimit: 1235 })
	})
})
