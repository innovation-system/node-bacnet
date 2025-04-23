import test from 'node:test'
import assert from 'node:assert'

import * as baAsn1 from '../../src/lib/asn1'

test.describe('bacnet - ASN1 layer', () => {
	test.describe('decodeUnsigned', () => {
		test('should successfully decode 8-bit unsigned integer', () => {
			const result = baAsn1.decodeUnsigned(
				Buffer.from([0x00, 0xff, 0xff, 0xff, 0xff]),
				1,
				1,
			)
			assert.deepStrictEqual(result, { len: 1, value: 255 })
		})

		test('should successfully decode 16-bit unsigned integer', () => {
			const result = baAsn1.decodeUnsigned(
				Buffer.from([0x00, 0xff, 0xff, 0xff, 0xff]),
				1,
				2,
			)
			assert.deepStrictEqual(result, { len: 2, value: 65535 })
		})

		test('should successfully decode 24-bit unsigned integer', () => {
			const result = baAsn1.decodeUnsigned(
				Buffer.from([0x00, 0xff, 0xff, 0xff, 0xff]),
				1,
				3,
			)
			assert.deepStrictEqual(result, { len: 3, value: 16777215 })
		})

		test('should successfully decode 32-bit unsigned integer', () => {
			const result = baAsn1.decodeUnsigned(
				Buffer.from([0x00, 0xff, 0xff, 0xff, 0xff]),
				1,
				4,
			)
			assert.deepStrictEqual(result, { len: 4, value: 4294967295 })
		})

		test('should successfully decode length 0', () => {
			const result = baAsn1.decodeUnsigned(Buffer.from([]), 0, 0)
			assert.deepStrictEqual(result, { len: 0, value: 0 })
		})
	})

	test.describe('encodeBacnetObjectId', () => {
		test('should successfully encode with object-type > 512', () => {
			const buffer = { buffer: Buffer.alloc(4), offset: 0 }
			baAsn1.encodeBacnetObjectId(buffer, 600, 600)
			assert.deepStrictEqual(buffer, {
				buffer: Buffer.from([150, 0, 2, 88]),
				offset: 4,
			})
		})
	})

	test.describe('encodeOpeningTag', () => {
		test('should successfully encode with opening-tag > 14 = 15', () => {
			const buffer = { buffer: Buffer.alloc(15, 10), offset: 0 }
			baAsn1.encodeOpeningTag(buffer, 15)
			assert.deepStrictEqual(buffer, {
				buffer: Buffer.from([
					254, 15, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
				]),
				offset: 2,
			})
		})

		test('should successfully encode with opening-tag > 253 = 255', () => {
			const buffer = { buffer: Buffer.alloc(255, 12), offset: 0 }
			const testBuffer = Buffer.alloc(255, 12)
			const testBufferChange = Buffer.from([142, 12, 12, 12])
			testBuffer.fill(testBufferChange, 0, 4)
			const bufferToCompare = { buffer: testBuffer, offset: 1 }
			baAsn1.encodeOpeningTag(buffer, 8)
			assert.deepStrictEqual(buffer, bufferToCompare)
		})
	})

	test.describe('encodeClosingTag', () => {
		test('should successfully encode with closing-tag > 14 = 15', () => {
			const buffer = { buffer: Buffer.alloc(15, 10), offset: 0 }
			baAsn1.encodeClosingTag(buffer, 15)
			assert.deepStrictEqual(buffer, {
				buffer: Buffer.from([
					255, 15, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
				]),
				offset: 2,
			})
		})

		test('should successfully encode with closing-tag > 253 = 255', () => {
			const buffer = { buffer: Buffer.alloc(255, 12), offset: 0 }
			const testBuffer = Buffer.alloc(255, 12)
			const testBufferChange = Buffer.from([143, 12, 12, 12])
			testBuffer.fill(testBufferChange, 0, 4)
			const bufferToCompare = { buffer: testBuffer, offset: 1 }
			baAsn1.encodeClosingTag(buffer, 8)
			assert.deepStrictEqual(buffer, bufferToCompare)
		})
	})

	test.describe('encodeBacnetDate', () => {
		test('should successfully encode with Date 1-1-1', () => {
			const buffer = { buffer: Buffer.alloc(15, 10), offset: 0 }
			const testBuffer = Buffer.alloc(15, 10)
			const testBufferChange = Buffer.from([1, 1, 1, 5])
			testBuffer.fill(testBufferChange, 0, 4)
			const bufferToCompare = { buffer: testBuffer, offset: 4 }
			baAsn1.encodeBacnetDate(buffer, new Date(1, 1, 1))
			assert.deepStrictEqual(buffer, bufferToCompare)
		})

		test('should throw error with Date 257-1-1', () => {
			const buffer = { buffer: Buffer.alloc(15, 10), offset: 0 }
			const bufferToCompare = { buffer: Buffer.alloc(15, 10), offset: 0 }

			assert.throws(
				() => baAsn1.encodeBacnetDate(buffer, new Date(257, 1, 1)),
				/invalid year: 257/,
			)

			assert.deepStrictEqual(buffer, bufferToCompare)
		})

		test('should successfully encode with Date 2020-6-1', () => {
			const buffer = { buffer: Buffer.alloc(15, 10), offset: 0 }
			const testBuffer = Buffer.alloc(15, 10)
			const testBufferChange = Buffer.from([120, 6, 1, 3])
			testBuffer.fill(testBufferChange, 0, 4)
			const bufferToCompare = { buffer: testBuffer, offset: 4 }
			baAsn1.encodeBacnetDate(buffer, new Date(2020, 6, 1))
			assert.deepStrictEqual(buffer, bufferToCompare)
		})
	})
})
