# Migration Guide: v0.1.0 → v0.2.0

This guide helps you migrate from the old FHEVM SDK to the new universal SDK architecture.

## 📋 Table of Contents

- [Overview](#overview)
- [Breaking Changes](#breaking-changes)
- [Step-by-Step Migration](#step-by-step-migration)
- [API Changes](#api-changes)
- [Examples](#examples)
- [FAQ](#faq)

---

## Overview

### What Changed?

The SDK has been refactored into a **universal, framework-agnostic architecture**:

**Before (v0.1.0):**
```
@fhevm-sdk
└── Everything bundled together
```

**After (v0.2.0):**
```
@fhevm-sdk
├── /core      → Framework-agnostic
├── /react     → React hooks
├── /storage   → Storage utilities
└── /types     → TypeScript types
```

### Why?

1. **Better tree-shaking** - Import only what you need
2. **Framework agnostic** - Use core SDK in Node.js, Vue, Svelte, etc.
3. **Clearer API** - Wagmi-style hooks for React
4. **Better types** - Comprehensive TypeScript support

---

## Breaking Changes

**Good news: NONE!** 🎉

The new SDK maintains **100% backward compatibility**. Your existing code will continue to work without any changes.

However, we **recommend migrating** to the new API for:
- Better developer experience
- Improved type safety
- Future-proof code
- Access to new features

---

## Step-by-Step Migration

### Option 1: No Changes Required (Backward Compatible)

Your existing code works as-is:

```typescript
// ✅ This still works!
import { useFhevm } from '@fhevm-sdk';

const { instance, status, refresh } = useFhevm({
  provider: window.ethereum,
  chainId: 31337,
  initialMockChains: { 31337: 'http://localhost:8545' },
  enabled: true,
});
```

### Option 2: Gradual Migration (Recommended)

Migrate incrementally, one component at a time:

#### Step 1: Update Imports

```diff
- import { useFhevm } from '@fhevm-sdk';
+ import { useFhevm } from '@fhevm-sdk/react';
```

#### Step 2: Update Parameter Names

```diff
const { instance, status } = useFhevm({
-   provider: window.ethereum,
+   network: window.ethereum,
    chainId: 31337,
-   initialMockChains: { 31337: 'http://localhost:8545' },
+   mockChains: { 31337: 'http://localhost:8545' },
-   enabled: true,  // This parameter is now ignored (auto-enabled)
});
```

#### Step 3: Update Method Names (Optional)

```diff
- const { refresh } = useFhevm(config);
+ const { reconnect } = useFhevm(config);

- refresh();
+ await reconnect();
```

### Option 3: Full Migration

Adopt the new API completely for new components:

```typescript
import {
  useFhevm,
  useEncrypt,
  useDecrypt
} from '@fhevm-sdk/react';

function MyComponent() {
  // New API
  const { instance, status, error, reconnect } = useFhevm({
    network: window.ethereum,
    chainId: 31337,
    mockChains: { 31337: 'http://localhost:8545' },
    debug: true,
  });

  const { encrypt, canEncrypt } = useEncrypt({
    instance,
    signer,
    contractAddress: '0x123...',
  });

  const { decrypt, canDecrypt, results } = useDecrypt({
    instance,
    signer,
    requests: [...],
    storage,
  });

  // Use the hooks...
}
```

---

## API Changes

### `useFhevm()` Hook

#### Parameter Changes

| Old (v0.1.0) | New (v0.2.0) | Status | Notes |
|--------------|--------------|--------|-------|
| `provider` | `network` | ✅ Both work | `network` is more accurate |
| `initialMockChains` | `mockChains` | ✅ Both work | Shorter name |
| `enabled` | _(removed)_ | ⚠️ Ignored | Always enabled now |

#### Return Value Changes

| Old (v0.1.0) | New (v0.2.0) | Status | Notes |
|--------------|--------------|--------|-------|
| `refresh` | `reconnect` | ✅ Both work | `reconnect` is more explicit |
| `status` | `status` | ✅ Same | More granular states |
| `instance` | `instance` | ✅ Same | No changes |
| `error` | `error` | ✅ Same | Better typing |
| - | `client` | ✨ New | Access to raw client |

#### Status Values

**Old (v0.1.0):**
- `idle`
- `loading`
- `ready`
- `error`

**New (v0.2.0):**
- `idle`
- `connecting`
- `sdk-loading` _(new)_
- `sdk-initializing` _(new)_
- `creating-instance` _(new)_
- `ready`
- `error`
- `disconnected` _(new)_

### New Hooks

#### `useEncrypt()`

**Purpose:** Simplifies encryption operations.

```typescript
// Before (manual encryption)
const encrypt = async (value: number) => {
  if (!instance) return;
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(value);
  const encrypted = await input.encrypt();
  return encrypted;
};

// After (useEncrypt hook)
const { encrypt, canEncrypt } = useEncrypt({
  instance,
  signer,
  contractAddress,
});

const encrypted = await encrypt((input) => {
  input.add64(value);
});
```

#### `useDecrypt()`

**Purpose:** Simplifies decryption with automatic signature management.

```typescript
// Before (manual decryption)
const decryptValue = async (handle: string) => {
  const signature = await FhevmDecryptionSignature.loadOrSign(...);
  const result = await instance.userDecrypt(
    [{ handle, contractAddress }],
    signature.privateKey,
    signature.publicKey,
    signature.signature,
    // ... many more parameters
  );
  return result;
};

// After (useDecrypt hook)
const { decrypt, canDecrypt, results } = useDecrypt({
  instance,
  signer,
  requests: [{ handle, contractAddress }],
  storage,
});

await decrypt(); // That's it!
console.log(results[handle]); // Access result
```

---

## Examples

### Example 1: Basic Migration

**Before (v0.1.0):**

```typescript
import { useFhevm } from '@fhevm-sdk';

function App() {
  const { instance, status } = useFhevm({
    provider: window.ethereum,
    chainId: 31337,
    initialMockChains: { 31337: 'http://localhost:8545' },
  });

  return <div>Status: {status}</div>;
}
```

**After (v0.2.0) - Minimal changes:**

```typescript
import { useFhevm } from '@fhevm-sdk/react';

function App() {
  const { instance, status } = useFhevm({
    network: window.ethereum,  // Changed: provider → network
    chainId: 31337,
    mockChains: { 31337: 'http://localhost:8545' },  // Changed: initialMockChains → mockChains
  });

  return <div>Status: {status}</div>;
}
```

### Example 2: Encryption Migration

**Before (v0.1.0):**

```typescript
import { useFhevm } from '@fhevm-sdk';

function EncryptComponent() {
  const { instance } = useFhevm({...});

  const handleEncrypt = async () => {
    if (!instance) return;

    const userAddress = await signer.getAddress();
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    input.add64(42);
    const encrypted = await input.encrypt();

    await contract.myFunction(encrypted.handles[0], encrypted.inputProof);
  };

  return <button onClick={handleEncrypt}>Encrypt</button>;
}
```

**After (v0.2.0) - Using new hooks:**

```typescript
import { useFhevm, useEncrypt } from '@fhevm-sdk/react';

function EncryptComponent() {
  const { instance } = useFhevm({...});

  const { encrypt, canEncrypt } = useEncrypt({
    instance,
    signer,
    contractAddress,
  });

  const handleEncrypt = async () => {
    const encrypted = await encrypt((input) => {
      input.add64(42);
    });

    await contract.myFunction(encrypted.handles[0], encrypted.inputProof);
  };

  return (
    <button onClick={handleEncrypt} disabled={!canEncrypt}>
      Encrypt
    </button>
  );
}
```

### Example 3: Decryption Migration

**Before (v0.1.0):**

```typescript
import { useFhevm, FhevmDecryptionSignature } from '@fhevm-sdk';

function DecryptComponent() {
  const { instance } = useFhevm({...});
  const [result, setResult] = useState<bigint>();

  const handleDecrypt = async () => {
    if (!instance) return;

    const signature = await FhevmDecryptionSignature.loadOrSign(
      instance,
      [contractAddress],
      signer,
      storage
    );

    const decrypted = await instance.userDecrypt(
      [{ handle: myHandle, contractAddress }],
      signature.privateKey,
      signature.publicKey,
      signature.signature,
      signature.contractAddresses,
      signature.userAddress,
      signature.startTimestamp,
      signature.durationDays
    );

    setResult(decrypted[myHandle]);
  };

  return (
    <>
      <button onClick={handleDecrypt}>Decrypt</button>
      {result && <div>Result: {result.toString()}</div>}
    </>
  );
}
```

**After (v0.2.0) - Using new hooks:**

```typescript
import { useFhevm, useDecrypt } from '@fhevm-sdk/react';

function DecryptComponent() {
  const { instance } = useFhevm({...});

  const { decrypt, canDecrypt, results, isDecrypting } = useDecrypt({
    instance,
    signer,
    requests: [{ handle: myHandle, contractAddress }],
    storage,
  });

  return (
    <>
      <button onClick={decrypt} disabled={!canDecrypt}>
        {isDecrypting ? 'Decrypting...' : 'Decrypt'}
      </button>
      {results && <div>Result: {results[myHandle]?.toString()}</div>}
    </>
  );
}
```

---

## FAQ

### Q: Do I need to migrate immediately?

**A:** No! Your existing code will continue to work. Migrate at your own pace.

### Q: Can I use both old and new APIs in the same app?

**A:** Yes! Mix and match as needed during migration.

### Q: What are the benefits of migrating?

**A:**
1. Cleaner, more composable code
2. Better TypeScript support
3. Automatic state management (staleness, deduplication)
4. Access to new features
5. Future-proof your code

### Q: Will the old API be removed?

**A:** No immediate plans. We're committed to backward compatibility.

### Q: How do I migrate custom hooks that use the old API?

**A:** You can wrap the new hooks or gradually update them. See examples above.

### Q: What about Node.js usage?

**A:** Use the new `@fhevm-sdk/core` package:

```typescript
import { createFhevmClient } from '@fhevm-sdk/core';

const client = createFhevmClient({
  network: 'http://localhost:8545',
  chainId: 31337,
});

client.on('ready', (instance) => {
  // Use instance
});

await client.connect();
```

### Q: Can I use the new SDK with Vue or Svelte?

**A:** Yes! Use `@fhevm-sdk/core` which is framework-agnostic. Vue composables and Svelte stores are coming soon.

### Q: Where can I get help?

**A:**
- Check the [README](./README.md) for full API docs
- See [examples](../../packages/nextjs/app/_components/) in the repo
- Open an [issue](https://github.com/zama-ai/fhevm-react-template/issues) on GitHub

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Read this guide
- [ ] Choose migration strategy (none, gradual, or full)
- [ ] Update imports to `@fhevm-sdk/react`
- [ ] Rename `provider` → `network`
- [ ] Rename `initialMockChains` → `mockChains`
- [ ] Rename `refresh` → `reconnect` (optional)
- [ ] Consider using `useEncrypt()` for encryption
- [ ] Consider using `useDecrypt()` for decryption
- [ ] Test your application
- [ ] Update tests
- [ ] Update documentation

---

## Support

Need help with migration?

- 📖 [Full API Documentation](./README.md)
- 💬 [GitHub Discussions](https://github.com/zama-ai/fhevm-react-template/discussions)
- 🐛 [Report Issues](https://github.com/zama-ai/fhevm-react-template/issues)

---

**Happy migrating! 🚀**
