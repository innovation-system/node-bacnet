import debugModule from 'debug'
import Client from '../../src/lib/client'

/**
 * Utility module for BACnet compliance tests
 */

// Create debug loggers
export const debug = debugModule('bacnet:test:compliance:debug')
export const trace = debugModule('bacnet:test:compliance:trace')

// Import the BACnet client
export const bacnetClient = Client

// Test configuration values
export const deviceUnderTest = 1234
export const maxApdu = 1482
export const vendorId = 260
export const index = 4294967295
export const apduTimeout = 3000
export const clientListenerInterface = '0.0.0.0'
