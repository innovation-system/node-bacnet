# Copilot Instructions for @bacnet-js/client

## Project Overview
This is a **BACnet® protocol stack** written in pure TypeScript for Node.js environments. It implements the ASHRAE 135 standard for building automation and control networks. The library provides a complete client implementation with strong typing, event-driven architecture, and comprehensive protocol support.

## Code Style & Conventions

### TypeScript Standards
- Use **strict TypeScript** with `noImplicitAny`, `strictNullChecks`
- Prefer `interface` over `type` for object definitions
- Use **generic types** extensively for type safety
- Always provide return types for public methods
- Use `readonly` for immutable properties
- Prefer `const assertions` for literal types

### Naming Conventions
- **Files**: camelCase (e.g., `readProperty.ts`, `deviceCommunication.ts`)
- **Classes**: PascalCase (e.g., `BACnetClient`, `Transport`)
- **Interfaces**: PascalCase with descriptive names (e.g., `BACNetObjectID`, `EncodeBuffer`)
- **Enums**: PascalCase with ALL_CAPS values (e.g., `PropertyIdentifier.PRESENT_VALUE`)
- **Constants**: ALL_CAPS with underscores (e.g., `DEFAULT_BACNET_PORT`, `ASN1_ARRAY_ALL`)
- **Private members**: Prefix with underscore (e.g., `_invokeCounter`, `_settings`)

### Imports Organization
```typescript
// 1. Node.js built-ins
import { EventEmitter } from 'events'

// 2. External dependencies  
import debugLib from 'debug'

// 3. Internal lib imports
import Transport from './transport'
import * as baAsn1 from './asn1'

// 4. Types and interfaces
import { BACNetObjectID, EncodeBuffer } from './types'

// 5. Enums
import { PropertyIdentifier, ObjectType } from './enum'
```

## Architecture Patterns

### Event-Driven Design
- Extend `TypedEventEmitter<T>` for type-safe events
- Use specific payload interfaces for each event type
- Emit events for all incoming BACnet services
- Provide both callback and event-based APIs

### Error Handling
- Use `Error` objects with descriptive messages
- Include BACnet error codes when available: `BacnetError - Class:${errorClass} - Code:${errorCode}`
- Handle network timeouts gracefully
- Use debug logging for troubleshooting

### Buffer Management
- Use `EncodeBuffer` interface for encoding operations
- Always track `offset` during encoding/decoding
- Prefer `Buffer.alloc()` over `Buffer.allocUnsafe()`
- Use `buffer.readUIntBE()` and `buffer.writeUIntBE()` for network byte order

## BACnet Protocol Specifics

### Service Implementation
- All services should have `encode` and `decode` methods
- Use the `BacnetService` interface pattern
- Return `Decode<T>` objects with `{ len, value }` structure
- Support both confirmed and unconfirmed variants where applicable

### ASN.1 Encoding
- Use `baAsn1` module functions for standard types
- Context tags: `encodeContextUnsigned`, `encodeContextEnumerated`
- Application tags: `encodeApplicationUnsigned`, `encodeApplicationObjectId`
- Always validate tag numbers and lengths

### Object and Property Handling
- Use enum values from `PropertyIdentifier` and `ObjectType`
- Support array indexing with `ASN1_ARRAY_ALL` as default
- Validate object instances against `ASN1_MAX_INSTANCE`
- Handle priority arrays correctly (1-16, with 0 as no priority)

### Bitstring Operations
- Use typed bitstring classes: `StatusFlagsBitString`, `ServicesSupportedBitString`
- Implement `GenericBitString<E>` pattern for custom bitstrings
- Always validate bits used vs bitstring size
- Use bit positions from corresponding enums

## Type Safety Patterns

### Generic Constraints
```typescript
// Constrain to specific enum types
function encodeProperty<T extends PropertyIdentifier>(
  buffer: EncodeBuffer, 
  property: T
): void

// Use application tag mapping
interface TypedValue<Tag extends ApplicationTag> {
  type: Tag
  value: ApplicationTagValueTypeMap[Tag]
}
```

### Union Types for Protocol Data
```typescript
type BACnetMessage = 
  | ConfirmedServiceRequestMessage
  | UnconfirmedServiceRequestMessage  
  | SimpleAckMessage
  | ComplexAckMessage
```

## Testing Guidelines

### Test Structure
- Use Node.js native test runner
- Test files: `*.spec.ts` in `/test` directory
- Organize by feature: `unit/`, `integration/`, `compliance/`
- Use descriptive test names that explain the scenario

### Mock Data
- Create realistic BACnet packet examples
- Use actual device responses when possible
- Test edge cases like malformed packets
- Include timing-sensitive scenarios

## Performance Considerations

### Network Efficiency
- Reuse UDP sockets where possible
- Implement proper message deduplication
- Use broadcast sparingly
- Support BBMD for large networks

### Memory Management
- Pool buffer allocations for high-frequency operations
- Clean up event listeners and timeouts
- Avoid memory leaks in long-running applications
- Use streaming for large file transfers

## Documentation Standards

### JSDoc Comments
- Document all public methods with `@param` and `@returns`
- Include `@example` for complex APIs
- Reference BACnet standard sections where applicable
- Document error conditions and edge cases

### Code Examples
```typescript
/**
 * Reads a property from a BACnet device
 * @param receiver - Device address (IP:port format)
 * @param objectId - Target object identifier  
 * @param propertyId - Property to read (use PropertyIdentifier enum)
 * @param callback - Result callback with typed response
 * @example
 * client.readProperty(
 *   '192.168.1.100',
 *   { type: ObjectType.ANALOG_INPUT, instance: 1 },
 *   PropertyIdentifier.PRESENT_VALUE,
 *   (err, result) => console.log(result?.values)
 * );
 */
```

## Debugging and Logging

### Debug Namespaces
- Use `debug` library with namespaced loggers
- Pattern: `bacnet:module:level` (e.g., `bacnet:client:debug`)
- Levels: `trace` (verbose), `debug` (normal), `error` (problems only)

### Logging Content
- Log packet hex dumps for protocol debugging
- Include invoke IDs and device addresses
- Trace encoding/decoding operations
- Log timing information for performance analysis

## Dependencies Management

### Production Dependencies
- Keep minimal: only `debug` and `iconv-lite`
- Avoid heavy frameworks or utilities
- Prefer Node.js built-ins when possible

### Development Dependencies
- Use latest stable TypeScript
- ESBuild for fast testing compilation
- TypeDoc for API documentation generation

## Git Workflow & Quality Standards

### Conventional Commits
Follow **Conventional Commits** specification for all commit messages and PR titles:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature implementation
- `fix`: Bug fix  
- `docs`: Documentation changes
- `style`: Code style/formatting (no logic changes)
- `refactor`: Code refactoring (no feature/bug changes)
- `test`: Adding or modifying tests
- `chore`: Build process, dependencies, tooling
- `perf`: Performance improvements
- `ci`: CI/CD configuration changes

**Examples:**
```
feat: add SubscribeCovProperty service implementation
fix: resolve memory leak in invoke callback cleanup  
test: add comprehensive bitstring encoding tests
docs: update installation and usage examples
refactor: simplify UDP socket management
```

**Scopes (when applicable):**
- `client`, `transport`, `services`, `asn1`, `enum`, `types`
- `apdu`, `npdu`, `bvlc` for protocol layers
- Specific service names: `readProperty`, `covNotify`, etc.

### Pull Request Requirements

#### **Linting Compliance** 
- **MUST fix all ESLint errors** before PR approval
- Run `npm run lint:fix` to auto-fix formatting issues
- Zero tolerance for linting violations in merged code
- If auto-fix doesn't resolve issues, **manually fix the code**

#### **Test Coverage Requirements**
- **ALL new code MUST have corresponding tests**
- Existing tests MUST pass (`npm run test:all`)
- **If tests fail, fix the code implementation, not the tests**
- Minimum coverage expectations:
  - New services: Unit tests + integration tests  
  - New utilities: Unit tests with edge cases
  - Bug fixes: Regression tests
  - Protocol changes: Compliance tests

#### **Code Quality Checklist**
Before creating PR, ensure:
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run test:all` passes completely  
- [ ] New functionality has comprehensive tests
- [ ] No `console.log` or debugging code remains
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Documentation updated for public API changes

### Testing Strategy for New Code

#### **Test-First Development**
When implementing new BACnet services:

1. **Write failing tests first** that describe expected behavior
2. **Implement minimal code** to make tests pass
3. **Refactor** while keeping tests green
4. **Add edge case tests** for error conditions

#### **Required Test Types**

**Unit Tests** (`test/unit/`):
```typescript
// Test individual functions in isolation
describe('encodeContextUnsigned', () => {
  it('should encode small values in single byte', () => {
    const buffer = getBuffer()
    encodeContextUnsigned(buffer, 0, 42)
    expect(buffer.buffer[buffer.offset - 2]).toBe(0x08) // context tag
    expect(buffer.buffer[buffer.offset - 1]).toBe(42)   // value
  })
})
```

**Integration Tests** (`test/integration/`):
```typescript  
// Test complete service workflows
describe('ReadProperty Service', () => {
  it('should read present value from analog input', async () => {
    const client = new BACnetClient()
    const result = await readPropertyPromise(
      '192.168.1.100',
      { type: ObjectType.ANALOG_INPUT, instance: 1 },
      PropertyIdentifier.PRESENT_VALUE
    )
    expect(result.values).toHaveLength(1)
    expect(result.values[0].type).toBe(ApplicationTag.REAL)
  })
})
```

**Compliance Tests** (`test/compliance/`):
```typescript
// Test protocol compliance with BACnet standard
describe('ASHRAE 135 Compliance', () => {
  it('should encode object identifier according to 20.2.14', () => {
    const buffer = getBuffer()
    encodeApplicationObjectId(buffer, ObjectType.DEVICE, 123456)
    // Verify exact byte sequence matches standard
    expect(buffer.buffer.slice(0, 6)).toEqual(
      Buffer.from([0xC4, 0x02, 0x00, 0x00, 0x1E, 0x40])
    )
  })
})
```

#### **Coverage Requirements by Component**

- **Core Services** (ReadProperty, WriteProperty, etc.): 95%+ coverage
- **Protocol Encoding/Decoding**: 100% coverage with edge cases  
- **Network Transport**: 90%+ coverage including error conditions
- **Utilities & Helpers**: 85%+ coverage
- **Type Guards & Validators**: 100% coverage

### Continuous Integration Expectations

When Copilot suggests code changes:

1. **Auto-fix linting issues** using ESLint rules
2. **Ensure backward compatibility** for public APIs
3. **Write corresponding tests** for new functionality
4. **Update TypeScript definitions** when adding new types
5. **Verify no breaking changes** in existing test suite

### Code Review Standards

**Before suggesting code, verify:**
- Follows established architecture patterns
- Includes proper error handling  
- Has appropriate logging/debugging
- Maintains type safety throughout
- Includes JSDoc documentation for public APIs
- Follows BACnet protocol specifications exactly

**Red flags that require immediate attention:**
- Failing tests after code changes
- ESLint errors or warnings
- Missing test coverage for new code paths
- Breaking changes without deprecation notices
- Network operations without timeout handling
- Buffer operations without bounds checking

## Common Patterns to Follow

### Service Method Signatures
```typescript
// Pattern for confirmed services
serviceName(
  receiver: AddressParameter,
  ...serviceParams: any[],
  options: ServiceOptions | ErrorCallback,
  next?: ErrorCallback
): void

// Pattern for decode methods  
static decode(
  buffer: Buffer, 
  offset: number, 
  apduLen: number
): DecodeResult | undefined
```

### Error Propagation
```typescript
// Always call callback with error as first parameter
this._addCallback(invokeId, (err, data) => {
  if (err) return callback(err)
  
  const result = ServiceName.decodeAcknowledge(data.buffer, data.offset)
  if (!result) return callback(new Error('INVALID_DECODING'))
  
  callback(null, result)
})
```

## Security Considerations

- Validate all incoming packet data
- Implement rate limiting for broadcast messages  
- Sanitize string inputs for encoding
- Handle malformed packets gracefully
- Support BACnet/SC security features when available

---

*This project implements critical infrastructure protocols. Always prioritize reliability, performance, and standards compliance over convenience features.*