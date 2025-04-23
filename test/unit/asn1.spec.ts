import test from 'node:test'
import assert from 'node:assert'

import * as baAsn1 from '../../src/lib/asn1'

test.describe('bacnet - ASN1 layer', () => {
	test.describe('decodeUnsigned', () => {
		test('should fail if unsuport length', () => {
			assert.throws(
				() => baAsn1.decodeUnsigned(Buffer.from([0xff, 0xff]), 0, 5),
				/outside buffer bounds/,
			)
		})

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
})
