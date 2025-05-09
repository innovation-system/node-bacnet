import * as baAsn1 from '../asn1'
import { ApplicationTag } from '../enum'
import { EncodeBuffer } from '../types'
import { BacnetAckService } from './AbstractServices'

export default class TimeSync extends BacnetAckService {
	public static encode(buffer: EncodeBuffer, time: Date) {
		baAsn1.encodeApplicationDate(buffer, time)
		baAsn1.encodeApplicationTime(buffer, time)
	}

	public static decode(buffer: Buffer, offset: number) {
		let len = 0
		let result: any
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		if (result.tagNumber !== ApplicationTag.DATE) return undefined
		const date = baAsn1.decodeDate(buffer, offset + len)
		len += date.len
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		if (result.tagNumber !== ApplicationTag.TIME) return undefined
		const time = baAsn1.decodeBacnetTime(buffer, offset + len)
		len += time.len
		return {
			len,
			value: new Date(
				date.value.getFullYear(),
				date.value.getMonth(),
				date.value.getDate(),
				time.value.getHours(),
				time.value.getMinutes(),
				time.value.getSeconds(),
				time.value.getMilliseconds(),
			),
		}
	}

	public static encodeAcknowledge(...args: any[]): void {
		throw new Error('TimeSync does not support acknowledge operations')
	}

	public static decodeAcknowledge(
		buffer: Buffer,
		offset: number,
		apduLen: number,
	): any {
		throw new Error('TimeSync does not support acknowledge operations')
	}
}
