import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baBvlc from '../../src/lib/bvlc'

test.describe('bacnet - BVLC layer', () => {
	test('should successfuly encode and decode a package', () => {
		const buffer = utils.getBuffer()
		baBvlc.encode(buffer.buffer, 10, 1482)
		const result = baBvlc.decode(buffer.buffer, 0)
		assert.deepStrictEqual(result, {
			len: 4,
			func: 10,
			msgLength: 1482,
		})
	})

	test('should successfuly encode and decode a forwarded package', () => {
		const buffer = utils.getBuffer()
		baBvlc.encode(buffer.buffer, 4, 1482)
		const result = baBvlc.decode(buffer.buffer, 0)
		assert.deepStrictEqual(result, {
			len: 10,
			func: 4,
			msgLength: 1482,
		})
	})

	test('should fail if invalid BVLC type', () => {
		const buffer = utils.getBuffer()
		baBvlc.encode(buffer.buffer, 10, 1482)
		buffer.buffer[0] = 8
		const result = baBvlc.decode(buffer.buffer, 0)
		assert.strictEqual(result, undefined)
	})

	test('should fail if invalid length', () => {
		const buffer = utils.getBuffer()
		baBvlc.encode(buffer.buffer, 10, 1481)
		buffer.buffer[0] = 8
		const result = baBvlc.decode(buffer.buffer, 0)
		assert.strictEqual(result, undefined)
	})

	test('should fail if invalid function', () => {
		const buffer = utils.getBuffer()
		baBvlc.encode(buffer.buffer, 100, 1482)
		const result = baBvlc.decode(buffer.buffer, 0)
		assert.strictEqual(result, undefined)
	})

	test('should fail if unsuported function', () => {
		const buffer = utils.getBuffer()
		baBvlc.encode(buffer.buffer, 5, 1482)
		const result = baBvlc.decode(buffer.buffer, 0)
		assert.strictEqual(result, undefined)
	})
})
