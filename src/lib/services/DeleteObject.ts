import * as baAsn1 from '../asn1'
import { EncodeBuffer, BACNetObjectID } from '../types'
import { BacnetAckService } from './AbstractServices'

export default class DeleteObject extends BacnetAckService {
	public static encode(buffer: EncodeBuffer, objectId: BACNetObjectID): void {
		baAsn1.encodeApplicationObjectId(
			buffer,
			objectId.type,
			objectId.instance,
		)
	}

	public static decode(buffer: Buffer, offset: number, apduLen: number) {
		const result = baAsn1.decodeTagNumberAndValue(buffer, offset)
		if (result.tagNumber !== 12) return undefined

		let len = 1
		const value = baAsn1.decodeObjectId(buffer, offset + len)
		len += value.len

		if (len !== apduLen) return undefined
		value.len = len
		return value
	}

	public static encodeAcknowledge(...args: any[]): void {
		throw new Error('DeleteObject does not support acknowledge operations')
	}

	public static decodeAcknowledge(
		buffer: Buffer,
		offset: number,
		apduLen: number,
	): any {
		throw new Error('DeleteObject does not support acknowledge operations')
	}
}
