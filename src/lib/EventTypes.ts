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
	unhandledEvent: (content: ServiceMessage | BACnetMessage) => void
	readProperty: (content: {
		header?: BACnetMessageHeader
		payload: DecodeAcknowledgeSingleResult
	}) => void
	writeProperty: (content: {
		header?: BACnetMessageHeader
		payload: SimpleAckPayload
	}) => void
	readPropertyMultiple: (content: {
		header?: BACnetMessageHeader
		payload: DecodeAcknowledgeMultipleResult
	}) => void
	writePropertyMultiple: (content: {
		header?: BACnetMessageHeader
		payload: SimpleAckPayload
	}) => void
	covNotify: (content: {
		header?: BACnetMessageHeader
		payload: CovNotifyPayload
	}) => void
	atomicWriteFile: (content: {
		header?: BACnetMessageHeader
		payload: AtomicFilePayload
	}) => void
	atomicReadFile: (content: {
		header?: BACnetMessageHeader
		payload: AtomicFilePayload
	}) => void
	subscribeCov: (content: {
		header?: BACnetMessageHeader
		payload: SubscribeCovPayload
	}) => void
	subscribeProperty: (content: {
		header?: BACnetMessageHeader
		payload: SubscribeCovPayload
	}) => void
	deviceCommunicationControl: (content: {
		header?: BACnetMessageHeader
		payload: DeviceCommunicationControlPayload
	}) => void
	reinitializeDevice: (content: {
		header?: BACnetMessageHeader
		payload: ReinitializeDevicePayload
	}) => void
	eventNotify: (content: {
		header?: BACnetMessageHeader
		payload: EventNotificationPayload
	}) => void
	readRange: (content: {
		header?: BACnetMessageHeader
		payload: ReadRangePayload
	}) => void
	createObject: (content: {
		header?: BACnetMessageHeader
		payload: ObjectOperationPayload
	}) => void
	deleteObject: (content: {
		header?: BACnetMessageHeader
		payload: ObjectOperationPayload
	}) => void
	alarmAcknowledge: (content: {
		header?: BACnetMessageHeader
		payload: SimpleAckPayload
	}) => void
	getAlarmSummary: (content: {
		header?: BACnetMessageHeader
		payload: BACNetAlarm[]
	}) => void
	getEnrollmentSummary: (content: {
		header?: BACnetMessageHeader
		payload: any
	}) => void
	getEventInformation: (content: {
		header?: BACnetMessageHeader
		payload: BACNetEventInformation[]
	}) => void
	lifeSafetyOperation: (content: {
		header?: BACnetMessageHeader
		payload: any
	}) => void
	addListElement: (content: {
		header?: BACnetMessageHeader
		payload: ListElementOperationPayload
	}) => void
	removeListElement: (content: {
		header?: BACnetMessageHeader
		payload: ListElementOperationPayload
	}) => void
	privateTransfer: (content: {
		header?: BACnetMessageHeader
		payload: PrivateTransferPayload
	}) => void
	registerForeignDevice: (content: {
		header?: BACnetMessageHeader
		payload: RegisterForeignDevicePayload
	}) => void
	iAm: (content: { header?: BACnetMessageHeader; payload: IAMResult }) => void
	whoIs: (content: {
		header?: BACnetMessageHeader
		payload: WhoIsResult
	}) => void
	whoHas: (content: {
		header?: BACnetMessageHeader
		payload: WhoHasPayload
	}) => void
	covNotifyUnconfirmed: (content: {
		header?: BACnetMessageHeader
		payload: CovNotifyPayload
	}) => void
	timeSync: (content: {
		header?: BACnetMessageHeader
		payload: TimeSyncPayload
	}) => void
	timeSyncUTC: (content: {
		header?: BACnetMessageHeader
		payload: TimeSyncPayload
	}) => void
	iHave: (content: {
		header?: BACnetMessageHeader
		payload: IHavePayload
	}) => void
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
