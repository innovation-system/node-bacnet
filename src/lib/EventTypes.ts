import { EventEmitter } from 'events'
import {
	BACnetMessage,
	BACnetMessageHeader,
	IAMResult,
	WhoIsResult,
	BACNetEventInformation,
	BACNetAlarm,
	DecodeAcknowledgeSingleResult,
	DecodeAcknowledgeMultipleResult,
	ServiceMessage,
} from './types'

/**
 * Event types for BACnet client
 */
export interface BACnetClientEvents {
	// Base events
	error: (error: Error) => void
	listening: () => void
	unhandledEvent: (content: ServiceMessage | BACnetMessage) => void

	// Confirmed service events
	readProperty: (content: {
		header?: BACnetMessageHeader
		payload: DecodeAcknowledgeSingleResult
	}) => void
	writeProperty: (content: {
		header?: BACnetMessageHeader
		payload: null
	}) => void
	readPropertyMultiple: (content: {
		header?: BACnetMessageHeader
		payload: DecodeAcknowledgeMultipleResult
	}) => void
	writePropertyMultiple: (content: {
		header?: BACnetMessageHeader
		payload: null
	}) => void
	getAlarmSummary: (content: {
		header?: BACnetMessageHeader
		payload: BACNetAlarm[]
	}) => void
	getEventInformation: (content: {
		header?: BACnetMessageHeader
		payload: BACNetEventInformation[]
	}) => void

	// Unconfirmed service events
	iAm: (content: { header?: BACnetMessageHeader; payload: IAMResult }) => void
	whoIs: (content: {
		header?: BACnetMessageHeader
		payload: WhoIsResult
	}) => void
	iHave: (content: { header?: BACnetMessageHeader; payload: any }) => void
	covNotifyUnconfirmed: (content: {
		header?: BACnetMessageHeader
		payload: any
	}) => void
	timeSync: (content: { header?: BACnetMessageHeader; payload: any }) => void
	timeSyncUTC: (content: {
		header?: BACnetMessageHeader
		payload: any
	}) => void
	eventNotify: (content: {
		header?: BACnetMessageHeader
		payload: any
	}) => void
	privateTransfer: (content: {
		header?: BACnetMessageHeader
		payload: any
	}) => void

	[key: string]: (...args: any[]) => void
}

/**
 * Event types for Transport
 */
export interface TransportEvents {
	message: (buffer: Buffer, remoteAddress: string) => void
	listening: (address: { address: string; port: number }) => void
	error: (error: Error) => void
	close: () => void

	[key: string]: (...args: any[]) => void
}

/**
 * A type-safe wrapper around EventEmitter
 */
export class TypedEventEmitter<
	Events extends Record<string, (...args: any[]) => any>,
> {
	private emitter = new EventEmitter()

	on<E extends keyof Events>(event: E, listener: Events[E]): this {
		this.emitter.on(event as string, listener as (...args: any[]) => void)
		return this
	}

	once<E extends keyof Events>(event: E, listener: Events[E]): this {
		this.emitter.once(event as string, listener as (...args: any[]) => void)
		return this
	}

	emit<E extends keyof Events>(
		event: E,
		...args: Parameters<Events[E]>
	): boolean {
		return this.emitter.emit(event as string, ...args)
	}

	off<E extends keyof Events>(event: E, listener: Events[E]): this {
		this.emitter.off(event as string, listener as (...args: any[]) => void)
		return this
	}

	removeListener<E extends keyof Events>(
		event: E,
		listener: Events[E],
	): this {
		this.emitter.removeListener(
			event as string,
			listener as (...args: any[]) => void,
		)
		return this
	}

	addListener<E extends keyof Events>(event: E, listener: Events[E]): this {
		this.emitter.addListener(
			event as string,
			listener as (...args: any[]) => void,
		)
		return this
	}

	removeAllListeners(event?: keyof Events): this {
		this.emitter.removeAllListeners(event as string)
		return this
	}

	setMaxListeners(n: number): this {
		this.emitter.setMaxListeners(n)
		return this
	}

	getMaxListeners(): number {
		return this.emitter.getMaxListeners()
	}

	listeners<E extends keyof Events>(event: E): Array<Events[E]> {
		return this.emitter.listeners(event as string) as Array<Events[E]>
	}

	rawListeners<E extends keyof Events>(event: E): Array<Events[E]> {
		return this.emitter.rawListeners(event as string) as Array<Events[E]>
	}

	listenerCount<E extends keyof Events>(event: E): number {
		return this.emitter.listenerCount(event as string)
	}

	eventNames(): (string | symbol)[] {
		return this.emitter.eventNames()
	}
}
