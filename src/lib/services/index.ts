// Import abstract classes
import { BacnetService, BacnetAckService } from './AbstractServices'

// Import service classes
import AddListElement from './AddListElement'
import AlarmAcknowledge from './AlarmAcknowledge'
import AlarmSummary from './AlarmSummary'
import AtomicReadFile from './AtomicReadFile'
import AtomicWriteFile from './AtomicWriteFile'
import CovNotify from './CovNotify'
import CreateObject from './CreateObject'
import DeleteObject from './DeleteObject'
import DeviceCommunicationControl from './DeviceCommunicationControl'
import Error from './Error'
import EventInformation from './EventInformation'
import EventNotifyData from './EventNotifyData'
import GetEnrollmentSummary from './GetEnrollmentSummary'
import GetEventInformation from './GetEventInformation'
import IAm from './IAm'
import IHave from './IHave'
import LifeSafetyOperation from './LifeSafetyOperation'
import PrivateTransfer from './PrivateTransfer'
import ReadProperty from './ReadProperty'
import ReadPropertyMultiple from './ReadPropertyMultiple'
import ReadRange from './ReadRange'
import RegisterForeignDevice from './RegisterForeignDevice'
import ReinitializeDevice from './ReinitializeDevice'
import SubscribeCov from './SubscribeCov'
import SubscribeProperty from './SubscribeProperty'
import TimeSync from './TimeSync'
import WhoHas from './WhoHas'
import WhoIs from './WhoIs'
import WriteProperty from './WriteProperty'
import WritePropertyMultiple from './WritePropertyMultiple'

// Export abstract classes
export { BacnetService, BacnetAckService }

// Export all service classes
export { AddListElement }
export { AlarmAcknowledge }
export { AlarmSummary }
export { AtomicReadFile }
export { AtomicWriteFile }
export { CovNotify }
export { CreateObject }
export { DeleteObject }
export { DeviceCommunicationControl }
export { Error }
export { EventInformation }
export { EventNotifyData }
export { GetEnrollmentSummary }
export { GetEventInformation }
export { IAm }
export { IHave }
export { LifeSafetyOperation }
export { PrivateTransfer }
export { ReadProperty }
export { ReadPropertyMultiple }
export { ReadRange }
export { RegisterForeignDevice }
export { ReinitializeDevice }
export { SubscribeCov }
export { SubscribeProperty }
export { TimeSync }
export { WhoHas }
export { WhoIs }
export { WriteProperty }
export { WritePropertyMultiple }

// Export for backward compatibility
export const addListElement = AddListElement
export const alarmAcknowledge = AlarmAcknowledge
export const alarmSummary = AlarmSummary
export const atomicReadFile = AtomicReadFile
export const atomicWriteFile = AtomicWriteFile
export const covNotify = CovNotify
export const covNotifyUnconfirmed = CovNotify
export const createObject = CreateObject
export const deleteObject = DeleteObject
export const deviceCommunicationControl = DeviceCommunicationControl
export const error = Error
export const eventInformation = EventInformation
export const eventNotifyData = EventNotifyData
export const getEnrollmentSummary = GetEnrollmentSummary
export const getEventInformation = GetEventInformation
export const iAm = IAm
export const iHave = IHave
export const lifeSafetyOperation = LifeSafetyOperation
export const privateTransfer = PrivateTransfer
export const readProperty = ReadProperty
export const readPropertyMultiple = ReadPropertyMultiple
export const readRange = ReadRange
export const registerForeignDevice = RegisterForeignDevice
export const reinitializeDevice = ReinitializeDevice
export const subscribeCov = SubscribeCov
export const subscribeProperty = SubscribeProperty
export const timeSync = TimeSync
export const timeSyncUTC = TimeSync
export const whoHas = WhoHas
export const whoIs = WhoIs
export const writeProperty = WriteProperty
export const writePropertyMultiple = WritePropertyMultiple

// Create and export ServicesMap
export const ServicesMap = {
	addListElement: AddListElement,
	alarmAcknowledge: AlarmAcknowledge,
	alarmSummary: AlarmSummary,
	atomicReadFile: AtomicReadFile,
	atomicWriteFile: AtomicWriteFile,
	covNotify: CovNotify,
	covNotifyUnconfirmed: CovNotify,
	createObject: CreateObject,
	deleteObject: DeleteObject,
	deviceCommunicationControl: DeviceCommunicationControl,
	error: Error,
	eventInformation: EventInformation,
	eventNotifyData: EventNotifyData,
	getEnrollmentSummary: GetEnrollmentSummary,
	getEventInformation: GetEventInformation,
	iAm: IAm,
	iHave: IHave,
	lifeSafetyOperation: LifeSafetyOperation,
	privateTransfer: PrivateTransfer,
	readProperty: ReadProperty,
	readPropertyMultiple: ReadPropertyMultiple,
	readRange: ReadRange,
	registerForeignDevice: RegisterForeignDevice,
	reinitializeDevice: ReinitializeDevice,
	subscribeCov: SubscribeCov,
	subscribeProperty: SubscribeProperty,
	timeSync: TimeSync,
	timeSyncUTC: TimeSync,
	whoHas: WhoHas,
	whoIs: WhoIs,
	writeProperty: WriteProperty,
	writePropertyMultiple: WritePropertyMultiple,
}
