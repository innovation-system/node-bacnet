import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baNpdu from '../../src/lib/npdu'

test.describe('bacnet - NPDU layer', () => {
	test('should successfully decode the NPDU function', () => {
		const result = baNpdu.decodeFunction(Buffer.from([0, 1, 12]), 1)
		assert.strictEqual(result, 12)
	})

	test('should fail decoding the NPDU function if invalid version', () => {
		const result = baNpdu.decodeFunction(Buffer.from([0, 2, 12]), 1)
		assert.strictEqual(result, undefined)
	})

	test('should successfully encode and decode a basic NPDU package', () => {
		const buffer = utils.getBuffer()
		baNpdu.encode(buffer, 1)
		const result = baNpdu.decode(buffer.buffer, 0)
		assert.deepStrictEqual(result, {
			len: 2,
			funct: 1,
			destination: undefined,
			source: undefined,
			hopCount: 0,
			networkMsgType: 0,
			vendorId: 0,
		})
	})

	test('should successfully encode and decode a NPDU package with destination', () => {
		const buffer = utils.getBuffer()
		const destination = { net: 1000, adr: [1, 2, 3] }
		baNpdu.encode(buffer, 1, destination, undefined, 11, 5, 7)
		const result = baNpdu.decode(buffer.buffer, 0)
		assert.deepStrictEqual(result, {
			len: 9,
			funct: 33,
			destination: { type: 0, net: 1000, adr: [1, 2, 3] },
			source: undefined,
			hopCount: 11,
			networkMsgType: 0,
			vendorId: 0,
		})
	})

	test('should successfully encode and decode a NPDU package with destination and source', () => {
		const buffer = utils.getBuffer()
		const destination = { net: 1000, adr: [1, 2, 3] }
		const source = { net: 1000, adr: [1, 2, 3] }
		baNpdu.encode(buffer, 1, destination, source, 13, 10, 11)
		const result = baNpdu.decode(buffer.buffer, 0)
		assert.deepStrictEqual(result, {
			len: 15,
			funct: 41,
			destination: { type: 0, net: 1000, adr: [1, 2, 3] },
			source: { type: 0, net: 1000, adr: [1, 2, 3] },
			hopCount: 13,
			networkMsgType: 0,
			vendorId: 0,
		})
	})

	test('should successfully encode and decode a NPDU package with broadcast destination and source', () => {
		const buffer = utils.getBuffer()
		const destination = { net: 65535 }
		const source = { net: 1000 }
		baNpdu.encode(buffer, 1, destination, source, 12, 8, 9)
		const result = baNpdu.decode(buffer.buffer, 0)
		assert.deepStrictEqual(result, {
			len: 9,
			funct: 41,
			destination: { type: 0, net: 65535 },
			source: { type: 0, net: 1000 },
			hopCount: 12,
			networkMsgType: 0,
			vendorId: 0,
		})
	})

	test('should successfully encode and decode a network layer NPDU package', () => {
		const buffer = utils.getBuffer()
		baNpdu.encode(buffer, 128, undefined, undefined, 1, 128, 7777)
		const result = baNpdu.decode(buffer.buffer, 0)
		assert.deepStrictEqual(result, {
			len: 5,
			funct: 128,
			destination: undefined,
			source: undefined,
			hopCount: 0,
			networkMsgType: 128,
			vendorId: 7777,
		})
	})

	test('should successfully encode and decode a who is router to network layer NPDU package', () => {
		const buffer = utils.getBuffer()
		baNpdu.encode(buffer, 128, undefined, undefined, 1, 0, 7777)
		const result = baNpdu.decode(buffer.buffer, 0)
		assert.deepStrictEqual(result, {
			len: 5,
			funct: 128,
			destination: undefined,
			source: undefined,
			hopCount: 0,
			networkMsgType: 0,
			vendorId: 0,
		})
	})

	test('should fail if invalid BACNET version', () => {
		const buffer = utils.getBuffer()
		baNpdu.encode(buffer, 12, undefined, undefined, 1, 2, 3)
		buffer.buffer[0] = 2
		const result = baNpdu.decode(buffer.buffer, 0)
		assert.strictEqual(result, undefined)
	})
})
