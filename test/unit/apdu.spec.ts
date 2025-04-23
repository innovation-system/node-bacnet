import test from 'node:test'
import assert from 'node:assert'

import * as utils from './utils'
import * as baApdu from '../../src/lib/apdu'

test.describe('bacnet - APDU layer', () => {
	test.describe('decodedType', () => {
		test('should correctly encode and decode a package', () => {
			const value = Buffer.from([0, 128, 4, 5])
			baApdu.setDecodedType(value, 1, 48)
			const result = baApdu.getDecodedInvokeId(value, 1)
			assert.strictEqual(result, 4)
		})

		test('should correctly encode and decode a confirmed service package', () => {
			const value = Buffer.from([0, 128, 4, 5])
			baApdu.setDecodedType(value, 1, 0)
			const result = baApdu.getDecodedInvokeId(value, 1)
			assert.strictEqual(result, 5)
		})

		test('should fail if decode an invalid package', () => {
			const value = Buffer.from([0, 128, 4, 5])
			const result = baApdu.getDecodedInvokeId(value, 1)
			assert.strictEqual(result, undefined)
		})
	})

	test.describe('confirmedServiceRequest', () => {
		test('should correctly encode and decode a package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeConfirmedServiceRequest(
				buffer,
				0,
				41,
				176,
				12,
				44,
				45,
				46,
			)
			const result = baApdu.decodeConfirmedServiceRequest(
				buffer.buffer,
				0,
			)
			assert.deepStrictEqual(result, {
				len: 4,
				type: 0,
				service: 41,
				maxSegments: 176,
				maxApdu: 12,
				invokeId: 44,
				sequencenumber: 0,
				proposedWindowNumber: 0,
			})
		})

		test('should correctly encode and decode a segmented package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeConfirmedServiceRequest(
				buffer,
				8,
				47,
				208,
				14,
				50,
				51,
				52,
			)
			const result = baApdu.decodeConfirmedServiceRequest(
				buffer.buffer,
				0,
			)
			assert.deepStrictEqual(result, {
				len: 6,
				type: 8,
				service: 47,
				maxSegments: 208,
				maxApdu: 14,
				invokeId: 50,
				sequencenumber: 51,
				proposedWindowNumber: 52,
			})
		})
	})

	test.describe('unconfirmedServiceRequest', () => {
		test('should correctly encode and decode a package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeUnconfirmedServiceRequest(buffer, 33, 34)
			const result = baApdu.decodeUnconfirmedServiceRequest(
				buffer.buffer,
				0,
			)
			assert.deepStrictEqual(result, {
				len: 2,
				type: 33,
				service: 34,
			})
		})
	})

	test.describe('simpleAck', () => {
		test('should correctly encode and decode a package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeSimpleAck(buffer, 11, 12, 13)
			const result = baApdu.decodeSimpleAck(buffer.buffer, 0)
			assert.deepStrictEqual(result, {
				len: 3,
				type: 11,
				service: 12,
				invokeId: 13,
			})
		})
	})

	test.describe('complexAck', () => {
		test('should correctly encode and decode a package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeComplexAck(buffer, 0, 15, 16, 20, 21)
			const result = baApdu.decodeComplexAck(buffer.buffer, 0)
			assert.deepStrictEqual(result, {
				len: 3,
				type: 0,
				service: 15,
				invokeId: 16,
				sequencenumber: 0,
				proposedWindowNumber: 0,
			})
		})

		test('should correctly encode and decode a segmented package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeComplexAck(buffer, 8, 18, 19, 20, 21)
			const result = baApdu.decodeComplexAck(buffer.buffer, 0)
			assert.deepStrictEqual(result, {
				len: 5,
				type: 8,
				service: 18,
				invokeId: 19,
				sequencenumber: 20,
				proposedWindowNumber: 21,
			})
		})
	})

	test.describe('segmentAck', () => {
		test('should correctly encode and decode a package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeSegmentAck(buffer, 6, 7, 8, 9)
			const result = baApdu.decodeSegmentAck(buffer.buffer, 0)
			assert.deepStrictEqual(result, {
				len: 4,
				type: 6,
				originalInvokeId: 7,
				sequencenumber: 8,
				actualWindowSize: 9,
			})
		})
	})

	test.describe('error', () => {
		test('should correctly encode and decode a package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeError(buffer, 5, 6, 7)
			const result = baApdu.decodeError(buffer.buffer, 0)
			assert.deepStrictEqual(result, {
				len: 3,
				type: 5,
				service: 6,
				invokeId: 7,
			})
		})
	})

	test.describe('abort', () => {
		test('should correctly encode and decode a package', () => {
			const buffer = utils.getBuffer()
			baApdu.encodeAbort(buffer, 4, 5, 6)
			const result = baApdu.decodeAbort(buffer.buffer, 0)
			assert.deepStrictEqual(result, {
				len: 3,
				type: 4,
				invokeId: 5,
				reason: 6,
			})
		})
	})
})
