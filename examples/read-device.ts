/**
 * This script will discover all devices in the network and read out all
 * properties and deliver a JSON as device description
 *
 * If a deviceId is given as first parameter then only this device is discovered
 */

import Bacnet, { BACNetObjectID, BACNetPropertyID, BACNetReadAccessSpecification, DecodeAcknowledgeSingleResult } from '../src/index';
import * as baEnum from '../src/lib/enum';
import * as process from 'process';

// Map the Property types to their enums/bitstrings
const PropertyIdentifierToEnumMap: Record<number, any> = {};
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.OBJECT_TYPE] = baEnum.ObjectType;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.SEGMENTATION_SUPPORTED] = baEnum.Segmentation;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.EVENT_STATE] = baEnum.EventState;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.UNITS] = baEnum.EngineeringUnits;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.RELIABILITY] = baEnum.Reliability;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.NOTIFY_TYPE] = baEnum.NotifyType;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.POLARITY] = baEnum.Polarity;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.PROTOCOL_SERVICES_SUPPORTED] = baEnum.ServicesSupported;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.PROTOCOL_OBJECT_TYPES_SUPPORTED] = baEnum.ObjectTypesSupported;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.STATUS_FLAGS] = baEnum.StatusFlags;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.LIMIT_ENABLE] = baEnum.LimitEnable;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.EVENT_ENABLE] = baEnum.EventTransitionBits;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.ACKED_TRANSITIONS] = baEnum.EventTransitionBits;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.SYSTEM_STATUS] = baEnum.DeviceStatus;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.SYSTEM_STATUS] = baEnum.DeviceStatus;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.ACK_REQUIRED] = baEnum.EventTransitionBits;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.LOGGING_TYPE] = baEnum.LoggingType;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.FILE_ACCESS_METHOD] = baEnum.FileAccessMethod;
PropertyIdentifierToEnumMap[baEnum.PropertyIdentifier.NODE_TYPE] = baEnum.NodeType;

// Sometimes the Map needs to be more specific
const ObjectTypeSpecificPropertyIdentifierToEnumMap: Record<number, Record<number, any>> = {};

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_INPUT] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_INPUT][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.BinaryPV;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_INPUT][baEnum.PropertyIdentifier.MODE] = baEnum.BinaryPV;

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.ANALOG_INPUT] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.ANALOG_INPUT][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.BinaryPV; //????

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.ANALOG_OUTPUT] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.ANALOG_OUTPUT][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.BinaryPV; //????

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_OUTPUT] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_OUTPUT][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.BinaryPV;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_OUTPUT][baEnum.PropertyIdentifier.RELINQUISH_DEFAULT] = baEnum.BinaryPV;

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_VALUE] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_VALUE][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.BinaryPV;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_VALUE][baEnum.PropertyIdentifier.RELINQUISH_DEFAULT] = baEnum.BinaryPV;

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_LIGHTING_OUTPUT] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BINARY_LIGHTING_OUTPUT][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.BinaryLightingPV;

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BITSTRING_VALUE] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.BITSTRING_VALUE][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.BinaryPV; // ???

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_POINT] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_POINT][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.LifeSafetyState;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_POINT][baEnum.PropertyIdentifier.TRACKING_VALUE] = baEnum.LifeSafetyState;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_POINT][baEnum.PropertyIdentifier.MODE] = baEnum.LifeSafetyMode;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_POINT][baEnum.PropertyIdentifier.ACCEPTED_MODES] = baEnum.LifeSafetyMode;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_POINT][baEnum.PropertyIdentifier.SILENCED] = baEnum.LifeSafetyState;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_POINT][baEnum.PropertyIdentifier.OPERATION_EXPECTED] = baEnum.LifeSafetyOperation;

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_ZONE] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_ZONE][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.LifeSafetyState;
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LIFE_SAFETY_ZONE][baEnum.PropertyIdentifier.MODE] = baEnum.LifeSafetyMode;

ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LOAD_CONTROL] = {};
ObjectTypeSpecificPropertyIdentifierToEnumMap[baEnum.ObjectType.LOAD_CONTROL][baEnum.PropertyIdentifier.PRESENT_VALUE] = baEnum.ShedState;

// For Objects we read out All properties if cli parameter --all is provided
const propSubSet = (process.argv.includes('--all')) ? Object.values(baEnum.PropertyIdentifier) : [
  /* normally supported from all devices */
  baEnum.PropertyIdentifier.OBJECT_IDENTIFIER,
  baEnum.PropertyIdentifier.OBJECT_NAME,
  baEnum.PropertyIdentifier.OBJECT_TYPE,
  baEnum.PropertyIdentifier.PRESENT_VALUE,
  baEnum.PropertyIdentifier.STATUS_FLAGS,
  baEnum.PropertyIdentifier.EVENT_STATE,
  baEnum.PropertyIdentifier.RELIABILITY,
  baEnum.PropertyIdentifier.OUT_OF_SERVICE,
  baEnum.PropertyIdentifier.UNITS,
  /* other properties */
  baEnum.PropertyIdentifier.DESCRIPTION,
  baEnum.PropertyIdentifier.SYSTEM_STATUS,
  baEnum.PropertyIdentifier.VENDOR_NAME,
  baEnum.PropertyIdentifier.VENDOR_IDENTIFIER,
  baEnum.PropertyIdentifier.MODEL_NAME,
  baEnum.PropertyIdentifier.FIRMWARE_REVISION,
  baEnum.PropertyIdentifier.APPLICATION_SOFTWARE_VERSION,
  baEnum.PropertyIdentifier.LOCATION,
  baEnum.PropertyIdentifier.LOCAL_DATE,
  baEnum.PropertyIdentifier.LOCAL_TIME,
  baEnum.PropertyIdentifier.UTC_OFFSET,
  baEnum.PropertyIdentifier.DAYLIGHT_SAVINGS_STATUS,
  baEnum.PropertyIdentifier.PROTOCOL_VERSION,
  baEnum.PropertyIdentifier.PROTOCOL_REVISION,
  baEnum.PropertyIdentifier.PROTOCOL_SERVICES_SUPPORTED,
  baEnum.PropertyIdentifier.PROTOCOL_OBJECT_TYPES_SUPPORTED,
  baEnum.PropertyIdentifier.OBJECT_LIST,
  baEnum.PropertyIdentifier.MAX_APDU_LENGTH_ACCEPTED,
  baEnum.PropertyIdentifier.SEGMENTATION_SUPPORTED,
  baEnum.PropertyIdentifier.APDU_TIMEOUT,
  baEnum.PropertyIdentifier.NUMBER_OF_APDU_RETRIES,
  baEnum.PropertyIdentifier.DEVICE_ADDRESS_BINDING,
  baEnum.PropertyIdentifier.DATABASE_REVISION,
  baEnum.PropertyIdentifier.MAX_INFO_FRAMES,
  baEnum.PropertyIdentifier.MAX_MASTER,
  baEnum.PropertyIdentifier.ACTIVE_COV_SUBSCRIPTIONS,
  baEnum.PropertyIdentifier.ACTIVE_COV_MULTIPLE_SUBSCRIPTIONS
];

const debug = process.argv.includes('--debug');

/**
 * Retrieve all properties manually because ReadPropertyMultiple is not available
 * @param address
 * @param objectId
 * @param callback
 * @param propList
 * @param result
 * @returns {*}
 */
function getAllPropertiesManually(
  address: any, 
  objectId: BACNetObjectID, 
  callback: (result: any) => void, 
  propList?: number[], 
  result?: any[]
): void {
  if (!propList) {
    propList = propSubSet.map((x) => x); // Clone the array
  }
  if (!result) {
    result = [];
  }
  if (!propList.length) {
    return callback({
      values: [
        {
          objectId: objectId,
          values: result
        }
      ]
    });
  }

  const prop = propList.shift();
  if (prop === undefined) {
    return getAllPropertiesManually(address, objectId, callback, propList, result);
  }

  // Read only object-list property
  bacnetClient.readProperty(
    address, 
    objectId, 
    prop, 
    {}, // Options object
    (err, value) => {
      if (!err && value) {
        if (debug) {
          console.log('Handle value ' + prop + ': ', JSON.stringify(value));
        }
        const objRes: any = {};
        objRes.id = value.property.id;
        objRes.index = value.property.index;
        objRes.value = value.values;
        result.push(objRes);
      } else {
        // console.log('Device do not contain object ' + baEnum.getEnumName(baEnum.PropertyIdentifier, prop));
      }
      getAllPropertiesManually(address, objectId, callback, propList, result);
    }
  );
}

/**
 * Reads ou one bit out of an buffer
 * @param buffer
 * @param i
 * @param bit
 * @returns {number}
 */
function readBit(buffer: Buffer | number[], i: number, bit: number): number {
  return (buffer[i] >> bit) % 2;
}

/**
 * sets a bit in a buffer
 * @param buffer
 * @param i
 * @param bit
 * @param value
 */
function setBit(buffer: Buffer | number[], i: number, bit: number, value: number): void {
  if (value === 0) {
    buffer[i] &= ~(1 << bit);
  } else {
    buffer[i] |= (1 << bit);
  }
}

/**
 * Parses a Bitstring and returns array with all true values
 * @param buffer
 * @param bitsUsed
 * @param usedEnum
 * @returns {[]}
 */
function handleBitString(buffer: Buffer | number[], bitsUsed: number, usedEnum: any): string[] {
    const res: string[] = [];
    for (let i = 0; i < bitsUsed; i++) {
        const bufferIndex = Math.floor(i / 8);
        if (readBit(buffer, bufferIndex, i % 8)) {
            if (usedEnum) {
                try {
                    const enumName = baEnum.getEnumName(usedEnum, i);
                    if (enumName) {
                        res.push(enumName);
                    } else {
                        res.push(i.toString());
                    }
                } catch (error) {
                    res.push(i.toString());
                }
            } else {
                res.push(i.toString());
            }
        }
    }
    return res;
}

/**
 * Parses a property value
 * @param address
 * @param objId
 * @param parentType
 * @param value
 * @param supportsMultiple
 * @param callback
 */
function parseValue(
  address: any, 
  objId: number, 
  parentType: number, 
  value: any, 
  supportsMultiple: boolean, 
  callback: (result: any) => void
): void {
  let resValue: any = null;
  if (value && value.type && value.value !== null && value.value !== undefined) {
    switch (value.type) {
      case baEnum.ApplicationTag.NULL:
        // should be null already, but set again
        resValue = null;
        break;
      case baEnum.ApplicationTag.BOOLEAN:
        // convert number to a real boolean
        resValue = !!value.value;
        break;
      case baEnum.ApplicationTag.UNSIGNED_INTEGER:
      case baEnum.ApplicationTag.SIGNED_INTEGER:
      case baEnum.ApplicationTag.REAL:
      case baEnum.ApplicationTag.DOUBLE:
      case baEnum.ApplicationTag.CHARACTER_STRING:
        // datatype should be correct already
        resValue = value.value;
        break;
      case baEnum.ApplicationTag.DATE:
      case baEnum.ApplicationTag.TIME:
      case baEnum.ApplicationTag.TIMESTAMP:
        // datatype should be Date too
        // Javascript do not have date/timestamp only
        resValue = value.value;
        break;
      case baEnum.ApplicationTag.BIT_STRING:
        // handle bitstrings specific and more generic
        if (ObjectTypeSpecificPropertyIdentifierToEnumMap[parentType] && ObjectTypeSpecificPropertyIdentifierToEnumMap[parentType][objId]) {
          resValue = handleBitString(value.value.value, value.value.bitsUsed, ObjectTypeSpecificPropertyIdentifierToEnumMap[parentType][objId]);
        } else if (PropertyIdentifierToEnumMap[objId]) {
          resValue = handleBitString(value.value.value, value.value.bitsUsed, PropertyIdentifierToEnumMap[objId]);
        } else {
          if (parentType !== baEnum.ObjectType.BITSTRING_VALUE) {
            console.log('Unknown value for BIT_STRING type for objId ' + baEnum.getEnumName(baEnum.PropertyIdentifier, objId) + ' and parent type ' + baEnum.getEnumName(baEnum.ObjectType, parentType));
          }
          resValue = value.value;
        }
        break;
      case baEnum.ApplicationTag.ENUMERATED:
        // handle enumerations specific and more generic
        if (ObjectTypeSpecificPropertyIdentifierToEnumMap[parentType] && ObjectTypeSpecificPropertyIdentifierToEnumMap[parentType][objId]) {
          resValue = baEnum.getEnumName(ObjectTypeSpecificPropertyIdentifierToEnumMap[parentType][objId], value.value);
        } else if (PropertyIdentifierToEnumMap[objId]) {
          resValue = baEnum.getEnumName(PropertyIdentifierToEnumMap[objId], value.value);
        } else {
          console.log('Unknown value for ENUMERATED type for objId ' + baEnum.getEnumName(baEnum.PropertyIdentifier, objId) + ' and parent type ' + baEnum.getEnumName(baEnum.ObjectType, parentType));
          resValue = value.value;
        }
        break;
      case baEnum.ApplicationTag.OBJECTIDENTIFIER:
        // Look up object identifiers
        // Some object identifiers should not be looked up because we end in loops else
        if (objId === baEnum.PropertyIdentifier.OBJECT_IDENTIFIER || objId === baEnum.PropertyIdentifier.STRUCTURED_OBJECT_LIST || objId === baEnum.PropertyIdentifier.SUBORDINATE_LIST) {
          resValue = value.value;
        } else if (supportsMultiple) {
          const requestArray = [{
            objectId: value.value,
            properties: [{id: 8, index: 0}]
          }];
          bacnetClient.readPropertyMultiple(address, requestArray, (err, resValue) => {
            //console.log(JSON.stringify(value.value) + ': ' + JSON.stringify(resValue));
            parseDeviceObject(address, resValue, value.value, true, callback);
          });
          return;
        } else {
          getAllPropertiesManually(address, value.value, result => {
            parseDeviceObject(address, result, value.value, false, callback);
          });
          return;
        }
        break;
      case baEnum.ApplicationTag.OCTET_STRING:
        // It is kind of binary data??
        resValue = value.value;
        break;
      case baEnum.ApplicationTag.ERROR:
        // lookup error class and code
        resValue = {
          errorClass: baEnum.getEnumName(baEnum.ErrorClass, value.value.errorClass),
          errorCode: baEnum.getEnumName(baEnum.ErrorCode, value.value.errorCode)
        };
        break;
      case baEnum.ApplicationTag.OBJECT_PROPERTY_REFERENCE:
      case baEnum.ApplicationTag.DEVICE_OBJECT_PROPERTY_REFERENCE:
      case baEnum.ApplicationTag.DEVICE_OBJECT_REFERENCE:
      case baEnum.ApplicationTag.READ_ACCESS_SPECIFICATION: //???
        resValue = value.value;
        break;
      case baEnum.ApplicationTag.CONTEXT_SPECIFIC_DECODED:
        parseValue(address, objId, parentType, value.value, supportsMultiple, callback);
        return;
      case baEnum.ApplicationTag.READ_ACCESS_RESULT: // ????
        resValue = value.value;
        break;
      default:
        console.log('unknown type ' + value.type + ': ' + JSON.stringify(value));
        resValue = value;
    }
  }

  setImmediate(() => callback(resValue));
}

/**
 * Parse an object structure
 * @param address
 * @param obj
 * @param parent
 * @param supportsMultiple
 * @param callback
 */
function parseDeviceObject(
    address: any, 
    obj: any, 
    parent: BACNetObjectID, 
    supportsMultiple: boolean, 
    callback: (result: any) => void
  ): void {
    if (debug) {
      console.log('START parseDeviceObject: ' + JSON.stringify(parent) + ' : ' + JSON.stringify(obj));
    }
  
    if(!obj) {
      console.log('object not valid on parse device object');
      return;
    }
  
    if (!obj.values || !Array.isArray(obj.values)) {
      console.log('No device or invalid response');
      callback({'ERROR': 'No device or invalid response'});
      return;
    }
  
    let cbCount = 0;
    const objDefMap = new Map<string, Map<string, any[]>>();
  
    const finalize = () => {
      const resultObj: Record<string, Record<string, any>> = {};
      
      objDefMap.forEach((propMap, devIdKey) => {
        const deviceObj: Record<string, any> = {};
        resultObj[devIdKey] = deviceObj;
        
        propMap.forEach((valueArray, propIdKey) => {
          deviceObj[propIdKey] = valueArray.length === 1 ? valueArray[0] : valueArray;
        });
      });
      
      if (obj.values.length === 1 && obj.values[0]?.objectId?.instance !== undefined) {
        const firstDeviceId = String(obj.values[0].objectId.instance);
        if (resultObj[firstDeviceId]) {
          if (debug) {
            console.log('END parseDeviceObject (single device): ' + JSON.stringify(parent) + ' : ' + JSON.stringify(resultObj[firstDeviceId]));
          }
          callback(resultObj[firstDeviceId]);
          return;
        }
      }
      
      if (debug) {
        console.log('END parseDeviceObject (multiple devices): ' + JSON.stringify(parent) + ' : ' + JSON.stringify(resultObj));
      }
      callback(resultObj);
    };
  
    obj.values.forEach((devBaseObj: any) => {
      if (!devBaseObj.objectId) {
        console.log('No device Id found in object data');
        return;
      }
      
      if (devBaseObj.objectId.type === undefined || devBaseObj.objectId.instance === undefined) {
        console.log('No device type or instance found in object data');
        return;
      }
      
      if (!devBaseObj.values || !Array.isArray(devBaseObj.values)) {
        console.log('No device values response');
        return;
      }
      
      const deviceId = String(devBaseObj.objectId.instance);
      
      let deviceMap = objDefMap.get(deviceId);
      if (!deviceMap) {
        deviceMap = new Map<string, any[]>();
        objDefMap.set(deviceId, deviceMap);
      }
      
      devBaseObj.values.forEach((devObj: any) => {
        if (devObj.id === undefined) {
          return;
        }
        
        let objId = baEnum.getEnumName(baEnum.PropertyIdentifier, devObj.id);
        if (objId && devObj.index !== 4294967295) {
          objId += '-' + devObj.index;
        }
        
        if (!objId) {
          console.log('Invalid property identifier:', devObj.id);
          return;
        }
        
        if (debug) {
          console.log('Handle Object property:', deviceId, objId, devObj.value);
        }
        
        if (!Array.isArray(devObj.value)) {
          console.log('Device object value is not an array:', devObj);
          return;
        }
        
        devObj.value.forEach((val: any) => {
          let propArray = deviceMap.get(objId);
          if (!propArray) {
            propArray = [];
            deviceMap.set(objId, propArray);
          }
          
          if (JSON.stringify(val.value) === JSON.stringify(parent)) {
            propArray.push(val.value);
            return;
          }
          
          cbCount++;
          parseValue(address, devObj.id, parent.type, val, supportsMultiple, parsedValue => {
            if (debug) {
              console.log('RETURN parsedValue', deviceId, objId, devObj.value, parsedValue);
            }
            
            let deviceMapInCallback = objDefMap.get(deviceId);
            if (!deviceMapInCallback) {
              deviceMapInCallback = new Map<string, any[]>();
              objDefMap.set(deviceId, deviceMapInCallback);
            }
            
            let propArrayInCallback = deviceMapInCallback.get(objId);
            if (!propArrayInCallback) {
              propArrayInCallback = [];
              deviceMapInCallback.set(objId, propArrayInCallback);
            }
            
            propArrayInCallback.push(parsedValue);
            if (!--cbCount) {
              finalize();
            }
          });
        });
      });
    });
    
    if (cbCount === 0) {
      finalize();
    }
  }

let objectsDone = 0;
/**
 * Print result info object
 * @param deviceId
 * @param obj
 */
function printResultObject(deviceId: number, obj: any): void {
  objectsDone++;
  console.log(`Device ${deviceId} (${objectsDone}/${Object.keys(knownDevices).length}) read successfully ...`);
  console.log(JSON.stringify(obj));
  console.log();
  console.log();

  if (objectsDone === Object.keys(knownDevices).length) {
    setTimeout(() => {
      bacnetClient.close();
      console.log('closed transport ' + Date.now());
    }, 1000);
  }
}

let limitToDevice: number | null = null;
if (process.argv.length === 3) {
  limitToDevice = parseInt(process.argv[2]);
  if (isNaN(limitToDevice)) {
    limitToDevice = null;
  }
}

// create instance of Bacnet
const bacnetClient = new Bacnet({apduTimeout: 4000, interface: '0.0.0.0'});

// emitted for each new message
bacnetClient.on('message', (msg: any, rinfo: any) => {
  console.log(msg);
  if (rinfo) console.log(rinfo);
});

// emitted on errors
bacnetClient.on('error', (err: Error) => {
  console.error(err);
  bacnetClient.close();
});

// emmitted when Bacnet server listens for incoming UDP packages
bacnetClient.on('listening', () => {
  console.log('sent whoIs ' + Date.now());
  // discover devices once we are listening
  bacnetClient.whoIs();
});

const knownDevices: number[] = [];

// emitted when a new device is discovered in the network
bacnetClient.on('iAm', (device: any) => {
  // Make sure device has the expected structure
  if (!device.header || !device.payload) {
    console.log('Received invalid device information');
    return;
  }
  
  // address object of discovered device,
  // just use in subsequent calls that are directed to this device
  const address = device.header.sender;

  //discovered device ID
  const deviceId = device.payload.deviceId;
  if (knownDevices.includes(deviceId)) return;
  if (limitToDevice !== null && limitToDevice !== deviceId) return;

  console.log('Found Device ' + deviceId + ' on ' + JSON.stringify(address));
  knownDevices.push(deviceId);

  const propertyList: BACNetPropertyID[] = [];
  propSubSet.forEach(item => {
    propertyList.push({id: item, index: 4294967295});
  });

  const requestArray: BACNetReadAccessSpecification[] = [{
    objectId: {type: 8, instance: deviceId},
    properties: propertyList
  }];

  bacnetClient.readPropertyMultiple(address, requestArray, (err, value) => {
    if (err) {
      console.log(deviceId, 'No ReadPropertyMultiple supported:', err.message);
      getAllPropertiesManually(address, {type: 8, instance: deviceId}, result => {
        parseDeviceObject(address, result, {type: 8, instance: deviceId}, false, res => printResultObject(deviceId, res));
      });
    } else {
      console.log(deviceId, 'ReadPropertyMultiple supported ...');
      parseDeviceObject(address, value, {type: 8, instance: deviceId}, true, res => printResultObject(deviceId, res));
    }
  });
});