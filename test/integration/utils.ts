import { EventEmitter } from 'events'
import Client from '../../src/lib/client'

// Port management for tests to avoid port conflicts
let nextPort = 47809 // Start after standard BACnet port 47808

/**
 * Returns the next available port for BACnet tests
 * Each call returns a unique port to avoid conflicts between tests
 */
export function getNextAvailablePort(): number {
	return nextPort++
}

/**
 * Creates a BACnet client with a unique port to avoid conflicts
 * @param options Client options
 * @returns BACnet client instance with unique port
 */
export function createBacnetClient(options: any = {}): Client {
	// Merge options with default unique port
	const clientOptions = {
		...options,
		port: options.port || getNextAvailablePort(),
	}

	return new Client(clientOptions)
}

// Original client export for backward compatibility
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
