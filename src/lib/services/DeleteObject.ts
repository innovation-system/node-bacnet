import * as baAsn1 from '../asn1'
import { EncodeBuffer, BACNetObjectID } from '../types'
import { BacnetService } from './AbstractServices'

export default class DeleteObject extends BacnetService {
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
}
