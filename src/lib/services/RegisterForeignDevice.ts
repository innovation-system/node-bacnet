import * as baAsn1 from '../asn1'
import { BacnetAckService } from './AbstractServices'

interface DecodeResult {
	len: number
	ttl: number
}

export default class RegisterForeignDevice extends BacnetAckService {
	public static encode(
		buffer: { buffer: Buffer; offset: number },
		ttl: number,
		length: number = 2,
	): void {
		baAsn1.encodeUnsigned(buffer, ttl, length)
	}

	public static decode(
		buffer: Buffer,
		offset: number,
		length: number = 2,
	): DecodeResult {
		let len = 0
		const result = baAsn1.decodeUnsigned(buffer, offset + len, length)
		len += result.len
		return {
			len,
			ttl: result.value,
		}
	}

	public static encodeAcknowledge(...args: any[]): void {
		throw new Error(
			'RegisterForeignDevice does not support acknowledge operations',
		)
	}
}
