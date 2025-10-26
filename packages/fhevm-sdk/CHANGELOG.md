# Changelog

All notable changes to the @fhevm-sdk package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-27

### 🎉 Major Refactor: Universal FHEVM SDK

Complete rewrite of the SDK to support framework-agnostic architecture with multiple entry points.

### ✨ Added

#### Core Package (`@fhevm-sdk/core`)
- **`createFhevmClient(config)`** - Framework-agnostic FHEVM client
- **`EventEmitter`** - Lightweight event emitter with TypeScript support
- **`createEncryptedInput()`** - Encryption utility with builder pattern
- **`decrypt()`** - Decryption utility with signature management
- **`buildParamsFromAbi()`** - ABI-based parameter building
- **Event-driven architecture** - `ready`, `error`, `statusChange`, `disconnect` events

#### React Package (`@fhevm-sdk/react`)
- **`useFhevm(config)`** - Wagmi-style hook for FHEVM client management
- **`useEncrypt(params)`** - Hook for encryption operations
- **`useDecrypt(params)`** - Hook for decryption with staleness detection
- **Automatic lifecycle management** - Connection, cleanup, and reconnection
- **Request deduplication** - Prevents duplicate decryption requests

#### Storage Package (`@fhevm-sdk/storage`)
- **`GenericStringInMemoryStorage`** - In-memory storage for signatures
- **`StorageAdapter` interface** - Custom storage implementation support

#### Type Definitions (`@fhevm-sdk/types`)
- **`FhevmClientConfig`** - Client configuration interface
- **`FhevmClientStatus`** - Status type with granular states
- **`FhevmClientEvents`** - Type-safe event definitions
- **`EncryptionResult`** - Encryption output type
- **`DecryptionRequest`** - Decryption request type
- **`DecryptionResults`** - Decryption results type

### 🔄 Changed

#### API Improvements
- **Parameter names** - Renamed for clarity:
  - `provider` → `network` (more accurate, accepts string or provider)
  - `initialMockChains` → `mockChains` (shorter, clearer)
  - `refresh()` → `reconnect()` (more explicit)

#### Status Management
- **Granular status updates** - Added intermediate states:
  - `idle`, `connecting`, `sdk-loading`, `sdk-initializing`, `creating-instance`, `ready`, `error`, `disconnected`
- **Event-based status** - Status changes emit events for reactive UI updates

#### Error Handling
- **Type-safe errors** - All errors are properly typed `Error` objects
- **Event-driven errors** - Errors emit via `error` event instead of throws
- **Error isolation** - EventEmitter isolates listener errors

### 🔙 Backward Compatibility

#### Full Compatibility Maintained
- **Old API still works** - All existing code continues to function
- **Parameter aliases** - Old parameter names are automatically mapped:
  - `provider` → `network`
  - `initialMockChains` → `mockChains`
- **Method aliases** - Old method names are supported:
  - `refresh()` → `reconnect()`
- **Import paths** - Old imports still work:
  - `import { useFhevm } from '@fhevm-sdk'` ✅
  - `import { useFhevm } from '@fhevm-sdk/react'` ✅ (new, recommended)

### 🏗️ Architecture

#### Package Structure
```
@fhevm-sdk/
├── core/         → Framework-agnostic (Node.js, Vanilla JS)
├── react/        → React hooks (Wagmi-style)
├── storage/      → Storage utilities
└── types/        → TypeScript types
```

#### Design Patterns
- **Event-driven core** - Works across all frameworks
- **Builder pattern** - Fluent API for encryption
- **Hook-based React** - Composable, reusable hooks
- **Dependency injection** - Storage and config are injectable

### 🐛 Fixed

- **`userDecrypt` signature** - Fixed missing parameters in decryption call (added `contractAddresses`, `userAddress`, `startTimestamp`, `durationDays`)
- **TypeScript constraints** - Fixed EventEmitter generic type constraints
- **Peer dependencies** - Resolved ethers version conflicts (v5 vs v6)
- **Build configuration** - Fixed tsconfig moduleResolution for proper bundler support

### 📚 Documentation

- **Comprehensive README** - Complete API reference with examples
- **Migration guide** - Step-by-step guide for upgrading
- **Code examples** - React, Node.js, and framework-agnostic examples
- **JSDoc coverage** - 100% of public APIs documented

### 🧪 Testing

- **Build verification script** - Automated check for build artifacts
- **Import validation** - Ensures all exports work correctly
- **Type checking** - Strict TypeScript compilation

### ⚡ Performance

- **Tree-shaking support** - Import only what you need
- **Lazy loading** - Instance creation is deferred until needed
- **Memoization** - React hooks use proper memoization
- **Staleness detection** - Prevents race conditions in async operations

### 🔐 Security

- **AbortController** - Proper request cancellation
- **Signature validation** - EIP-712 signature management
- **Error isolation** - Listener errors don't break other listeners

---

## [0.1.0] - 2024-XX-XX

### Initial Release

- Basic FHEVM SDK implementation
- React hooks: `useFhevm`, `useFHEEncryption`, `useFHEDecrypt`
- Storage utilities
- IndexedDB support
- Mock chain configuration

---

## Migration Guide

See [MIGRATION.md](./MIGRATION.md) for detailed upgrade instructions.

## Breaking Changes

**None** - This release maintains full backward compatibility with v0.1.0.

All old APIs continue to work. New APIs are additive and recommended for new code.

---

**Legend:**
- ✨ Added - New features
- 🔄 Changed - Changes to existing functionality
- 🐛 Fixed - Bug fixes
- 🔙 Backward Compatibility - Compatibility notes
- 🏗️ Architecture - Architectural changes
- 📚 Documentation - Documentation changes
- 🧪 Testing - Testing improvements
- ⚡ Performance - Performance improvements
- 🔐 Security - Security improvements
