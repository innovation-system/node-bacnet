import { EventEmitter } from 'events'
import Client from '../../src/lib/client'

export const BacnetClient = Client

export class TransportStub extends EventEmitter {
	constructor() {
		super()
	}
	getBroadcastAddress() {
		return '255.255.255.255'
	}
	getMaxPayload() {
		return 1482
	}
	send() {}
	open() {}
	close() {}
}

export const propertyFormater = (object: any[]) => {
	const converted: { [name: number]: any } = {}
	object.forEach((property) => {
		if (property.value && Array.isArray(property.value)) {
			const cleanValues = property.value.map((value: any) => {
				if (value && typeof value === 'object' && 'len' in value) {
					const { len, ...rest } = value
					return rest
				}
				return value
			})
			converted[property.id] = cleanValues
		} else {
			converted[property.id] = property.value
		}
	})
	return converted
}
