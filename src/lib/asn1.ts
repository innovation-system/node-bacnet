import * as iconv from 'iconv-lite'

import {
	EncodeBuffer,
	BACNetCovSubscription,
	BACNetReadAccessSpecification,
	BACNetBitString,
	BACNetAppData,
	BACNetPropertyState,
	BACNetDevObjRef,
	BACNetObjectID,
	BACNetPropertyID,
	BACNetTimestamp,
	Decode,
	Tag,
	ObjectId,
	ApplicationData,
	BACNetReadAccess,
	ReadAccessDecode,
	CharacterString,
	CalendarDate,
	CalendarDateRange,
	CalendarWeekDay,
	Calendar,
	DeviceObjPropertyRef,
	ReadAccessSpec,
	CovSubscription,
	ContextTagWithLength,
	ContextCharacterString,
	ReadAccessProperty,
	ReadAccessError,
} from './types'
import {
	CharacterStringEncoding,
	ASN1_MAX_OBJECT,
	ASN1_INSTANCE_BITS,
	ASN1_MAX_INSTANCE,
	ApplicationTag,
	ASN1_MAX_BITSTRING_BYTES,
	ASN1_ARRAY_ALL,
	ObjectType,
	PropertyStates,
	PropertyIdentifier,
	ASN1_MAX_OBJECT_TYPE,
	ASN1_MAX_PROPERTY_ID,
	ASN1_MAX_APPLICATION_TAG,
	TimeStamp,
} from './enum'

export const START_YEAR = 1900
export const MAX_YEARS = 256
export const ZERO_DATE = new Date(START_YEAR, 0, 1)

const getBuffer = (): EncodeBuffer => ({
	buffer: Buffer.alloc(1472),
	offset: 0,
})

const getSignedLength = (value: number): number => {
	if (value >= -128 && value < 128) return 1
	if (value >= -32768 && value < 32768) return 2
	if (value > -8388608 && value < 8388608) return 3
	return 4
}

const getUnsignedLength = (value: number): number => {
	if (value < 0x100) return 1
	if (value < 0x10000) return 2
	if (value < 0x1000000) return 3
	return 4
}

const getEncodingType = (
	encoding: number,
	decodingBuffer?: Buffer,
	decodingOffset?: number,
): string => {
	switch (encoding) {
		case CharacterStringEncoding.UCS_2:
			if (
				decodingBuffer &&
				decodingBuffer[decodingOffset] === 0xff &&
				decodingBuffer[decodingOffset + 1] === 0xfe
			) {
				return 'ucs2'
			}
			return 'UTF-16BE' // Default to big-endian
		case CharacterStringEncoding.ISO_8859_1:
			return 'latin1'
		case CharacterStringEncoding.MICROSOFT_DBCS:
			return 'cp850'
		case CharacterStringEncoding.JIS_X_0208:
			return 'Shift_JIS'
		default:
			return 'utf8'
	}
}

export const encodeUnsigned = (
	buffer: EncodeBuffer,
	value: number,
	length: number,
): void => {
	buffer.buffer.writeUIntBE(value, buffer.offset, length)
	buffer.offset += length
}

const encodeBacnetUnsigned = (buffer: EncodeBuffer, value: number): void => {
	encodeUnsigned(buffer, value, getUnsignedLength(value))
}

const encodeSigned = (
	buffer: EncodeBuffer,
	value: number,
	length: number,
): void => {
	buffer.buffer.writeIntBE(value, buffer.offset, length)
	buffer.offset += length
}

const encodeBacnetSigned = (buffer: EncodeBuffer, value: number): void => {
	encodeSigned(buffer, value, getSignedLength(value))
}

const encodeBacnetReal = (buffer: EncodeBuffer, value: number): void => {
	buffer.buffer.writeFloatBE(value, buffer.offset)
	buffer.offset += 4
}

const encodeBacnetDouble = (buffer: EncodeBuffer, value: number): void => {
	buffer.buffer.writeDoubleBE(value, buffer.offset)
	buffer.offset += 8
}

export const decodeUnsigned = (
	buffer: Buffer,
	offset: number,
	length: number,
): Decode<number> => {
	if (length === 0) {
		return {
			len: 0,
			value: 0,
		}
	}
	return {
		len: length,
		value: buffer.readUIntBE(offset, length),
	}
}

export const decodeEnumerated = (
	buffer: Buffer,
	offset: number,
	lenValue: number,
): Decode<number> => {
	return decodeUnsigned(buffer, offset, lenValue)
}

export const encodeBacnetObjectId = (
	buffer: EncodeBuffer,
	objectType: number,
	instance: number,
): void => {
	const value =
		(((objectType & ASN1_MAX_OBJECT) << ASN1_INSTANCE_BITS) |
			(instance & ASN1_MAX_INSTANCE)) >>>
		0
	encodeUnsigned(buffer, value, 4)
}

export const encodeTag = (
	buffer: EncodeBuffer,
	tagNumber: number,
	contextSpecific: boolean,
	lenValueType: number,
): void => {
	let len = 1
	const tmp = new Array(3)
	tmp[0] = 0
	if (contextSpecific) {
		tmp[0] |= 0x8
	}
	if (tagNumber <= 14) {
		tmp[0] |= tagNumber << 4
	} else {
		tmp[0] |= 0xf0
		tmp[1] = tagNumber
		len++
	}
	if (lenValueType <= 4) {
		tmp[0] |= lenValueType
		const tmpBuffer = Buffer.from(tmp)
		tmpBuffer.copy(buffer.buffer as Buffer, buffer.offset, 0, len)
		buffer.offset += len
	} else {
		tmp[0] |= 5
		if (lenValueType <= 253) {
			tmp[len++] = lenValueType
			const tmpBuffer = Buffer.from(tmp)
			tmpBuffer.copy(buffer.buffer as Buffer, buffer.offset, 0, len)
			buffer.offset += len
		} else if (lenValueType <= 65535) {
			tmp[len++] = 254
			const tmpBuffer = Buffer.from(tmp)
			tmpBuffer.copy(buffer.buffer as Buffer, buffer.offset, 0, len)
			buffer.offset += len
			encodeUnsigned(buffer, lenValueType, 2)
		} else {
			tmp[len++] = 255
			const tmpBuffer = Buffer.from(tmp)
			tmpBuffer.copy(buffer.buffer as Buffer, buffer.offset, 0, len)
			buffer.offset += len
			encodeUnsigned(buffer, lenValueType, 4)
		}
	}
}

const encodeBacnetEnumerated = (buffer: EncodeBuffer, value: number): void => {
	encodeBacnetUnsigned(buffer, value)
}

const isExtendedTagNumber = (x: number): boolean => {
	return (x & 0xf0) === 0xf0
}

const isExtendedValue = (x: number): boolean => {
	return (x & 0x07) === 5
}

const isContextSpecific = (x: number): boolean => {
	return (x & 0x8) === 0x8
}

const isOpeningTag = (x: number): boolean => {
	return (x & 0x07) === 6
}

const isClosingTag = (x: number): boolean => {
	return (x & 0x07) === 7
}

export const encodeContextReal = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: number,
): void => {
	encodeTag(buffer, tagNumber, true, 4)
	encodeBacnetReal(buffer, value)
}

export const encodeContextUnsigned = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: number,
): void => {
	encodeTag(buffer, tagNumber, true, getUnsignedLength(value))
	encodeBacnetUnsigned(buffer, value)
}

export const encodeContextEnumerated = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: number,
): void => {
	encodeContextUnsigned(buffer, tagNumber, value)
}

const encodeOctetString = (
	buffer: EncodeBuffer,
	octetString: number[],
	octetOffset: number,
	octetCount: number,
): void => {
	if (octetString) {
		for (let i = octetOffset; i < octetOffset + octetCount; i++) {
			buffer.buffer[buffer.offset++] = octetString[i]
		}
	}
}

export const encodeApplicationOctetString = (
	buffer: EncodeBuffer,
	octetString: number[],
	octetOffset: number,
	octetCount: number,
): void => {
	encodeTag(buffer, ApplicationTag.OCTET_STRING, false, octetCount)
	encodeOctetString(buffer, octetString, octetOffset, octetCount)
}

const encodeApplicationNull = (buffer: EncodeBuffer): void => {
	buffer.buffer[buffer.offset++] = ApplicationTag.NULL
}

export const encodeApplicationBoolean = (
	buffer: EncodeBuffer,
	booleanValue: boolean,
): void => {
	encodeTag(buffer, ApplicationTag.BOOLEAN, false, booleanValue ? 1 : 0)
}

const encodeApplicationReal = (buffer: EncodeBuffer, value: number): void => {
	encodeTag(buffer, ApplicationTag.REAL, false, 4)
	encodeBacnetReal(buffer, value)
}

const encodeApplicationDouble = (buffer: EncodeBuffer, value: number): void => {
	encodeTag(buffer, ApplicationTag.DOUBLE, false, 8)
	encodeBacnetDouble(buffer, value)
}

const bitstringBytesUsed = (bitString: BACNetBitString): number => {
	let len = 0
	if (bitString.bitsUsed > 0) {
		const lastBit = bitString.bitsUsed - 1
		const usedBytes = lastBit / 8 + 1
		len = Math.floor(usedBytes)
	}
	return len
}

export const encodeApplicationObjectId = (
	buffer: EncodeBuffer,
	objectType: number,
	instance: number,
): void => {
	const tmp = getBuffer()
	encodeBacnetObjectId(tmp, objectType, instance)
	encodeTag(buffer, ApplicationTag.OBJECTIDENTIFIER, false, tmp.offset)
	tmp.buffer.copy(buffer.buffer, buffer.offset, 0, tmp.offset)
	buffer.offset += tmp.offset
}

export const encodeApplicationUnsigned = (
	buffer: EncodeBuffer,
	value: number,
): void => {
	const tmp = getBuffer()
	encodeBacnetUnsigned(tmp, value)
	encodeTag(buffer, ApplicationTag.UNSIGNED_INTEGER, false, tmp.offset)
	tmp.buffer.copy(buffer.buffer, buffer.offset, 0, tmp.offset)
	buffer.offset += tmp.offset
}

export const encodeApplicationEnumerated = (
	buffer: EncodeBuffer,
	value: number,
): void => {
	const tmp = getBuffer()
	encodeBacnetEnumerated(tmp, value)
	encodeTag(buffer, ApplicationTag.ENUMERATED, false, tmp.offset)
	tmp.buffer.copy(buffer.buffer, buffer.offset, 0, tmp.offset)
	buffer.offset += tmp.offset
}

export const encodeApplicationSigned = (
	buffer: EncodeBuffer,
	value: number,
): void => {
	const tmp = getBuffer()
	encodeBacnetSigned(tmp, value)
	encodeTag(buffer, ApplicationTag.SIGNED_INTEGER, false, tmp.offset)
	tmp.buffer.copy(buffer.buffer, buffer.offset, 0, tmp.offset)
	buffer.offset += tmp.offset
}

const byteReverseBits = (inByte: number): number => {
	let outByte = 0
	if ((inByte & 1) > 0) {
		outByte |= 0x80
	}
	if ((inByte & 2) > 0) {
		outByte |= 0x40
	}
	if ((inByte & 4) > 0) {
		outByte |= 0x20
	}
	if ((inByte & 8) > 0) {
		outByte |= 0x10
	}
	if ((inByte & 16) > 0) {
		outByte |= 0x8
	}
	if ((inByte & 32) > 0) {
		outByte |= 0x4
	}
	if ((inByte & 64) > 0) {
		outByte |= 0x2
	}
	if ((inByte & 128) > 0) {
		outByte |= 1
	}
	return outByte
}

const bitstringOctet = (
	bitString: BACNetBitString,
	octetIndex: number,
): number => {
	let octet = 0
	if (bitString.value && octetIndex < ASN1_MAX_BITSTRING_BYTES) {
		octet = bitString.value[octetIndex]
	}
	return octet
}

const encodeBitstring = (
	buffer: EncodeBuffer,
	bitString: BACNetBitString,
): void => {
	if (bitString.bitsUsed === 0) {
		buffer.buffer[buffer.offset++] = 0
	} else {
		const usedBytes = bitstringBytesUsed(bitString)
		const remainingUsedBits = bitString.bitsUsed - (usedBytes - 1) * 8
		buffer.buffer[buffer.offset++] = 8 - remainingUsedBits
		for (let i = 0; i < usedBytes; i++) {
			buffer.buffer[buffer.offset++] = byteReverseBits(
				bitstringOctet(bitString, i),
			)
		}
	}
}

export const encodeApplicationBitstring = (
	buffer: EncodeBuffer,
	bitString: BACNetBitString,
): void => {
	let bitStringEncodedLength = 1
	bitStringEncodedLength += bitstringBytesUsed(bitString)
	encodeTag(buffer, ApplicationTag.BIT_STRING, false, bitStringEncodedLength)
	encodeBitstring(buffer, bitString)
}

export const encodeBacnetDate = (buffer: EncodeBuffer, value: Date): void => {
	if (value === ZERO_DATE) {
		buffer.buffer[buffer.offset++] = 0xff
		buffer.buffer[buffer.offset++] = 0xff
		buffer.buffer[buffer.offset++] = 0xff
		buffer.buffer[buffer.offset++] = 0xff
		return
	}

	if (value.getFullYear() >= START_YEAR) {
		buffer.buffer[buffer.offset++] = value.getFullYear() - START_YEAR
	} else if (value.getFullYear() < MAX_YEARS /* 1900 + 255 max */) {
		buffer.buffer[buffer.offset++] = value.getFullYear()
	} else {
		throw new Error(`invalid year: ${value.getFullYear()}`)
	}
	buffer.buffer[buffer.offset++] = value.getMonth() + 1
	buffer.buffer[buffer.offset++] = value.getDate()
	buffer.buffer[buffer.offset++] = value.getDay() === 0 ? 7 : value.getDay()
}

export const encodeApplicationDate = (
	buffer: EncodeBuffer,
	value: Date,
): void => {
	encodeTag(buffer, ApplicationTag.DATE, false, 4)
	encodeBacnetDate(buffer, value)
}

const encodeBacnetTime = (buffer: EncodeBuffer, value: Date): void => {
	buffer.buffer[buffer.offset++] = value.getHours()
	buffer.buffer[buffer.offset++] = value.getMinutes()
	buffer.buffer[buffer.offset++] = value.getSeconds()
	buffer.buffer[buffer.offset++] = value.getMilliseconds() / 10
}

export const encodeApplicationTime = (
	buffer: EncodeBuffer,
	value: Date,
): void => {
	encodeTag(buffer, ApplicationTag.TIME, false, 4)
	encodeBacnetTime(buffer, value)
}

const bacappEncodeDatetime = (buffer: EncodeBuffer, value: Date): void => {
	if (value !== ZERO_DATE) {
		encodeApplicationDate(buffer, value)
		encodeApplicationTime(buffer, value)
	}
}

export const encodeContextObjectId = (
	buffer: EncodeBuffer,
	tagNumber: number,
	objectType: number,
	instance: number,
): void => {
	encodeTag(buffer, tagNumber, true, 4)
	encodeBacnetObjectId(buffer, objectType, instance)
}

export const encodeOpeningTag = (
	buffer: EncodeBuffer,
	tagNumber: number,
): void => {
	let len = 1
	const tmp = new Array(2)
	tmp[0] = 0x8
	if (tagNumber <= 14) {
		tmp[0] |= tagNumber << 4
	} else {
		tmp[0] |= 0xf0
		tmp[1] = tagNumber
		len++
	}
	tmp[0] |= 6
	Buffer.from(tmp).copy(buffer.buffer, buffer.offset, 0, len)
	buffer.offset += len
}

export const encodeClosingTag = (
	buffer: EncodeBuffer,
	tagNumber: number,
): void => {
	let len = 1
	const tmp = new Array(2)
	tmp[0] = 0x8
	if (tagNumber <= 14) {
		tmp[0] |= tagNumber << 4
	} else {
		tmp[0] |= 0xf0
		tmp[1] = tagNumber
		len++
	}
	tmp[0] |= 7
	Buffer.from(tmp).copy(buffer.buffer, buffer.offset, 0, len)
	buffer.offset += len
}

export const encodeReadAccessSpecification = (
	buffer: EncodeBuffer,
	value: BACNetReadAccessSpecification,
): void => {
	encodeContextObjectId(
		buffer,
		0,
		value.objectId.type,
		value.objectId.instance,
	)
	encodeOpeningTag(buffer, 1)
	value.properties.forEach((p) => {
		encodeContextEnumerated(buffer, 0, p.id)
		if (p.index && p.index !== ASN1_ARRAY_ALL) {
			encodeContextUnsigned(buffer, 1, p.index)
		}
	})
	encodeClosingTag(buffer, 1)
}

export const encodeContextBoolean = (
	buffer: EncodeBuffer,
	tagNumber: number,
	booleanValue: boolean,
): void => {
	encodeTag(buffer, tagNumber, true, 1)
	buffer.buffer.writeUInt8(booleanValue ? 1 : 0, buffer.offset)
	buffer.offset += 1
}

const encodeCovSubscription = (
	buffer: EncodeBuffer,
	value: BACNetCovSubscription,
): void => {
	encodeOpeningTag(buffer, 0)
	encodeOpeningTag(buffer, 0)
	encodeOpeningTag(buffer, 1)
	encodeApplicationUnsigned(buffer, value.recipient.network)
	if (value.recipient.network === 0xffff) {
		encodeApplicationOctetString(buffer, [0], 0, 0)
	} else {
		encodeApplicationOctetString(
			buffer,
			value.recipient.address,
			0,
			value.recipient.address.length,
		)
	}
	encodeClosingTag(buffer, 1)
	encodeClosingTag(buffer, 0)
	encodeContextUnsigned(buffer, 1, value.subscriptionProcessId)
	encodeClosingTag(buffer, 0)
	encodeOpeningTag(buffer, 1)
	encodeContextObjectId(
		buffer,
		0,
		value.monitoredObjectId.type,
		value.monitoredObjectId.instance,
	)
	encodeContextEnumerated(buffer, 1, value.monitoredProperty.id)
	if (value.monitoredProperty.index !== ASN1_ARRAY_ALL) {
		encodeContextUnsigned(buffer, 2, value.monitoredProperty.index)
	}
	encodeClosingTag(buffer, 1)
	encodeContextBoolean(buffer, 2, value.issueConfirmedNotifications)
	encodeContextUnsigned(buffer, 3, value.timeRemaining)
	if (value.covIncrement > 0) {
		encodeContextReal(buffer, 4, value.covIncrement)
	}
}

export const bacappEncodeApplicationData = (
	buffer: EncodeBuffer,
	value: BACNetAppData,
): void => {
	if (value.value === null) {
		value.type = ApplicationTag.NULL
	}
	switch (value.type) {
		case ApplicationTag.NULL:
			encodeApplicationNull(buffer)
			break
		case ApplicationTag.BOOLEAN:
			encodeApplicationBoolean(buffer, value.value as boolean)
			break
		case ApplicationTag.UNSIGNED_INTEGER:
			encodeApplicationUnsigned(buffer, value.value as number)
			break
		case ApplicationTag.SIGNED_INTEGER:
			encodeApplicationSigned(buffer, value.value as number)
			break
		case ApplicationTag.REAL:
			encodeApplicationReal(buffer, value.value as number)
			break
		case ApplicationTag.DOUBLE:
			encodeApplicationDouble(buffer, value.value as number)
			break
		case ApplicationTag.OCTET_STRING:
			encodeApplicationOctetString(
				buffer,
				value.value as number[],
				0,
				(value.value as number[]).length,
			)
			break
		case ApplicationTag.CHARACTER_STRING:
			encodeApplicationCharacterString(
				buffer,
				value.value as string,
				value.encoding,
			)
			break
		case ApplicationTag.BIT_STRING:
			encodeApplicationBitstring(buffer, value.value as BACNetBitString)
			break
		case ApplicationTag.ENUMERATED:
			encodeApplicationEnumerated(buffer, value.value as number)
			break
		case ApplicationTag.DATE:
			encodeApplicationDate(buffer, value.value as Date)
			break
		case ApplicationTag.TIME:
			encodeApplicationTime(buffer, value.value as Date)
			break
		case ApplicationTag.TIMESTAMP:
			bacappEncodeTimestamp(buffer, value.value as BACNetTimestamp)
			break
		case ApplicationTag.DATETIME:
			bacappEncodeDatetime(buffer, value.value as Date)
			break
		case ApplicationTag.OBJECTIDENTIFIER:
			encodeApplicationObjectId(
				buffer,
				(value.value as BACNetObjectID).type,
				(value.value as BACNetObjectID).instance,
			)
			break
		case ApplicationTag.COV_SUBSCRIPTION:
			encodeCovSubscription(buffer, value.value as BACNetCovSubscription)
			break
		case ApplicationTag.READ_ACCESS_RESULT:
			encodeReadAccessResult(buffer, value.value as BACNetReadAccess)
			break
		case ApplicationTag.READ_ACCESS_SPECIFICATION:
			encodeReadAccessSpecification(
				buffer,
				value.value as BACNetReadAccessSpecification,
			)
			break
		case undefined:
			throw new Error(
				'Cannot encode a value if the type has not been specified',
			)
		default:
			throw new Error('Unknown type')
	}
}

const bacappEncodeDeviceObjPropertyRef = (
	buffer: EncodeBuffer,
	value: BACNetDevObjRef,
): void => {
	encodeContextObjectId(
		buffer,
		0,
		value.objectId.type,
		value.objectId.instance,
	)
	encodeContextEnumerated(buffer, 1, value.id)
	if (value.arrayIndex !== ASN1_ARRAY_ALL) {
		encodeContextUnsigned(buffer, 2, value.arrayIndex)
	}
	if (value.deviceIndentifier.type === ObjectType.DEVICE) {
		encodeContextObjectId(
			buffer,
			3,
			value.deviceIndentifier.type,
			value.deviceIndentifier.instance,
		)
	}
}

export const bacappEncodeContextDeviceObjPropertyRef = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: BACNetDevObjRef,
): void => {
	encodeOpeningTag(buffer, tagNumber)
	bacappEncodeDeviceObjPropertyRef(buffer, value)
	encodeClosingTag(buffer, tagNumber)
}

export const bacappEncodePropertyState = (
	buffer: EncodeBuffer,
	value: BACNetPropertyState,
): void => {
	switch (value.type) {
		case PropertyStates.BOOLEAN_VALUE:
			encodeContextBoolean(buffer, 0, value.state === 1)
			break
		case PropertyStates.BINARY_VALUE:
			encodeContextEnumerated(buffer, 1, value.state)
			break
		case PropertyStates.EVENT_TYPE:
			encodeContextEnumerated(buffer, 2, value.state)
			break
		case PropertyStates.POLARITY:
			encodeContextEnumerated(buffer, 3, value.state)
			break
		case PropertyStates.PROGRAM_CHANGE:
			encodeContextEnumerated(buffer, 4, value.state)
			break
		case PropertyStates.PROGRAM_STATE:
			encodeContextEnumerated(buffer, 5, value.state)
			break
		case PropertyStates.REASON_FOR_HALT:
			encodeContextEnumerated(buffer, 6, value.state)
			break
		case PropertyStates.RELIABILITY:
			encodeContextEnumerated(buffer, 7, value.state)
			break
		case PropertyStates.STATE:
			encodeContextEnumerated(buffer, 8, value.state)
			break
		case PropertyStates.SYSTEM_STATUS:
			encodeContextEnumerated(buffer, 9, value.state)
			break
		case PropertyStates.UNITS:
			encodeContextEnumerated(buffer, 10, value.state)
			break
		case PropertyStates.UNSIGNED_VALUE:
			encodeContextUnsigned(buffer, 11, value.state)
			break
		case PropertyStates.LIFE_SAFETY_MODE:
			encodeContextEnumerated(buffer, 12, value.state)
			break
		case PropertyStates.LIFE_SAFETY_STATE:
			encodeContextEnumerated(buffer, 13, value.state)
			break
		default:
			break
	}
}

export const encodeContextBitstring = (
	buffer: EncodeBuffer,
	tagNumber: number,
	bitString: BACNetBitString,
): void => {
	const bitStringEncodedLength = bitstringBytesUsed(bitString) + 1
	encodeTag(buffer, tagNumber, true, bitStringEncodedLength)
	encodeBitstring(buffer, bitString)
}

export const encodeContextSigned = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: number,
): void => {
	encodeTag(buffer, tagNumber, true, getSignedLength(value))
	encodeBacnetSigned(buffer, value)
}

const encodeContextTime = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: Date,
): void => {
	encodeTag(buffer, tagNumber, true, 4)
	encodeBacnetTime(buffer, value)
}

const bacappEncodeContextDatetime = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: Date,
): void => {
	if (value !== ZERO_DATE) {
		encodeOpeningTag(buffer, tagNumber)
		bacappEncodeDatetime(buffer, value)
		encodeClosingTag(buffer, tagNumber)
	} else {
		throw new Error('wrong Datetime while bacapp encoding context')
	}
}

export const decodeTagNumber = (buffer: Buffer, offset: number): Tag => {
	let len = 1
	let tagNumber: number
	if (isExtendedTagNumber(buffer[offset])) {
		tagNumber = buffer[offset + 1]
		len++
	} else {
		tagNumber = buffer[offset] >> 4
	}
	return {
		len,
		tagNumber,
	}
}

export const decodeIsContextTag = (
	buffer: Buffer,
	offset: number,
	tagNumber: number,
): boolean => {
	const result = decodeTagNumber(buffer, offset)
	return isContextSpecific(buffer[offset]) && result.tagNumber === tagNumber
}

export const decodeIsOpeningTagNumber = (
	buffer: Buffer,
	offset: number,
	tagNumber: number,
): boolean => {
	const result = decodeTagNumber(buffer, offset)
	return isOpeningTag(buffer[offset]) && result.tagNumber === tagNumber
}

export const decodeIsClosingTagNumber = (
	buffer: Buffer,
	offset: number,
	tagNumber: number,
): boolean => {
	const result = decodeTagNumber(buffer, offset)
	return isClosingTag(buffer[offset]) && result.tagNumber === tagNumber
}

export const decodeIsClosingTag = (buffer: Buffer, offset: number): boolean => {
	return (buffer[offset] & 0x07) === 7
}

export const decodeIsOpeningTag = (buffer: Buffer, offset: number): boolean => {
	return (buffer[offset] & 0x07) === 6
}

export const decodeObjectId = (buffer: Buffer, offset: number): ObjectId => {
	const result = decodeUnsigned(buffer, offset, 4)
	const objectType = (result.value >> ASN1_INSTANCE_BITS) & ASN1_MAX_OBJECT
	const instance = result.value & ASN1_MAX_INSTANCE
	return {
		len: result.len,
		objectType,
		instance,
	}
}

const decodeObjectIdSafe = (
	buffer: Buffer,
	offset: number,
	lenValue: number,
): ObjectId => {
	if (lenValue !== 4) {
		return {
			len: 0,
			objectType: 0,
			instance: 0,
		}
	}
	return decodeObjectId(buffer, offset)
}

export const decodeTagNumberAndValue = (
	buffer: Buffer,
	offset: number,
): Tag => {
	let value = 0
	const tag = decodeTagNumber(buffer, offset)
	let len = tag.len
	if (isExtendedValue(buffer[offset])) {
		if (buffer[offset + len] === 255) {
			len++
			const result = decodeUnsigned(buffer, offset + len, 4)
			len += result.len
			value = result.value
		} else if (buffer[offset + len] === 254) {
			len++
			const result = decodeUnsigned(buffer, offset + len, 2)
			len += result.len
			value = result.value
		} else {
			value = buffer[offset + len]
			len++
		}
	} else if (isOpeningTag(buffer[offset])) {
		value = 0
	} else if (isClosingTag(buffer[offset])) {
		value = 0
	} else {
		value = buffer[offset] & 0x07
	}
	return {
		len,
		tagNumber: tag.tagNumber,
		value,
	}
}

export const bacappDecodeApplicationData = (
	buffer: Buffer,
	offset: number,
	maxOffset: number,
	objectType: number,
	propertyId: number,
): ApplicationData | undefined => {
	if (!isContextSpecific(buffer[offset])) {
		const tag = decodeTagNumberAndValue(buffer, offset)
		if (tag) {
			const len = tag.len
			const result = bacappDecodeData(
				buffer,
				offset + len,
				maxOffset,
				tag.tagNumber,
				tag.value,
			)
			if (!result) return undefined
			const resObj: ApplicationData = {
				len: len + result.len,
				type: result.type,
				value: result.value,
			}
			// HACK: Drop string specific handling ASAP
			if (result.encoding !== undefined) resObj.encoding = result.encoding
			return resObj
		}
	} else {
		return bacappDecodeContextApplicationData(
			buffer,
			offset,
			maxOffset,
			objectType,
			propertyId,
		)
	}
	return undefined
}

export const encodeReadAccessResult = (
	buffer: EncodeBuffer,
	value: BACNetReadAccess,
): void => {
	encodeContextObjectId(
		buffer,
		0,
		value.objectId.type,
		value.objectId.instance,
	)
	encodeOpeningTag(buffer, 1)
	value.values.forEach((item) => {
		encodeContextEnumerated(buffer, 2, item.property.id)
		if (item.property.index !== ASN1_ARRAY_ALL) {
			encodeContextUnsigned(buffer, 3, item.property.index)
		}
		if (
			item.value &&
			item.value[0] &&
			item.value[0].value &&
			item.value[0].value.type === 'BacnetError'
		) {
			encodeOpeningTag(buffer, 5)
			encodeApplicationEnumerated(buffer, item.value[0].value.errorClass)
			encodeApplicationEnumerated(buffer, item.value[0].value.errorCode)
			encodeClosingTag(buffer, 5)
		} else {
			encodeOpeningTag(buffer, 4)
			item.value.forEach((subItem) =>
				bacappEncodeApplicationData(buffer, subItem),
			)
			encodeClosingTag(buffer, 4)
		}
	})
	encodeClosingTag(buffer, 1)
}

export const decodeReadAccessResult = (
	buffer: Buffer,
	offset: number,
	apduLen: number,
): ReadAccessDecode | undefined => {
	let len = 0
	const value: {
		objectId: BACNetObjectID
		values: ReadAccessProperty[]
	} = {
		objectId: { type: 0, instance: 0 },
		values: [],
	}

	if (!decodeIsContextTag(buffer, offset + len, 0)) return undefined
	len++
	const objectIdResult = decodeObjectId(buffer, offset + len)
	value.objectId = {
		type: objectIdResult.objectType,
		instance: objectIdResult.instance,
	}
	len += objectIdResult.len
	if (!decodeIsOpeningTagNumber(buffer, offset + len, 1)) return undefined
	len++

	const values: ReadAccessProperty[] = []
	while (apduLen - len > 0) {
		const newEntry: ReadAccessProperty = {
			id: 0,
			index: ASN1_ARRAY_ALL,
			value: [],
		}

		if (decodeIsClosingTagNumber(buffer, offset + len, 1)) {
			len++
			break
		}

		const tagResult1 = decodeTagNumberAndValue(buffer, offset + len)
		len += tagResult1.len
		if (tagResult1.tagNumber !== 2) return undefined
		const enumResult = decodeEnumerated(
			buffer,
			offset + len,
			tagResult1.value,
		)
		newEntry.id = enumResult.value
		len += enumResult.len

		const tagResult2 = decodeTagNumberAndValue(buffer, offset + len)
		if (tagResult2.tagNumber === 3) {
			len += tagResult2.len
			const unsignedResult = decodeUnsigned(
				buffer,
				offset + len,
				tagResult2.value,
			)
			newEntry.index = unsignedResult.value
			len += unsignedResult.len
		}

		const tagResult3 = decodeTagNumberAndValue(buffer, offset + len)
		len += tagResult3.len
		if (tagResult3.tagNumber === 4) {
			const localValues: ApplicationData[] = []
			while (
				len + offset <= buffer.length &&
				!decodeIsClosingTagNumber(buffer, offset + len, 4)
			) {
				const localResult = bacappDecodeApplicationData(
					buffer,
					offset + len,
					apduLen + offset - 1,
					value.objectId.type,
					newEntry.id,
				)
				if (!localResult) return undefined
				len += localResult.len
				const resObj: ApplicationData = {
					value: localResult.value,
					type: localResult.type,
					len: localResult.len,
					...(localResult.encoding !== undefined && {
						encoding: localResult.encoding,
					}),
				}
				localValues.push(resObj)
			}
			if (!decodeIsClosingTagNumber(buffer, offset + len, 4))
				return undefined
			if (
				localValues.length === 2 &&
				localValues[0].type === ApplicationTag.DATE &&
				localValues[1].type === ApplicationTag.TIME
			) {
				const date = localValues[0].value as Date
				const time = localValues[1].value as Date
				const bdatetime = new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					time.getHours(),
					time.getMinutes(),
					time.getSeconds(),
					time.getMilliseconds(),
				)
				newEntry.value = [
					{
						type: ApplicationTag.DATETIME,
						value: bdatetime,
						len: localValues[1].len,
					},
				]
			} else {
				newEntry.value = localValues
			}
			len++
		} else if (tagResult3.tagNumber === 5) {
			const err: ReadAccessError = {
				errorClass: 0,
				errorCode: 0,
			}
			const errTagResult1 = decodeTagNumberAndValue(buffer, offset + len)
			len += errTagResult1.len
			const errorClassResult = decodeEnumerated(
				buffer,
				offset + len,
				errTagResult1.value,
			)
			len += errorClassResult.len
			err.errorClass = errorClassResult.value
			const errTagResult2 = decodeTagNumberAndValue(buffer, offset + len)
			len += errTagResult2.len
			const errorCodeResult = decodeEnumerated(
				buffer,
				offset + len,
				errTagResult2.value,
			)
			len += errorCodeResult.len
			err.errorCode = errorCodeResult.value
			if (!decodeIsClosingTagNumber(buffer, offset + len, 5))
				return undefined
			len++
			newEntry.value = [
				{
					type: ApplicationTag.ERROR,
					value: err,
					len: 0,
				},
			]
		}
		values.push(newEntry)
	}
	value.values = values
	return {
		len,
		value,
	}
}

export const decodeSigned = (
	buffer: Buffer,
	offset: number,
	length: number,
): Decode<number> => ({
	len: length,
	value: buffer.readIntBE(offset, length),
})

export const decodeReal = (buffer: Buffer, offset: number): Decode<number> => ({
	len: 4,
	value: buffer.readFloatBE(offset),
})

const decodeRealSafe = (
	buffer: Buffer,
	offset: number,
	lenValue: number,
): Decode<number> => {
	if (lenValue !== 4) {
		return {
			len: lenValue,
			value: 0,
		}
	}
	return decodeReal(buffer, offset)
}

const decodeDouble = (buffer: Buffer, offset: number): Decode<number> => ({
	len: 8,
	value: buffer.readDoubleBE(offset),
})

const decodeDoubleSafe = (
	buffer: Buffer,
	offset: number,
	lenValue: number,
): Decode<number> => {
	if (lenValue !== 8) {
		return {
			len: lenValue,
			value: 0,
		}
	}
	return decodeDouble(buffer, offset)
}

export const decodeOctetString = (
	buffer: Buffer,
	offset: number,
	maxLength: number,
	octetStringOffset: number,
	octetStringLength: number,
): Decode<number[]> => {
	const octetString = []
	for (
		let i = octetStringOffset;
		i < octetStringOffset + octetStringLength;
		i++
	) {
		octetString.push(buffer[offset + i])
	}
	return {
		len: octetStringLength,
		value: octetString,
	}
}

const multiCharsetCharacterstringDecode = (
	buffer: Buffer,
	offset: number,
	maxLength: number,
	encoding: number,
	length: number,
): CharacterString => {
	const stringBuf = Buffer.alloc(length)
	buffer.copy(stringBuf, 0, offset, offset + length)
	return {
		value: iconv.decode(
			stringBuf,
			getEncodingType(encoding, buffer, offset),
		),
		len: length + 1,
		encoding,
	}
}

export const decodeCharacterString = (
	buffer: Buffer,
	offset: number,
	maxLength: number,
	lenValue: number,
): CharacterString => {
	return multiCharsetCharacterstringDecode(
		buffer,
		offset + 1,
		maxLength,
		buffer[offset],
		lenValue - 1,
	)
}

const bitstringSetBitsUsed = (
	bitString: BACNetBitString,
	bytesUsed: number,
	unusedBits: number,
): void => {
	bitString.bitsUsed = bytesUsed * 8
	bitString.bitsUsed -= unusedBits
}

export const decodeBitstring = (
	buffer: Buffer,
	offset: number,
	lenValue: number,
): Decode<BACNetBitString> => {
	let len = 0
	const bitString: BACNetBitString = { value: [], bitsUsed: 0 }
	if (lenValue > 0) {
		const bytesUsed = lenValue - 1
		if (bytesUsed <= ASN1_MAX_BITSTRING_BYTES) {
			len = 1
			for (let i = 0; i < bytesUsed; i++) {
				bitString.value.push(byteReverseBits(buffer[offset + len++]))
			}
			const unusedBits = buffer[offset] & 0x07
			bitstringSetBitsUsed(bitString, bytesUsed, unusedBits)
		}
	}
	return {
		len,
		value: bitString,
	}
}

export const decodeDate = (buffer: Buffer, offset: number): Decode<Date> => {
	let date: Date
	const year = buffer[offset] + 1900
	const month = buffer[offset + 1]
	const day = buffer[offset + 2]
	const wday = buffer[offset + 3]
	if (
		month === 0xff &&
		day === 0xff &&
		wday === 0xff &&
		year - 1900 === 0xff
	) {
		date = ZERO_DATE
	} else {
		date = new Date(year, month - 1, day)
	}
	return {
		len: 4,
		value: date,
	}
}

const decodeDateSafe = (
	buffer: Buffer,
	offset: number,
	lenValue: number,
): Decode<Date> => {
	if (lenValue !== 4) {
		return {
			len: lenValue,
			value: ZERO_DATE,
		}
	}
	return decodeDate(buffer, offset)
}

export const decodeApplicationDate = (
	buffer: Buffer,
	offset: number,
): Decode<Date> | undefined => {
	const result = decodeTagNumber(buffer, offset)
	if (result.tagNumber === ApplicationTag.DATE) {
		const value = decodeDate(buffer, offset + 1)
		return {
			len: value.len + 1,
			value: value.value,
		}
	}
	return undefined
}

export const decodeBacnetTime = (
	buffer: Buffer,
	offset: number,
): Decode<Date> => {
	const value: Date = new Date(ZERO_DATE)
	const hour = buffer[offset + 0]
	const min = buffer[offset + 1]
	const sec = buffer[offset + 2]
	let hundredths = buffer[offset + 3]
	if (hour !== 0xff || min !== 0xff || sec !== 0xff || hundredths !== 0xff) {
		if (hundredths > 100) hundredths = 0
		value.setHours(hour)
		value.setMinutes(min)
		value.setSeconds(sec)
		value.setMilliseconds(hundredths * 10)
	}
	return {
		len: 4,
		value,
	}
}

const decodeBacnetTimeSafe = (
	buffer: Buffer,
	offset: number,
	len: number,
): Decode<Date> => {
	if (len !== 4) {
		return { len, value: ZERO_DATE }
	}
	return decodeBacnetTime(buffer, offset)
}

export const decodeApplicationTime = (
	buffer: Buffer,
	offset: number,
): Decode<Date> | undefined => {
	const result = decodeTagNumber(buffer, offset)
	if (result.tagNumber === ApplicationTag.TIME) {
		const value = decodeBacnetTime(buffer, offset + 1)
		return {
			len: value.len + 1,
			value: value.value,
		}
	}
	return undefined
}

const decodeBacnetDatetime = (buffer: Buffer, offset: number): Decode<Date> => {
	let len = 0
	const rawDate = decodeApplicationDate(buffer, offset + len)
	if (!rawDate) return { len: 0, value: ZERO_DATE }

	len += rawDate.len
	const date = rawDate.value
	const rawTime = decodeApplicationTime(buffer, offset + len)
	if (!rawTime) return { len, value: date }

	len += rawTime.len
	const time = rawTime.value
	return {
		len,
		value: new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDay(),
			time.getHours(),
			time.getMinutes(),
			time.getSeconds(),
			time.getMilliseconds(),
		),
	}
}

const bacappDecodeData = (
	buffer: Buffer,
	offset: number,
	maxLength: number,
	tagDataType: number,
	lenValueType: number,
): ApplicationData => {
	let result
	const value: ApplicationData = {
		len: 0,
		type: tagDataType,
		value: null,
	}
	switch (tagDataType) {
		case ApplicationTag.NULL:
			value.value = null
			break
		case ApplicationTag.BOOLEAN:
			value.value = lenValueType > 0
			break
		case ApplicationTag.UNSIGNED_INTEGER:
			result = decodeUnsigned(buffer, offset, lenValueType)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.SIGNED_INTEGER:
			result = decodeSigned(buffer, offset, lenValueType)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.REAL:
			result = decodeRealSafe(buffer, offset, lenValueType)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.DOUBLE:
			result = decodeDoubleSafe(buffer, offset, lenValueType)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.OCTET_STRING:
			result = decodeOctetString(
				buffer,
				offset,
				maxLength,
				0,
				lenValueType,
			)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.CHARACTER_STRING:
			result = decodeCharacterString(
				buffer,
				offset,
				maxLength,
				lenValueType,
			)
			value.len += result.len
			value.value = result.value
			value.encoding = result.encoding
			break
		case ApplicationTag.BIT_STRING:
			result = decodeBitstring(buffer, offset, lenValueType)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.ENUMERATED:
			result = decodeEnumerated(buffer, offset, lenValueType)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.DATE:
			result = decodeDateSafe(buffer, offset, lenValueType)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.TIME:
			result = decodeBacnetTimeSafe(buffer, offset, lenValueType)
			value.len += result.len
			value.value = result.value
			break
		case ApplicationTag.OBJECTIDENTIFIER:
			result = decodeObjectIdSafe(buffer, offset, lenValueType)
			value.len += result.len
			value.value = { type: result.objectType, instance: result.instance }
			break
		default:
			break
	}
	return value
}

const bacappContextTagType = (property: number, tagNumber: number): number => {
	let tag = 0
	switch (property) {
		case PropertyIdentifier.ACTUAL_SHED_LEVEL:
		case PropertyIdentifier.REQUESTED_SHED_LEVEL:
		case PropertyIdentifier.EXPECTED_SHED_LEVEL:
			switch (tagNumber) {
				case 0:
				case 1:
					tag = ApplicationTag.UNSIGNED_INTEGER
					break
				case 2:
					tag = ApplicationTag.REAL
					break
				default:
					break
			}
			break
		case PropertyIdentifier.ACTION:
			switch (tagNumber) {
				case 0:
				case 1:
					tag = ApplicationTag.OBJECTIDENTIFIER
					break
				case 2:
					tag = ApplicationTag.ENUMERATED
					break
				case 3:
				case 5:
				case 6:
					tag = ApplicationTag.UNSIGNED_INTEGER
					break
				case 7:
				case 8:
					tag = ApplicationTag.BOOLEAN
					break
				default:
					break
			}
			break
		case PropertyIdentifier.LIST_OF_GROUP_MEMBERS:
			switch (tagNumber) {
				case 0:
					tag = ApplicationTag.OBJECTIDENTIFIER
					break
				default:
					break
			}
			break
		case PropertyIdentifier.EXCEPTION_SCHEDULE:
			switch (tagNumber) {
				case 1:
					tag = ApplicationTag.OBJECTIDENTIFIER
					break
				case 3:
					tag = ApplicationTag.UNSIGNED_INTEGER
					break
				default:
					break
			}
			break
		case PropertyIdentifier.LOG_DEVICE_OBJECT_PROPERTY:
			switch (tagNumber) {
				case 0:
				case 3:
					tag = ApplicationTag.OBJECTIDENTIFIER
					break
				case 1:
					tag = ApplicationTag.ENUMERATED
					break
				case 2:
					tag = ApplicationTag.UNSIGNED_INTEGER
					break
				default:
					break
			}
			break
		case PropertyIdentifier.SUBORDINATE_LIST:
			switch (tagNumber) {
				case 0:
				case 1:
					tag = ApplicationTag.OBJECTIDENTIFIER
					break
				default:
					break
			}
			break
		case PropertyIdentifier.RECIPIENT_LIST:
			switch (tagNumber) {
				case 0:
					tag = ApplicationTag.OBJECTIDENTIFIER
					break
				default:
					break
			}
			break
		case PropertyIdentifier.ACTIVE_COV_SUBSCRIPTIONS:
			switch (tagNumber) {
				case 0:
				case 1:
					break
				case 2:
					tag = ApplicationTag.BOOLEAN
					break
				case 3:
					tag = ApplicationTag.UNSIGNED_INTEGER
					break
				case 4:
					tag = ApplicationTag.REAL
					break
				default:
					break
			}
			break
		default:
			break
	}
	return tag
}

const decodeDeviceObjPropertyRef = (
	buffer: Buffer,
	offset: number,
): DeviceObjPropertyRef | undefined => {
	let len = 0
	// let arrayIndex = ASN1_ARRAY_ALL;
	if (!decodeIsContextTag(buffer, offset + len, 0)) return undefined
	len++
	let objectId = decodeObjectId(buffer, offset + len)
	len += objectId.len
	let result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	if (result.tagNumber !== 1) return undefined
	const id = decodeEnumerated(buffer, offset + len, result.value)
	len += id.len
	result = decodeTagNumberAndValue(buffer, offset + len)
	if (result.tagNumber === 2) {
		len += result.len
		// FIXME: This doesn't seem to be used
		const unsignedResult = decodeUnsigned(
			buffer,
			offset + len,
			result.value,
		)
		len += unsignedResult.len
	}
	if (decodeIsContextTag(buffer, offset + len, 3)) {
		if (!isClosingTag(buffer[offset + len])) {
			len++
			objectId = decodeObjectId(buffer, offset + len)
			len += objectId.len
		}
	}
	return {
		len,
		value: {
			objectId,
			id,
		},
	}
}

export const decodeReadAccessSpecification = (
	buffer: Buffer,
	offset: number,
	apduLen: number,
): ReadAccessSpec | undefined => {
	let len = 0
	const value: BACNetReadAccessSpecification = {
		objectId: { type: 0, instance: 0 },
		properties: [],
	}

	if (!decodeIsContextTag(buffer, offset + len, 0)) return undefined
	len++
	const objectIdResult = decodeObjectId(buffer, offset + len)
	value.objectId = {
		type: objectIdResult.objectType,
		instance: objectIdResult.instance,
	}
	len += objectIdResult.len
	if (!decodeIsOpeningTagNumber(buffer, offset + len, 1)) return undefined
	len++

	const propertyIdAndArrayIndex: BACNetPropertyID[] = []
	while (
		apduLen - len > 1 &&
		!decodeIsClosingTagNumber(buffer, offset + len, 1)
	) {
		const propertyRef: BACNetPropertyID = {
			id: 0,
			index: ASN1_ARRAY_ALL,
		}
		if (!isContextSpecific(buffer[offset + len])) return undefined
		const tagResult = decodeTagNumberAndValue(buffer, offset + len)
		len += tagResult.len
		if (tagResult.tagNumber !== 0) return undefined
		if (len + tagResult.value >= apduLen) return undefined
		const enumResult = decodeEnumerated(
			buffer,
			offset + len,
			tagResult.value,
		)
		propertyRef.id = enumResult.value
		len += enumResult.len

		if (
			isContextSpecific(buffer[offset + len]) &&
			!isClosingTag(buffer[offset + len])
		) {
			const indexTagResult = decodeTagNumberAndValue(buffer, offset + len)
			if (indexTagResult.tagNumber === 1) {
				len += indexTagResult.len
				if (len + indexTagResult.value >= apduLen) return undefined
				const unsignedResult = decodeUnsigned(
					buffer,
					offset + len,
					indexTagResult.value,
				)
				propertyRef.index = unsignedResult.value
				len += unsignedResult.len
			}
		}
		propertyIdAndArrayIndex.push(propertyRef)
	}
	if (!decodeIsClosingTagNumber(buffer, offset + len, 1)) return undefined
	len++
	value.properties = propertyIdAndArrayIndex
	return {
		len,
		value,
	}
}

const decodeCovSubscription = (
	buffer: Buffer,
	offset: number,
	apduLen: number,
): CovSubscription | undefined => {
	let len = 0
	const value: BACNetCovSubscription = {
		recipient: {
			network: 0,
			address: [],
		},
		subscriptionProcessId: 0,
		monitoredObjectId: { type: 0, instance: 0 },
		monitoredProperty: { id: 0, index: 0 },
		issueConfirmedNotifications: false,
		timeRemaining: 0,
		covIncrement: 0,
	}

	let result
	let decodedValue

	if (!decodeIsOpeningTagNumber(buffer, offset + len, 0)) return undefined
	len++
	if (!decodeIsOpeningTagNumber(buffer, offset + len, 0)) return undefined
	len++
	if (!decodeIsOpeningTagNumber(buffer, offset + len, 1)) return undefined
	len++
	result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	if (result.tagNumber !== ApplicationTag.UNSIGNED_INTEGER) return undefined
	decodedValue = decodeUnsigned(buffer, offset + len, result.value)
	len += decodedValue.len
	value.recipient.network = decodedValue.value
	result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	if (result.tagNumber !== ApplicationTag.OCTET_STRING) return undefined
	decodedValue = decodeOctetString(
		buffer,
		offset + len,
		apduLen,
		0,
		result.value,
	)
	len += decodedValue.len
	value.recipient.address = decodedValue.value
	if (!decodeIsClosingTagNumber(buffer, offset + len, 1)) return undefined
	len++
	if (!decodeIsClosingTagNumber(buffer, offset + len, 0)) return undefined
	len++
	result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	if (result.tagNumber !== 1) return undefined
	decodedValue = decodeUnsigned(buffer, offset + len, result.value)
	len += decodedValue.len
	value.subscriptionProcessId = decodedValue.value
	if (!decodeIsClosingTagNumber(buffer, offset + len, 0)) return undefined
	len++
	if (!decodeIsOpeningTagNumber(buffer, offset + len, 1)) return undefined
	len++
	result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	if (result.tagNumber !== 0) return undefined
	decodedValue = decodeObjectId(buffer, offset + len)
	len += decodedValue.len
	value.monitoredObjectId = {
		type: decodedValue.objectType,
		instance: decodedValue.instance,
	}
	result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	if (result.tagNumber !== 1) return undefined
	decodedValue = decodeEnumerated(buffer, offset + len, result.value)
	len += decodedValue.len
	value.monitoredProperty.id = decodedValue.value
	result = decodeTagNumberAndValue(buffer, offset + len)
	if (result.tagNumber === 2) {
		len += result.len
		decodedValue = decodeUnsigned(buffer, offset + len, result.value)
		len += decodedValue.len
		value.monitoredProperty.index = decodedValue.value
	} else {
		value.monitoredProperty.index = ASN1_ARRAY_ALL
	}
	if (!decodeIsClosingTagNumber(buffer, offset + len, 1)) return undefined
	len++
	result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	if (result.tagNumber !== 2) return undefined
	value.issueConfirmedNotifications = buffer[offset + len] > 0
	len++
	result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	if (result.tagNumber !== 3) return undefined
	decodedValue = decodeUnsigned(buffer, offset + len, result.value)
	len += decodedValue.len
	value.timeRemaining = decodedValue.value
	if (len < apduLen && !isClosingTag(buffer[offset + len])) {
		result = decodeTagNumberAndValue(buffer, offset + len)
		len += result.len
		if (result.tagNumber !== 4) return undefined
		decodedValue = decodeReal(buffer, offset + len)
		len += decodedValue.len
		value.covIncrement = decodedValue.value
	}
	return {
		len,
		value,
	}
}

const decodeCalendarDate = (buffer: Buffer, offset: number): CalendarDate => ({
	len: 4,
	year: buffer[offset],
	month: buffer[offset + 1],
	day: buffer[offset + 2],
	wday: buffer[offset + 3],
})

const decodeCalendarDateRange = (
	buffer: Buffer,
	offset: number,
): CalendarDateRange => {
	let len = 1
	const startDate = decodeDate(buffer, offset + len)
	len += startDate.len + 1
	const endDate = decodeDate(buffer, offset + len)
	len += endDate.len + 1
	return {
		len,
		startDate,
		endDate,
	}
}

const decodeCalendarWeekDay = (
	buffer: Buffer,
	offset: number,
): CalendarWeekDay => ({
	len: 3,
	month: buffer[offset],
	week: buffer[offset + 1],
	wday: buffer[offset + 2],
})

const decodeCalendar = (
	buffer: Buffer,
	offset: number,
	apduLen: number,
): Calendar | undefined => {
	let len = 0
	const entries = []
	while (len < apduLen) {
		const result = decodeTagNumber(buffer, offset + len)
		len += result.len
		switch (result.tagNumber) {
			case 0: {
				const decodedValue = decodeCalendarDate(buffer, offset + len)
				len += decodedValue.len
				entries.push(decodedValue)
				break
			}
			case 1: {
				const decodedValue = decodeCalendarDateRange(
					buffer,
					offset + len,
				)
				len += decodedValue.len
				entries.push(decodedValue)
				break
			}
			case 2: {
				const decodedValue = decodeCalendarWeekDay(buffer, offset + len)
				len += decodedValue.len
				entries.push(decodedValue)
				break
			}
			default:
				return {
					len: len - 1,
					value: entries,
				}
		}
	}
	return undefined
}

const bacappDecodeContextApplicationData = (
	buffer: Buffer,
	offset: number,
	maxOffset: number,
	objectType: number,
	propertyId: number,
): ApplicationData | undefined => {
	let len = 0
	if (isContextSpecific(buffer[offset])) {
		if (propertyId === PropertyIdentifier.LIST_OF_GROUP_MEMBERS) {
			const result = decodeReadAccessSpecification(
				buffer,
				offset,
				maxOffset,
			)
			if (!result) return undefined
			return {
				type: ApplicationTag.READ_ACCESS_SPECIFICATION,
				value: result.value,
				len: result.len,
			}
		}
		if (propertyId === PropertyIdentifier.ACTIVE_COV_SUBSCRIPTIONS) {
			const result = decodeCovSubscription(buffer, offset, maxOffset)
			if (!result) return undefined
			return {
				type: ApplicationTag.COV_SUBSCRIPTION,
				value: result.value,
				len: result.len,
			}
		}
		if (
			objectType === ObjectType.GROUP &&
			propertyId === PropertyIdentifier.PRESENT_VALUE
		) {
			const result = decodeReadAccessResult(buffer, offset, maxOffset)
			if (!result) return undefined
			return {
				type: ApplicationTag.READ_ACCESS_RESULT,
				value: result.value,
				len: result.len,
			}
		}
		if (
			propertyId ===
				PropertyIdentifier.LIST_OF_OBJECT_PROPERTY_REFERENCES ||
			propertyId === PropertyIdentifier.LOG_DEVICE_OBJECT_PROPERTY ||
			propertyId === PropertyIdentifier.OBJECT_PROPERTY_REFERENCE
		) {
			const result = decodeDeviceObjPropertyRef(buffer, offset)
			if (!result) return undefined
			return {
				type: ApplicationTag.OBJECT_PROPERTY_REFERENCE,
				value: result.value,
				len: result.len,
			}
		}
		if (propertyId === PropertyIdentifier.DATE_LIST) {
			const result = decodeCalendar(buffer, offset, maxOffset)
			if (!result) return undefined
			return {
				type: ApplicationTag.CONTEXT_SPECIFIC_DECODED,
				value: result.value,
				len: result.len,
			}
		}
		if (propertyId === PropertyIdentifier.EVENT_TIME_STAMPS) {
			let subEvtResult
			const evtResult = decodeTagNumberAndValue(buffer, offset + len)
			len += 1
			if (evtResult.tagNumber === 0) {
				subEvtResult = decodeBacnetTime(buffer, offset + 1)
				return {
					type: ApplicationTag.TIMESTAMP,
					value: subEvtResult.value,
					len: subEvtResult.len + 1,
				}
			}
			if (evtResult.tagNumber === 1) {
				subEvtResult = decodeUnsigned(
					buffer,
					offset + len,
					evtResult.value,
				)
				return {
					type: ApplicationTag.UNSIGNED_INTEGER,
					value: subEvtResult.value,
					len: subEvtResult.len + 1,
				}
			}
			if (evtResult.tagNumber === 2) {
				subEvtResult = decodeBacnetDatetime(buffer, offset + len)
				return {
					type: ApplicationTag.TIMESTAMP,
					value: subEvtResult.value,
					len: subEvtResult.len + 2,
				}
			}
			return undefined
		}
		const list = []
		const tagResult = decodeTagNumberAndValue(buffer, offset + len)
		const multipleValues = isOpeningTag(buffer[offset + len])
		while (
			len + offset <= maxOffset &&
			!isClosingTag(buffer[offset + len])
		) {
			const subResult = decodeTagNumberAndValue(buffer, offset + len)
			if (!subResult) return undefined
			if (subResult.value === 0) {
				len += subResult.len
				const result = bacappDecodeApplicationData(
					buffer,
					offset + len,
					maxOffset,
					ASN1_MAX_OBJECT_TYPE,
					ASN1_MAX_PROPERTY_ID,
				)
				if (!result) return undefined
				list.push(result)
				len += result.len
			} else {
				const overrideTagNumber = bacappContextTagType(
					propertyId,
					subResult.tagNumber,
				)
				if (overrideTagNumber !== ASN1_MAX_APPLICATION_TAG) {
					subResult.tagNumber = overrideTagNumber
				}
				const bacappResult = bacappDecodeData(
					buffer,
					offset + len + subResult.len,
					maxOffset,
					subResult.tagNumber,
					subResult.value,
				)
				if (!bacappResult) return undefined
				if (bacappResult.len === subResult.value) {
					const resObj: {
						value: any
						type: number
						encoding?: number
					} = {
						value: bacappResult.value,
						type: bacappResult.type,
					}
					// HACK: Drop string specific handling ASAP
					if (bacappResult.encoding !== undefined)
						resObj.encoding = bacappResult.encoding
					list.push(resObj)
					len += subResult.len + subResult.value
				} else {
					list.push({
						value: buffer.slice(
							offset + len + subResult.len,
							offset + len + subResult.len + subResult.value,
						),
						type: ApplicationTag.CONTEXT_SPECIFIC_ENCODED,
					})
					len += subResult.len + subResult.value
				}
			}
			if (multipleValues === false) {
				return {
					len,
					value: list[0],
					type: ApplicationTag.CONTEXT_SPECIFIC_DECODED,
				}
			}
		}
		if (len + offset > maxOffset) return undefined
		if (
			decodeIsClosingTagNumber(buffer, offset + len, tagResult.tagNumber)
		) {
			len++
		}
		return {
			len,
			value: list,
			type: ApplicationTag.CONTEXT_SPECIFIC_DECODED,
		}
	}
	return undefined
}

export const bacappEncodeTimestamp = (
	buffer: EncodeBuffer,
	value: { type: number; value: any },
): void => {
	switch (value.type) {
		case TimeStamp.TIME:
			encodeContextTime(buffer, 0, value.value)
			break
		case TimeStamp.SEQUENCE_NUMBER:
			encodeContextUnsigned(buffer, 1, value.value)
			break
		case TimeStamp.DATETIME:
			bacappEncodeContextDatetime(buffer, 2, value.value)
			break
		default:
			throw new Error('NOT_IMPLEMENTED')
	}
}

export const bacappEncodeContextTimestamp = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: { type: number; value: any },
): void => {
	encodeOpeningTag(buffer, tagNumber)
	bacappEncodeTimestamp(buffer, value)
	encodeClosingTag(buffer, tagNumber)
}

export const decodeContextCharacterString = (
	buffer: Buffer,
	offset: number,
	maxLength: number,
	tagNumber: number,
): ContextCharacterString | undefined => {
	let len = 0
	if (!decodeIsContextTag(buffer, offset + len, tagNumber)) return undefined
	const result = decodeTagNumberAndValue(buffer, offset + len)
	len += result.len
	const decodedValue = multiCharsetCharacterstringDecode(
		buffer,
		offset + 1 + len,
		maxLength,
		buffer[offset + len],
		result.value - 1,
	)
	if (!decodedValue) return undefined
	len += result.value
	return {
		len,
		value: decodedValue.value,
		encoding: decodedValue.encoding,
	}
}

const decodeIsContextTagWithLength = (
	buffer: Buffer,
	offset: number,
	tagNumber: number,
): ContextTagWithLength => {
	const result = decodeTagNumber(buffer, offset)
	return {
		len: result.len,
		value:
			isContextSpecific(buffer[offset]) && result.tagNumber === tagNumber,
	}
}

export const decodeContextObjectId = (
	buffer: Buffer,
	offset: number,
	tagNumber: number,
): ObjectId | undefined => {
	const result = decodeIsContextTagWithLength(buffer, offset, tagNumber)
	if (!result.value) return undefined
	const decodedValue = decodeObjectId(buffer, offset + result.len)
	decodedValue.len += result.len
	return decodedValue
}

const encodeBacnetCharacterString = (
	buffer: EncodeBuffer,
	value: string,
	encoding?: number,
): void => {
	encoding = encoding || CharacterStringEncoding.UTF_8
	buffer.buffer[buffer.offset++] = encoding
	const bufEncoded = iconv.encode(value, getEncodingType(encoding))
	buffer.offset += bufEncoded.copy(buffer.buffer, buffer.offset)
}

export const encodeApplicationCharacterString = (
	buffer: EncodeBuffer,
	value: string,
	encoding?: number,
): void => {
	const tmp = getBuffer()
	encodeBacnetCharacterString(tmp, value, encoding)
	encodeTag(buffer, ApplicationTag.CHARACTER_STRING, false, tmp.offset)
	tmp.buffer.copy(buffer.buffer, buffer.offset, 0, tmp.offset)
	buffer.offset += tmp.offset
}

export const encodeContextCharacterString = (
	buffer: EncodeBuffer,
	tagNumber: number,
	value: string,
	encoding?: number,
): void => {
	const tmp = getBuffer()
	encodeBacnetCharacterString(tmp, value, encoding)
	encodeTag(buffer, tagNumber, true, tmp.offset)
	tmp.buffer.copy(buffer.buffer, buffer.offset, 0, tmp.offset)
	buffer.offset += tmp.offset
}
