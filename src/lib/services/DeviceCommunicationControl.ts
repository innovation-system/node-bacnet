import * as baAsn1 from '../asn1'
import { EncodeBuffer } from '../types'
import { BacnetAckService } from './AbstractServices'

export default class DeviceCommunicationControl extends BacnetAckService {
	public static encode(
		buffer: EncodeBuffer,
		timeDuration: number,
		enableDisable: number,
		password: string,
	): void {
		if (timeDuration > 0) {
			baAsn1.encodeContextUnsigned(buffer, 0, timeDuration)
		}
		baAsn1.encodeContextEnumerated(buffer, 1, enableDisable)
		if (password && password !== '') {
			baAsn1.encodeContextCharacterString(buffer, 2, password)
		}
	}

	public static decode(buffer: Buffer, offset: number, apduLen: number) {
		let len = 0
		const value: any = {}
		let decodedValue: any
		let result: any

		if (baAsn1.decodeIsContextTag(buffer, offset + len, 0)) {
			result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
			len += result.len
			decodedValue = baAsn1.decodeUnsigned(
				buffer,
				offset + len,
				result.value,
			)
			value.timeDuration = decodedValue.value
			len += decodedValue.len
		}

		if (!baAsn1.decodeIsContextTag(buffer, offset + len, 1))
			return undefined
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		decodedValue = baAsn1.decodeEnumerated(
			buffer,
			offset + len,
			result.value,
		)
		value.enableDisable = decodedValue.value
		len += decodedValue.len

		if (len < apduLen) {
			if (!baAsn1.decodeIsContextTag(buffer, offset + len, 2))
				return undefined
			result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
			len += result.len
			decodedValue = baAsn1.decodeCharacterString(
				buffer,
				offset + len,
				apduLen - (offset + len),
				result.value,
			)
			value.password = decodedValue.value
			len += decodedValue.len
		}

		value.len = len
		return value
	}

	public static encodeAcknowledge(...args: any[]): void {
		throw new Error(
			'DeviceCommunicationControl does not support acknowledge operations',
		)
	}

	public static decodeAcknowledge(
		buffer: Buffer,
		offset: number,
		apduLen: number,
	): any {
		throw new Error(
			'DeviceCommunicationControl does not support acknowledge operations',
		)
	}
}
