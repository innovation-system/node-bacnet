import Client from '../src/lib/client'
import * as baEnum from '../src/lib/enum'
import debugLib from 'debug'

const debug = debugLib('bacstack-device')

interface DataStore {
	[key: string]: {
		[propertyId: number]: any[]
	}
}

const settings = {
	deviceId: 443,
	vendorId: 7,
}

const client = new Client()

const dataStore: DataStore = {
	'1:0': {
		75: [{ value: { type: 1, instance: 0 }, type: 12 }], // PROP_OBJECT_IDENTIFIER
		77: [{ value: 'Analog Output 1', type: 7 }], // PROP_OBJECT_NAME
		79: [{ value: 1, type: 9 }], // PROP_OBJECT_TYPE
		85: [{ value: 5, type: 4 }], // PROP_PRESENT_VALUE
	},
	'8:443': {
		75: [{ value: { type: 8, instance: 443 }, type: 12 }], // PROP_OBJECT_IDENTIFIER
		76: [
			{ value: { type: 8, instance: 443 }, type: 12 },
			{ value: { type: 1, instance: 0 }, type: 12 },
		], // PROP_OBJECT_LIST
		77: [{ value: 'my-device-443', type: 7 }], // PROP_OBJECT_NAME
		79: [{ value: 8, type: 9 }], // PROP_OBJECT_TYPE
		28: [{ value: 'Test Device #443', type: 7 }], // PROP_DESCRIPTION
	},
}

client.on('whoIs', (data: any) => {
	debug('whoIs request', data)
	try {
		const payload = data.payload || {}

		if (payload.lowLimit && payload.lowLimit > settings.deviceId) return
		if (payload.highLimit && payload.highLimit < settings.deviceId) return

		client.iAmResponse(
			data.header?.sender || null,
			settings.deviceId,
			baEnum.Segmentation.SEGMENTED_BOTH,
			settings.vendorId,
		)
	} catch (error) {
		debug('Error handling whoIs request', error)
	}
})

client.on('readProperty', (data: any) => {
	debug('readProperty request', data)
	try {
		const payload = data.payload || {}
		const sender = data.header?.sender
		const invokeId = data.invokeId || payload.invokeId
		const objectId = payload.objectId
		const property = payload.property

		if (!sender || invokeId === undefined || !objectId || !property) {
			debug('Missing required properties', {
				sender,
				invokeId,
				objectId,
				property,
			})
			return
		}

		const objectKey = `${objectId.type}:${objectId.instance}`
		const object = dataStore[objectKey]

		if (!object) {
			debug('Object not found', objectKey)
			return client.errorResponse(
				sender,
				baEnum.ConfirmedServiceChoice.READ_PROPERTY,
				invokeId,
				baEnum.ErrorClass.OBJECT,
				baEnum.ErrorCode.UNKNOWN_OBJECT,
			)
		}

		const propertyValue = object[property.id]
		if (!propertyValue) {
			debug('Property not found', property.id)
			return client.errorResponse(
				sender,
				baEnum.ConfirmedServiceChoice.READ_PROPERTY,
				invokeId,
				baEnum.ErrorClass.PROPERTY,
				baEnum.ErrorCode.UNKNOWN_PROPERTY,
			)
		}

		if (property.index === 0xffffffff) {
			client.readPropertyResponse(
				sender,
				invokeId,
				objectId,
				property,
				propertyValue,
			)
		} else {
			const slot = propertyValue[property.index]
			if (!slot) {
				debug('Property index not found', property.index)
				return client.errorResponse(
					sender,
					baEnum.ConfirmedServiceChoice.READ_PROPERTY,
					invokeId,
					baEnum.ErrorClass.PROPERTY,
					baEnum.ErrorCode.INVALID_ARRAY_INDEX,
				)
			}

			client.readPropertyResponse(sender, invokeId, objectId, property, [
				slot,
			])
		}
	} catch (error) {
		debug('Error handling readProperty request', error)
	}
})

client.on('writeProperty', (data: any) => {
	debug('writeProperty request', data)
	try {
		const payload = data.payload || {}
		const sender = data.header?.sender
		const invokeId = data.invokeId || payload.invokeId
		const objectId = payload.objectId
		const property = payload.property
		const value = payload.value

		if (
			!sender ||
			invokeId === undefined ||
			!objectId ||
			!property ||
			value === undefined
		) {
			debug('Missing required properties', {
				sender,
				invokeId,
				objectId,
				property,
				value,
			})
			return
		}

		const objectKey = `${objectId.type}:${objectId.instance}`
		const object = dataStore[objectKey]

		if (!object) {
			debug('Object not found', objectKey)
			return client.errorResponse(
				sender,
				baEnum.ConfirmedServiceChoice.WRITE_PROPERTY,
				invokeId,
				baEnum.ErrorClass.OBJECT,
				baEnum.ErrorCode.UNKNOWN_OBJECT,
			)
		}

		const propertyValue = object[property.id]
		if (!propertyValue) {
			debug('Property not found', property.id)
			return client.errorResponse(
				sender,
				baEnum.ConfirmedServiceChoice.WRITE_PROPERTY,
				invokeId,
				baEnum.ErrorClass.PROPERTY,
				baEnum.ErrorCode.UNKNOWN_PROPERTY,
			)
		}

		if (property.index === 0xffffffff) {
			object[property.id] = value
			client.simpleAckResponse(
				sender,
				baEnum.ConfirmedServiceChoice.WRITE_PROPERTY,
				invokeId,
			)
		} else {
			if (!propertyValue[property.index]) {
				debug('Property index not found', property.index)
				return client.errorResponse(
					sender,
					baEnum.ConfirmedServiceChoice.WRITE_PROPERTY,
					invokeId,
					baEnum.ErrorClass.PROPERTY,
					baEnum.ErrorCode.INVALID_ARRAY_INDEX,
				)
			}

			propertyValue[property.index] = Array.isArray(value)
				? value[0]
				: value
			client.simpleAckResponse(
				sender,
				baEnum.ConfirmedServiceChoice.WRITE_PROPERTY,
				invokeId,
			)
		}
	} catch (error) {
		debug('Error handling writeProperty request', error)
	}
})

client.on('whoHas', (data: any) => {
	debug('whoHas request', data)
	try {
		const payload = data.payload || {}
		const sender = data.header?.sender

		if (payload.lowLimit && payload.lowLimit > settings.deviceId) return
		if (payload.highLimit && payload.highLimit < settings.deviceId) return

		if (payload.objectId) {
			const objectKey = `${payload.objectId.type}:${payload.objectId.instance}`
			const object = dataStore[objectKey]

			if (!object) {
				debug('Object not found', objectKey)
				return
			}

			client.iHaveResponse(
				sender || null,
				{ type: 8, instance: settings.deviceId },
				{
					type: payload.objectId.type,
					instance: payload.objectId.instance,
				},
				object[77][0].value,
			)
		}

		if (payload.objectName) {
			// TODO: Implement search by object name
			client.iHaveResponse(
				sender || null,
				{ type: 8, instance: settings.deviceId },
				{ type: 1, instance: 1 },
				'test',
			)
		}
	} catch (error) {
		debug('Error handling whoHas request', error)
	}
})

client.on('timeSync', (data: any) => {
	debug('timeSync request', data)
	// TODO: Implement time synchronization
})

client.on('timeSyncUTC', (data: any) => {
	debug('timeSyncUTC request', data)
	// TODO: Implement UTC time synchronization
})

client.on('readPropertyMultiple', (data: any) => {
	debug('readPropertyMultiple request', data)
	try {
		const payload = data.payload || {}
		const sender = data.header?.sender
		const invokeId = data.invokeId || payload.invokeId
		const properties = payload.properties

		if (!sender || invokeId === undefined || !Array.isArray(properties)) {
			debug('Missing required properties', {
				sender,
				invokeId,
				propertiesIsArray: Array.isArray(properties),
			})
			return
		}

		const responseList = []

		for (const property of properties) {
			if (!property.objectId) {
				debug('Missing objectId in property', property)
				continue
			}

			if (
				property.objectId.type === baEnum.ObjectType.DEVICE &&
				property.objectId.instance === 4194303
			) {
				property.objectId.instance = settings.deviceId
			}

			const objectKey = `${property.objectId.type}:${property.objectId.instance}`
			const object = dataStore[objectKey]

			if (!object) {
				debug('Object not found', objectKey)
				continue
			}

			if (!Array.isArray(property.properties)) {
				debug('Missing properties array in property', property)
				continue
			}

			const propList = []

			for (const item of property.properties) {
				if (!item || item.id === undefined) {
					debug('Invalid property item', item)
					continue
				}

				if (item.id === baEnum.PropertyIdentifier.ALL) {
					for (const key in object) {
						if (Object.prototype.hasOwnProperty.call(object, key)) {
							propList.push({
								property: {
									id: parseInt(key),
									index: 0xffffffff,
								},
								value: object[key],
							})
						}
					}
					continue
				}

				const prop = object[item.id]
				if (!prop) {
					debug('Property not found', item.id)
					continue
				}

				let content
				if (item.index === 0xffffffff) {
					content = prop
				} else {
					const slot = prop[item.index]
					if (!slot) {
						debug('Property index not found', item.index)
						continue
					}
					content = [slot]
				}

				propList.push({
					property: { id: item.id, index: item.index },
					value: content,
				})
			}

			responseList.push({
				objectId: {
					type: property.objectId.type,
					instance: property.objectId.instance,
				},
				values: propList,
			})
		}

		client.readPropertyMultipleResponse(
			sender.address,
			invokeId,
			responseList,
		)
	} catch (error) {
		debug('Error handling readPropertyMultiple request', error)
	}
})

const otherServices = [
	'writePropertyMultiple',
	'atomicWriteFile',
	'atomicReadFile',
	'subscribeCOV',
	'subscribeProperty',
	'deviceCommunicationControl',
	'reinitializeDevice',
	'readRange',
	'createObject',
	'deleteObject',
]

// Register stub handlers for other services
otherServices.forEach((service) => {
	client.on(service as any, (data: any) => {
		debug(`${service} request`, data)
	})
})

console.log('Node BACstack Device started')
