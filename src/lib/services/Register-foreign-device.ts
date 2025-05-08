import * as baAsn1 from '../asn1'

interface DecodeResult {
	len: number
	ttl: number
}

export const encode = (
	buffer: { buffer: Buffer; offset: number },
	ttl: number,
	length: number = 2,
): void => {
	baAsn1.encodeUnsigned(buffer, ttl, length)
}

export const decode = (
	buffer: Buffer,
	offset: number,
	length: number = 2,
): DecodeResult => {
	let len = 0
	const result = baAsn1.decodeUnsigned(buffer, offset + len, length)
	len += result.len
	return {
		len,
		ttl: result.value,
	}
}
