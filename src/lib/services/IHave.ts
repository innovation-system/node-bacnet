import * as baAsn1 from '../asn1'
import { EncodeBuffer, BACNetObjectID } from '../types'
import { BacnetAckService } from './AbstractServices'

export default class IHave extends BacnetAckService {
	public static encode(
		buffer: EncodeBuffer,
		deviceId: BACNetObjectID,
		objectId: BACNetObjectID,
		objectName: string,
	) {
		baAsn1.encodeApplicationObjectId(
			buffer,
			deviceId.type,
			deviceId.instance,
		)
		baAsn1.encodeApplicationObjectId(
			buffer,
			objectId.type,
			objectId.instance,
		)
		baAsn1.encodeApplicationCharacterString(buffer, objectName)
	}

	public static decode(buffer: Buffer, offset: number, apduLen: number) {
		let len = 0
		let result: any
		let decodedValue: any
		const value: any = {}
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		decodedValue = baAsn1.decodeObjectId(buffer, offset + len)
		len += decodedValue.len
		value.deviceId = {
			type: decodedValue.objectType,
			instance: decodedValue.instance,
		}
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		decodedValue = baAsn1.decodeObjectId(buffer, offset + len)
		len += decodedValue.len
		value.objectId = {
			type: decodedValue.objectType,
			instance: decodedValue.instance,
		}
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		decodedValue = baAsn1.decodeCharacterString(
			buffer,
			offset + len,
			apduLen - (offset + len),
			result.value,
		)
		len += decodedValue.len
		value.objectName = decodedValue.value
		value.len = len
		return value
	}

	public static encodeAcknowledge(...args: any[]): void {
		throw new Error('IHave does not support acknowledge operations')
	}

	public static decodeAcknowledge(
		buffer: Buffer,
		offset: number,
		apduLen: number,
	): any {
		throw new Error('IHave does not support acknowledge operations')
	}
}
