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
} from './types'

/**
 * Event types for BACnet client
 */
export interface BACnetClientEvents {
	// Base events
	error: (error: Error) => void
	listening: () => void
	unhandledEvent: (content: BACnetMessage) => void

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

	// Others can be added as needed
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
}

/**
 * Type definition for a typed event emitter
 */
export type TypedEventEmitter<
	T extends Record<string, (...args: any[]) => any>,
> = Omit<
	EventEmitter,
	'on' | 'once' | 'emit' | 'addListener' | 'off' | 'removeListener'
> & {
	on<K extends keyof T>(event: K, listener: T[K]): TypedEventEmitter<T>
	once<K extends keyof T>(event: K, listener: T[K]): TypedEventEmitter<T>
	emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean
	addListener<K extends keyof T>(
		event: K,
		listener: T[K],
	): TypedEventEmitter<T>
	off<K extends keyof T>(event: K, listener: T[K]): TypedEventEmitter<T>
	removeListener<K extends keyof T>(
		event: K,
		listener: T[K],
	): TypedEventEmitter<T>
}
