# @fhevm-sdk

> Universal FHEVM SDK - Framework-agnostic toolkit for building confidential dApps with Fully Homomorphic Encryption

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue)]()
[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue)]()

## 🚀 Features

- **🎯 10 Lines of Code** - Get started with FHEVM in just 10 lines
- **🔄 Framework Agnostic** - Core SDK works with any JavaScript framework
- **⚛️ React Hooks** - Wagmi-style hooks for React applications
- **🎭 Vue Composables** - Vue 3 Composition API support
- **📦 Zero Config** - Works out of the box with sensible defaults
- **🔐 Type Safe** - Full TypeScript support with comprehensive types
- **🌐 Universal** - Supports browser and Node.js environments
- **🔌 Modular** - Import only what you need via multiple entry points
- **🔙 Backward Compatible** - Works with existing FHEVM applications

## 📦 Installation

```bash
# Using pnpm (recommended)
pnpm add @fhevm-sdk

# Using npm
npm install @fhevm-sdk

# Using yarn
yarn add @fhevm-sdk
```

## 🎯 Quick Start (React)

Get up and running in **10 lines of code**:

```typescript
import { useFhevm, useEncrypt } from '@fhevm-sdk/react';

function MyDApp() {
  // 1. Connect to FHEVM
  const { instance, status } = useFhevm({
    network: window.ethereum,
    chainId: 31337,
  });

  // 2. Setup encryption
  const { encrypt, canEncrypt } = useEncrypt({
    instance,
    signer: mySigner,
    contractAddress: '0x123...',
  });

  // 3. Encrypt and use!
  const handleEncrypt = async () => {
    const encrypted = await encrypt((input) => {
      input.add64(42); // Encrypt the number 42
    });
  };

  return <div>Status: {status}</div>;
}
```

## 📚 Documentation

### Architecture

The SDK is organized into multiple entry points for optimal tree-shaking:

```
@fhevm-sdk
├── /core      → Framework-agnostic (Node.js, Vanilla JS)
├── /react     → React hooks (Wagmi-style)
├── /vue       → Vue composables (Composition API)
├── /storage   → Storage utilities
└── /types     → TypeScript types
```

### Core API (Framework Agnostic)

Perfect for **Node.js**, **Vanilla JavaScript**, or **custom framework integrations**:

```typescript
import { createFhevmClient } from '@fhevm-sdk/core';

// Create client
const client = createFhevmClient({
  network: 'http://localhost:8545',
  chainId: 31337,
  mockChains: { 31337: 'http://localhost:8545' },
  debug: true,
});

// Listen to events
client.on('ready', (instance) => {
  console.log('FHEVM ready!', instance);
});

client.on('error', (error) => {
  console.error('FHEVM error:', error);
});

// Connect
await client.connect();
```

#### Core API Reference

**`createFhevmClient(config)`**

Creates a new FHEVM client instance.

```typescript
interface FhevmClientConfig {
  network: string | Eip1193Provider;  // RPC URL or EIP-1193 provider
  chainId?: number;                   // Chain ID (auto-detected if not provided)
  mockChains?: Record<number, string>; // Mock chains for local development
  storage?: StorageAdapter;           // Custom storage adapter
  debug?: boolean;                    // Enable debug logging
}
```

**Events:**
- `statusChange(status)` - Status updates during connection
- `ready(instance)` - FHEVM instance is ready
- `error(error)` - Error occurred
- `disconnect()` - Client disconnected

**Methods:**
- `connect()` - Connect and initialize FHEVM
- `disconnect()` - Disconnect and cleanup
- `reconnect()` - Reconnect (disconnect + connect)

**Encryption Utilities:**

```typescript
import { createEncryptedInput, buildParamsFromAbi } from '@fhevm-sdk/core';

// Create encrypted input
const encrypted = await createEncryptedInput(
  instance,
  contractAddress,
  userAddress,
  (input) => {
    input.add64(42);
    input.add32(100);
  }
);

// Build contract params from ABI
const params = buildParamsFromAbi(encrypted, contractAbi, 'myFunction');
```

**Decryption Utilities:**

```typescript
import { decrypt, hasValidSignature } from '@fhevm-sdk/core';

// Decrypt values
const results = await decrypt(
  instance,
  [
    { handle: '0xabc...', contractAddress: '0x123...' },
    { handle: '0xdef...', contractAddress: '0x123...' },
  ],
  signer,
  storage
);

console.log(results); // { '0xabc...': 42n, '0xdef...': 100n }
```

### React API (Hooks)

#### `useFhevm(config)`

Main hook for FHEVM client management. Handles connection lifecycle automatically.

```typescript
import { useFhevm } from '@fhevm-sdk/react';

function MyComponent() {
  const { instance, status, error, reconnect } = useFhevm({
    network: window.ethereum,
    chainId: 31337,
    mockChains: { 31337: 'http://localhost:8545' },
    debug: true,
  });

  if (status === 'error') {
    return <div>Error: {error?.message}</div>;
  }

  if (status !== 'ready') {
    return <div>Connecting... {status}</div>;
  }

  return <div>Connected! Instance ready.</div>;
}
```

**Status values:**
- `idle` - Not started
- `connecting` - Connecting to network
- `sdk-loading` - Loading FHE SDK
- `sdk-initializing` - Initializing SDK
- `creating-instance` - Creating FHEVM instance
- `ready` - Ready to use
- `error` - Error occurred
- `disconnected` - Disconnected

#### `useEncrypt(params)`

Hook for encryption operations with builder pattern.

```typescript
import { useEncrypt } from '@fhevm-sdk/react';

function EncryptionComponent() {
  const { encrypt, canEncrypt } = useEncrypt({
    instance,
    signer,
    contractAddress: '0x123...',
  });

  const handleEncrypt = async () => {
    if (!canEncrypt) return;

    const encrypted = await encrypt((input) => {
      input.add64(42);        // uint64
      input.add32(100);       // uint32
      input.addBool(true);    // bool
      input.addAddress('0x...'); // address
    });

    // Use encrypted.handles and encrypted.inputProof
    await myContract.myFunction(encrypted.handles, encrypted.inputProof);
  };

  return (
    <button onClick={handleEncrypt} disabled={!canEncrypt}>
      Encrypt
    </button>
  );
}
```

#### `useDecrypt(params)`

Hook for decryption with automatic signature management and staleness detection.

```typescript
import { useDecrypt } from '@fhevm-sdk/react';

function DecryptionComponent() {
  const {
    decrypt,
    canDecrypt,
    isDecrypting,
    results,
    message,
    error
  } = useDecrypt({
    instance,
    signer,
    requests: [
      { handle: '0xabc...', contractAddress: '0x123...' },
      { handle: '0xdef...', contractAddress: '0x456...' },
    ],
    storage,
  });

  const handleDecrypt = async () => {
    await decrypt();
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={!canDecrypt}>
        {isDecrypting ? 'Decrypting...' : 'Decrypt'}
      </button>
      {results && (
        <div>
          Result: {results['0xabc...']?.toString()}
        </div>
      )}
      {message && <p>{message}</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Vue API (Composables)

The Vue API provides composables for Vue 3's Composition API, mirroring the React hooks functionality.

#### `useFhevm(config)`

Main composable for FHEVM client management with automatic lifecycle handling.

```vue
<script setup>
import { useFhevm } from '@fhevm-sdk/vue';

const { instance, status, error, reconnect } = useFhevm({
  network: window.ethereum,
  chainId: 31337,
  mockChains: { 31337: 'http://localhost:8545' },
  debug: true,
});
</script>

<template>
  <div v-if="status === 'error'">
    Error: {{ error?.message }}
  </div>
  <div v-else-if="status !== 'ready'">
    Connecting... {{ status }}
  </div>
  <div v-else>
    Connected! Instance ready.
  </div>
</template>
```

**Status values:** Same as React API (idle, connecting, ready, error, etc.)

#### `useEncrypt(params)`

Composable for encryption operations with builder pattern.

```vue
<script setup>
import { useEncrypt } from '@fhevm-sdk/vue';
import { ref } from 'vue';

const props = defineProps(['instance', 'signer', 'contractAddress']);

const { encrypt, canEncrypt } = useEncrypt({
  instance: props.instance,
  signer: props.signer,
  contractAddress: props.contractAddress,
});

const handleEncrypt = async () => {
  if (!canEncrypt.value) return;

  const encrypted = await encrypt((input) => {
    input.add64(42);
    input.add32(100);
    input.addBool(true);
  });

  // Use encrypted.handles and encrypted.inputProof
  await myContract.myFunction(encrypted.handles, encrypted.inputProof);
};
</script>

<template>
  <button @click="handleEncrypt" :disabled="!canEncrypt">
    Encrypt
  </button>
</template>
```

#### `useDecrypt(params)`

Composable for decryption with automatic signature management.

```vue
<script setup>
import { useDecrypt } from '@fhevm-sdk/vue';
import { ref } from 'vue';

const props = defineProps(['instance', 'signer', 'storage']);

const requests = ref([
  { handle: '0xabc...', contractAddress: '0x123...' },
  { handle: '0xdef...', contractAddress: '0x456...' },
]);

const {
  decrypt,
  canDecrypt,
  isDecrypting,
  results,
  message,
  error
} = useDecrypt({
  instance: props.instance,
  signer: props.signer,
  requests,
  storage: props.storage,
});

const handleDecrypt = async () => {
  await decrypt();
};
</script>

<template>
  <div>
    <button @click="handleDecrypt" :disabled="!canDecrypt">
      {{ isDecrypting ? 'Decrypting...' : 'Decrypt' }}
    </button>
    <div v-if="results">
      Result: {{ results['0xabc...']?.toString() }}
    </div>
    <p v-if="message">{{ message }}</p>
    <p v-if="error">Error: {{ error }}</p>
  </div>
</template>
```

### Storage API

```typescript
import { GenericStringInMemoryStorage } from '@fhevm-sdk/storage';

// In-memory storage (for testing)
const storage = new GenericStringInMemoryStorage();

// Custom storage adapter
const customStorage = {
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  },
};
```

## 🔄 Migration from Old API

The SDK maintains **full backward compatibility**. Your existing code will continue to work:

```typescript
// Old API (still works!)
import { useFhevm } from '@fhevm-sdk';

const { instance, status, refresh } = useFhevm({
  provider: window.ethereum,        // ← Old parameter name
  initialMockChains: { ... },       // ← Old parameter name
  enabled: true,
});
```

**New API** (recommended):

```typescript
import { useFhevm } from '@fhevm-sdk/react';

const { instance, status, reconnect } = useFhevm({
  network: window.ethereum,         // ← New parameter name
  mockChains: { ... },              // ← New parameter name
});
```

See [MIGRATION.md](./MIGRATION.md) for detailed migration guide.

## 🏗️ Examples

### Complete React Example

```typescript
import { useFhevm, useEncrypt, useDecrypt } from '@fhevm-sdk/react';
import { useEthersSigner } from './hooks/useEthersSigner';
import { useInMemoryStorage } from '@fhevm-sdk/react';

function FHECounter() {
  // FHEVM instance
  const { instance, status } = useFhevm({
    network: window.ethereum,
    chainId: 31337,
  });

  // Get signer
  const signer = useEthersSigner();

  // Storage for signatures
  const storage = useInMemoryStorage();

  // Encryption
  const { encrypt, canEncrypt } = useEncrypt({
    instance,
    signer,
    contractAddress: CONTRACT_ADDRESS,
  });

  // Decryption
  const { decrypt, canDecrypt, results } = useDecrypt({
    instance,
    signer,
    requests: [{ handle: countHandle, contractAddress: CONTRACT_ADDRESS }],
    storage,
  });

  const handleIncrement = async () => {
    const encrypted = await encrypt((input) => input.add64(1));
    await contract.increment(encrypted.handles[0], encrypted.inputProof);
  };

  const handleDecrypt = async () => {
    await decrypt();
  };

  return (
    <div>
      <h1>FHE Counter</h1>
      <p>Status: {status}</p>
      <button onClick={handleIncrement} disabled={!canEncrypt}>
        Increment
      </button>
      <button onClick={handleDecrypt} disabled={!canDecrypt}>
        Decrypt
      </button>
      {results && <p>Count: {results[countHandle]?.toString()}</p>}
    </div>
  );
}
```

### Node.js Example

```typescript
import { createFhevmClient, createEncryptedInput } from '@fhevm-sdk/core';
import { JsonRpcProvider } from 'ethers';

// Setup
const provider = new JsonRpcProvider('http://localhost:8545');
const client = createFhevmClient({
  network: provider,
  chainId: 31337,
});

// Wait for ready
await new Promise((resolve) => {
  client.on('ready', resolve);
  client.connect();
});

// Encrypt
const encrypted = await createEncryptedInput(
  client.instance!,
  '0x123...',
  '0xuser...',
  (input) => input.add64(42)
);

console.log('Encrypted:', encrypted);
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test --coverage

# Verify build artifacts
pnpm build && node test-imports.mjs
```

## 🏗️ Building

```bash
# Build the SDK
pnpm build

# Watch mode
pnpm watch

# Clean build
pnpm clean && pnpm build
```

## 📖 API Reference

### Types

All TypeScript types are exported from `@fhevm-sdk/types`:

```typescript
import type {
  FhevmInstance,
  FhevmClientConfig,
  FhevmClientStatus,
  EncryptionResult,
  DecryptionRequest,
  DecryptionResults,
  StorageAdapter,
} from '@fhevm-sdk/types';
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

BSD-3-Clause-Clear

## 🔗 Links

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [GitHub Repository](https://github.com/zama-ai/fhevm-react-template)
- [Issues](https://github.com/zama-ai/fhevm-react-template/issues)

## 💡 Design Philosophy

This SDK follows these principles:

1. **Simplicity First** - Start with 10 lines, scale as needed
2. **Framework Agnostic** - Core works everywhere, frameworks are optional
3. **Type Safety** - Comprehensive TypeScript support
4. **Zero Breaking Changes** - Backward compatibility always
5. **Developer Experience** - Wagmi-style API, clear documentation

## 🎯 Roadmap

- ✅ Framework-agnostic core
- ✅ React hooks (Wagmi-style)
- ✅ TypeScript support
- ✅ Storage adapters
- ✅ Event-driven architecture
- ✅ Backward compatibility
- 🚧 Vue.js composables
- 🚧 Svelte stores
- 🚧 CLI tools
- 🚧 Advanced demos

---

**Built with ❤️ for the Zama FHEVM Developer Program**
