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
	SimpleAckPayload,
	CovNotifyPayload,
	AtomicFilePayload,
	SubscribeCovPayload,
	DeviceCommunicationControlPayload,
	ReinitializeDevicePayload,
	EventNotificationPayload,
	ReadRangePayload,
	ObjectOperationPayload,
	ListElementOperationPayload,
	PrivateTransferPayload,
	RegisterForeignDevicePayload,
	WhoHasPayload,
	TimeSyncPayload,
	IHavePayload,
	ServiceResponse,
} from './types'

export type Constructor<T = object> = new (...args: any[]) => T

export function applyMixin(
	target: Constructor,
	mixin: Constructor,
	includeConstructor = false,
): void {
	// Figure out the inheritance chain of the mixin
	const inheritanceChain: Constructor[] = [mixin]

	while (true) {
		const current = inheritanceChain[0]
		const base = Object.getPrototypeOf(current)
		if (base?.prototype) {
			inheritanceChain.unshift(base)
		} else {
			break
		}
	}
	for (const ctor of inheritanceChain) {
		for (const prop of Object.getOwnPropertyNames(ctor.prototype)) {
			// Do not override the constructor
			if (includeConstructor || prop !== 'constructor') {
				Object.defineProperty(
					target.prototype,
					prop,
					Object.getOwnPropertyDescriptor(ctor.prototype, prop) ??
						Object.create(null),
				)
			}
		}
	}
}

/**
 * Event types for BACnet client
 */
export interface BACnetClientEvents {
	error: (error: Error) => void
	listening: () => void
	unhandledEvent: (content: ServiceMessage) => void
	readProperty: ServiceResponse<DecodeAcknowledgeSingleResult>
	writeProperty: ServiceResponse<SimpleAckPayload>
	readPropertyMultiple: ServiceResponse<DecodeAcknowledgeMultipleResult>
	writePropertyMultiple: ServiceResponse<SimpleAckPayload>
	covNotify: ServiceResponse<CovNotifyPayload>
	atomicWriteFile: ServiceResponse<AtomicFilePayload>
	atomicReadFile: ServiceResponse<AtomicFilePayload>
	subscribeCov: ServiceResponse<SubscribeCovPayload>
	subscribeProperty: ServiceResponse<SubscribeCovPayload>
	deviceCommunicationControl: ServiceResponse<DeviceCommunicationControlPayload>
	reinitializeDevice: ServiceResponse<ReinitializeDevicePayload>
	eventNotify: ServiceResponse<EventNotificationPayload>
	readRange: ServiceResponse<ReadRangePayload>
	createObject: ServiceResponse<ObjectOperationPayload>
	deleteObject: ServiceResponse<ObjectOperationPayload>
	alarmAcknowledge: ServiceResponse<SimpleAckPayload>
	getAlarmSummary: ServiceResponse<BACNetAlarm[]>
	getEnrollmentSummary: ServiceResponse<any>
	getEventInformation: ServiceResponse<BACNetEventInformation[]>
	lifeSafetyOperation: ServiceResponse<any>
	addListElement: ServiceResponse<ListElementOperationPayload>
	removeListElement: ServiceResponse<ListElementOperationPayload>
	privateTransfer: ServiceResponse<PrivateTransferPayload>
	registerForeignDevice: ServiceResponse<RegisterForeignDevicePayload>
	iAm: ServiceResponse<IAMResult>
	whoIs: ServiceResponse<WhoIsResult>
	whoHas: ServiceResponse<WhoHasPayload>
	covNotifyUnconfirmed: ServiceResponse<CovNotifyPayload>
	timeSync: ServiceResponse<TimeSyncPayload>
	timeSyncUTC: ServiceResponse<TimeSyncPayload>
	iHave: ServiceResponse<IHavePayload>
}

export type BACnetEventsMap = {
	[key: number]: keyof BACnetClientEvents
}

/**
 * Event types for Transport
 */
export interface TransportEvents {
	message: (buffer: Buffer, remoteAddress: string) => void
	listening: (address: { address: string; port: number }) => void
	error: (error: Error) => void
	close: () => void
}

export type EventHandler =
	// Add more overloads as necessary
	| ((arg1: any, arg2: any, arg3: any, arg4: any) => void)
	| ((arg1: any, arg2: any, arg3: any) => void)
	| ((arg1: any, arg2: any) => void)
	| ((arg1: any) => void)
	| ((...args: any[]) => void)

export type THandler<TEvents> = Record<keyof TEvents, EventHandler>

export interface TypedEventEmitter<
	TEvents extends Record<keyof TEvents, EventHandler>,
> {
	on<TEvent extends keyof TEvents>(
		event: TEvent,
		callback: TEvents[TEvent],
	): this
	once<TEvent extends keyof TEvents>(
		event: TEvent,
		callback: TEvents[TEvent],
	): this
	prependListener<TEvent extends keyof TEvents>(
		event: TEvent,
		callback: TEvents[TEvent],
	): this
	prependOnceListener<TEvent extends keyof TEvents>(
		event: TEvent,
		callback: TEvents[TEvent],
	): this

	removeListener<TEvent extends keyof TEvents>(
		event: TEvent,
		callback: TEvents[TEvent],
	): this
	off<TEvent extends keyof TEvents>(
		event: TEvent,
		callback: TEvents[TEvent],
	): this

	removeAllListeners(event?: keyof TEvents): this

	emit<TEvent extends keyof TEvents>(
		event: TEvent,
		...args: Parameters<TEvents[TEvent]>
	): boolean

	setMaxListeners(n: number): this
	getMaxListeners(): number

	listeners<TEvent extends keyof TEvents>(
		eventName: TEvent,
	): TEvents[TEvent][]
	rawListeners<TEvent extends keyof TEvents>(
		eventName: TEvent,
	): TEvents[TEvent][]
	listenerCount<TEvent extends keyof TEvents>(
		event: TEvent,
		listener?: TEvents[TEvent],
	): number

	eventNames(): Array<keyof TEvents>
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class TypedEventEmitter<TEvents extends THandler<TEvents>> {}

// Make TypedEventEmitter inherit from EventEmitter without actually extending
applyMixin(TypedEventEmitter, EventEmitter)
