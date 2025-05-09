import * as baAsn1 from '../asn1'
import { ASN1_MAX_INSTANCE } from '../enum'
import { EncodeBuffer } from '../types'
import { BacnetService } from './AbstractServices'

export default class WhoIs extends BacnetService {
	public static encode(
		buffer: EncodeBuffer,
		lowLimit: number,
		highLimit: number,
	) {
		if (
			lowLimit >= 0 &&
			lowLimit <= ASN1_MAX_INSTANCE &&
			highLimit >= 0 &&
			highLimit <= ASN1_MAX_INSTANCE
		) {
			baAsn1.encodeContextUnsigned(buffer, 0, lowLimit)
			baAsn1.encodeContextUnsigned(buffer, 1, highLimit)
		}
	}

	public static decode(buffer: Buffer, offset: number, apduLen: number) {
		let len = 0
		const value: any = {}
		if (apduLen <= 0) return {}
		let result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		if (result.tagNumber !== 0) return undefined
		if (apduLen <= len) return undefined
		let decodedValue = baAsn1.decodeUnsigned(
			buffer,
			offset + len,
			result.value,
		)
		len += decodedValue.len
		if (decodedValue.value <= ASN1_MAX_INSTANCE) {
			value.lowLimit = decodedValue.value
		}
		if (apduLen <= len) return undefined
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		if (result.tagNumber !== 1) return undefined
		if (apduLen <= len) return undefined
		decodedValue = baAsn1.decodeUnsigned(buffer, offset + len, result.value)
		len += decodedValue.len
		if (decodedValue.value <= ASN1_MAX_INSTANCE) {
			value.highLimit = decodedValue.value
		}
		value.len = len
		return value
	}
}
