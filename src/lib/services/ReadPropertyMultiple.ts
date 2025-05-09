import * as baAsn1 from '../asn1'
import {
	BACNetReadAccessSpecification,
	DecodeAcknowledgeMultipleResult,
	EncodeBuffer,
	ReadAccessDecode,
} from '../types'
import { BacnetAckService } from './AbstractServices'

export default class ReadPropertyMultiple extends BacnetAckService {
	public static encode(
		buffer: EncodeBuffer,
		properties: BACNetReadAccessSpecification[],
	) {
		properties.forEach((value) =>
			baAsn1.encodeReadAccessSpecification(buffer, value),
		)
	}

	public static decode(buffer: Buffer, offset: number, apduLen: number) {
		let len = 0
		const values = []
		while (apduLen - len > 0) {
			const decodedValue = baAsn1.decodeReadAccessSpecification(
				buffer,
				offset + len,
				apduLen - len,
			)
			if (!decodedValue) return
			len += decodedValue.len
			values.push(decodedValue.value)
		}
		return {
			len,
			properties: values,
		}
	}

	public static encodeAcknowledge(buffer: EncodeBuffer, values: any[]) {
		values.forEach((value) => baAsn1.encodeReadAccessResult(buffer, value))
	}

	public static decodeAcknowledge(
		buffer: Buffer,
		offset: number,
		apduLen: number,
	): DecodeAcknowledgeMultipleResult {
		let len = 0
		const values: ReadAccessDecode['value'][] = []
		while (apduLen - len > 0) {
			const result = baAsn1.decodeReadAccessResult(
				buffer,
				offset + len,
				apduLen - len,
			)
			if (!result) return
			len += result.len
			values.push(result.value)
		}
		return {
			len,
			values,
		}
	}
}
