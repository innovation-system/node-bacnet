import test from 'node:test'
import assert from 'node:assert'

import * as services from '../../src/lib/services/index'

test.describe('bacnet - register foreign device integration', () => {
	// TODO: this is just documentation what it does for now - needs a review
	test('should encode', () => {
		const buffer = { buffer: Buffer.alloc(16, 12), offset: 0 }
		const testBuffer = { buffer: Buffer.alloc(16, 12), offset: 2 }
		const testBufferChange = Buffer.from([0, 0, 12, 12])
		testBuffer.buffer.fill(testBufferChange, 0, 4)
		services.registerForeignDevice.encode(buffer, 0)
		assert.deepStrictEqual(buffer, testBuffer)
	})

	test('should decode', () => {
		const buffer = Buffer.alloc(16, 23)
		const bufferCompare = Buffer.alloc(16, 23)
		services.registerForeignDevice.decode(buffer, 0)
		assert.deepStrictEqual(buffer, bufferCompare)
	})
})
