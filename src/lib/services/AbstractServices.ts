import { EncodeBuffer } from '../types'

export abstract class BacnetService {
	public static encode(buffer: EncodeBuffer, ...args: any[]): void {
		throw new Error('Method must be implemented by derived class')
	}

	public static decode(buffer: Buffer, offset: number, apduLen: number): any {
		throw new Error('Method must be implemented by derived class')
	}
}

export abstract class BacnetAckService extends BacnetService {
	public static encodeAcknowledge(
		buffer: EncodeBuffer,
		...args: any[]
	): void {
		throw new Error('Method must be implemented by derived class')
	}

	public static decodeAcknowledge(
		buffer: Buffer,
		offset: number,
		apduLen: number,
	): any {
		throw new Error('Method must be implemented by derived class')
	}
}
