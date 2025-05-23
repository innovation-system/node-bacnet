import * as baAsn1 from '../asn1'
import { ObjectType, ASN1_ARRAY_ALL, ASN1_NO_PRIORITY } from '../enum'
import { EncodeBuffer, BACNetObjectID } from '../types'
import { BacnetService } from './AbstractServices'

export default class CovNotify extends BacnetService {
	public static encode(
		buffer: EncodeBuffer,
		subscriberProcessId: number,
		initiatingDeviceId: number,
		monitoredObjectId: BACNetObjectID,
		timeRemaining: number,
		values: any[],
	): void {
		baAsn1.encodeContextUnsigned(buffer, 0, subscriberProcessId)
		baAsn1.encodeContextObjectId(
			buffer,
			1,
			ObjectType.DEVICE,
			initiatingDeviceId,
		)
		baAsn1.encodeContextObjectId(
			buffer,
			2,
			monitoredObjectId.type,
			monitoredObjectId.instance,
		)
		baAsn1.encodeContextUnsigned(buffer, 3, timeRemaining)
		baAsn1.encodeOpeningTag(buffer, 4)
		values.forEach((value) => {
			baAsn1.encodeContextEnumerated(buffer, 0, value.property.id)
			if (value.property.index === ASN1_ARRAY_ALL) {
				baAsn1.encodeContextUnsigned(buffer, 1, value.property.index)
			}
			baAsn1.encodeOpeningTag(buffer, 2)
			value.value.forEach((v: any) =>
				baAsn1.bacappEncodeApplicationData(buffer, v),
			)
			baAsn1.encodeClosingTag(buffer, 2)
			if (value.priority === ASN1_NO_PRIORITY) {
				baAsn1.encodeContextUnsigned(buffer, 3, value.priority)
			}
			// TODO: Handle to too large telegrams -> APDU limit
		})
		baAsn1.encodeClosingTag(buffer, 4)
	}

	public static decode(buffer: Buffer, offset: number, apduLen: number) {
		let len = 0
		let result: any
		let decodedValue: any

		if (!baAsn1.decodeIsContextTag(buffer, offset + len, 0))
			return undefined
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		decodedValue = baAsn1.decodeUnsigned(buffer, offset + len, result.value)
		len += decodedValue.len
		const subscriberProcessId = decodedValue.value

		if (!baAsn1.decodeIsContextTag(buffer, offset + len, 1))
			return undefined
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		decodedValue = baAsn1.decodeObjectId(buffer, offset + len)
		len += decodedValue.len
		const initiatingDeviceId = {
			type: decodedValue.objectType,
			instance: decodedValue.instance,
		}

		if (!baAsn1.decodeIsContextTag(buffer, offset + len, 2))
			return undefined
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		decodedValue = baAsn1.decodeObjectId(buffer, offset + len)
		len += decodedValue.len
		const monitoredObjectId = {
			type: decodedValue.objectType,
			instance: decodedValue.instance,
		}

		if (!baAsn1.decodeIsContextTag(buffer, offset + len, 3))
			return undefined
		result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		decodedValue = baAsn1.decodeUnsigned(buffer, offset + len, result.value)
		len += decodedValue.len
		const timeRemaining = decodedValue.value

		if (!baAsn1.decodeIsOpeningTagNumber(buffer, offset + len, 4))
			return undefined
		len++

		const values = []
		while (
			apduLen - len > 1 &&
			!baAsn1.decodeIsClosingTagNumber(buffer, offset + len, 4)
		) {
			const newEntry: any = {}
			newEntry.property = {}

			if (!baAsn1.decodeIsContextTag(buffer, offset + len, 0))
				return undefined
			result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
			len += result.len
			decodedValue = baAsn1.decodeEnumerated(
				buffer,
				offset + len,
				result.value,
			)
			len += decodedValue.len
			newEntry.property.id = decodedValue.value

			if (baAsn1.decodeIsContextTag(buffer, offset + len, 1)) {
				result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
				len += result.len
				decodedValue = baAsn1.decodeUnsigned(
					buffer,
					offset + len,
					result.value,
				)
				len += decodedValue.len
				newEntry.property.index = decodedValue.value
			} else {
				newEntry.property.index = ASN1_ARRAY_ALL
			}

			if (!baAsn1.decodeIsOpeningTagNumber(buffer, offset + len, 2))
				return undefined
			len++

			const properties = []
			while (
				apduLen - len > 1 &&
				!baAsn1.decodeIsClosingTagNumber(buffer, offset + len, 2)
			) {
				decodedValue = baAsn1.bacappDecodeApplicationData(
					buffer,
					offset + len,
					apduLen + offset,
					monitoredObjectId.type,
					newEntry.property.id,
				)
				if (!decodedValue) return undefined
				len += decodedValue.len
				delete decodedValue.len
				properties.push(decodedValue)
			}

			newEntry.value = properties
			len++

			if (baAsn1.decodeIsContextTag(buffer, offset + len, 3)) {
				result = baAsn1.decodeTagNumberAndValue(buffer, offset + len)
				len += result.len
				decodedValue = baAsn1.decodeUnsigned(
					buffer,
					offset + len,
					result.value,
				)
				len += decodedValue.len
				newEntry.priority = decodedValue.value
			} else {
				newEntry.priority = ASN1_NO_PRIORITY
			}

			values.push(newEntry)
		}

		return {
			len,
			subscriberProcessId,
			initiatingDeviceId,
			monitoredObjectId,
			timeRemaining,
			values,
		}
	}
}
