import * as baAsn1 from '../asn1'
import { ErrorClassName, ErrorCodeName } from '../enum'
import { EncodeBuffer } from '../types'
import { BacnetAckService } from './AbstractServices'

export default class Error extends BacnetAckService {
	public static encode(
		buffer: EncodeBuffer,
		errorClass: number,
		errorCode: number,
	): void {
		baAsn1.encodeApplicationEnumerated(buffer, errorClass)
		baAsn1.encodeApplicationEnumerated(buffer, errorCode)
	}

	public static decode(buffer: Buffer, offset: number) {
		const orgOffset = offset
		let result: any

		result = baAsn1.decodeTagNumberAndValue(buffer, offset)
		offset += result.len
		const errorClass = baAsn1.decodeEnumerated(buffer, offset, result.value)
		offset += errorClass.len

		result = baAsn1.decodeTagNumberAndValue(buffer, offset)
		offset += result.len
		const errorCode = baAsn1.decodeEnumerated(buffer, offset, result.value)
		offset += errorClass.len

		return {
			len: offset - orgOffset,
			class: errorClass.value,
			code: errorCode.value,
		}
	}

	public static buildMessage(result: {
		class: number
		code: number
	}): string {
		return (
			`BacnetError Class: ${ErrorClassName[result.class]} ` +
			`(${result.class}) ` +
			`Code: ${ErrorCodeName[result.code]} (${result.code})`
		)
	}

	public static encodeAcknowledge(...args: any[]): void {
		throw new Error()
	}

	public static decodeAcknowledge(
		buffer: Buffer,
		offset: number,
		apduLen: number,
	): any {
		throw new Error()
	}
}
