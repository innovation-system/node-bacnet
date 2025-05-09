import * as baAsn1 from '../asn1'
import { BacnetService } from './AbstractServices'

interface DecodeResult {
	len: number
	ttl: number
}

export default class RegisterForeignDevice extends BacnetService {
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
}
