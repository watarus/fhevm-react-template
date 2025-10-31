# FHEVM React Template

A minimal React frontend template for building FHEVM-enabled decentralized applications (dApps). This template now includes the **Universal FHEVM SDK** - a modern, framework-agnostic SDK with React and Vue.js support.

## 🚀 What is FHEVM?

FHEVM (Fully Homomorphic Encryption Virtual Machine) enables computation on encrypted data directly on Ethereum. This template demonstrates how to build dApps that can perform computations while keeping data private.

## ✨ Features

- **🔐 FHEVM Integration**: Built-in support for fully homomorphic encryption
- **🎯 Universal FHEVM SDK**: Framework-agnostic core with React & Vue.js wrappers
- **⚛️ React + Next.js**: Modern Next.js demo with App Router
- **🟢 Vue + Nuxt**: Nuxt 3 demo with Composition API
- **🎨 Tailwind CSS**: Utility-first styling for rapid UI development
- **🔗 Wallet Integration**: RainbowKit (React) and Wagmi composables (Vue)
- **🌐 Multi-Network Support**: Works on Sepolia testnet and local Hardhat node
- **📦 Monorepo Structure**: SDK, contracts, Next.js, and Nuxt apps

## 🆕 Universal FHEVM SDK

This template now includes the **Universal FHEVM SDK v0.1.0** - a modern, framework-agnostic SDK that makes working with FHEVM easier than ever.

### Key Benefits

- **Framework Agnostic Core**: Use with any JavaScript framework or vanilla JS
- **Event-Driven Architecture**: Automatic lifecycle management with events
- **Wagmi-Style API**: Familiar patterns for Web3 developers
- **React Hooks**: `useFhevm()`, `useEncrypt()`, `useDecrypt()`
- **Vue Composables**: Vue 3 Composition API support
- **Builder Pattern**: Clean, type-safe encryption
- **Automatic Signature Management**: Built-in caching and staleness detection
- **TypeScript First**: Full type safety and IntelliSense support

### Quick Examples

**React:**
```typescript
import { useFhevm, useEncrypt } from '@fhevm-sdk/react';

const { instance, status } = useFhevm({ network: window.ethereum, chainId: 31337 });
const { encrypt } = useEncrypt({ instance, signer, contractAddress });

// Encrypt with builder pattern
const encrypted = await encrypt((input) => input.add64(42));
```

**Vue:**
```vue
<script setup>
import { useFhevm, useEncrypt } from '@fhevm-sdk/vue';
const { instance, status } = useFhevm({ network: window.ethereum, chainId: 31337 });
const { encrypt } = useEncrypt({ instance, signer, contractAddress });
</script>
```

**Framework-Agnostic:**
```typescript
import { createFhevmClient } from '@fhevm-sdk/core';
const client = createFhevmClient({ network: 'http://localhost:8545', chainId: 31337 });
client.on('ready', (instance) => console.log('FHEVM ready!', instance));
await client.connect();
```

**Migration from Legacy API:** See [MIGRATION.md](packages/fhevm-sdk/MIGRATION.md) for a step-by-step guide.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **MetaMask** browser extension
- **Git** for cloning the repository

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-react-template

# Initialize submodules (includes fhevm-hardhat-template)
git submodule update --init --recursive

# Install dependencies
pnpm install
```

### 2. Environment Configuration

Set up your Hardhat environment variables by following the [FHEVM documentation](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional):

- `MNEMONIC`: Your wallet mnemonic phrase
- `INFURA_API_KEY`: Your Infura API key for Sepolia

### 3. Start Development Environment

**Option A: Local Development (Recommended for testing)**

```bash
# Terminal 1: Start local Hardhat node
pnpm chain
# RPC URL: http://127.0.0.1:8545 | Chain ID: 31337

# Terminal 2: Deploy contracts to localhost
pnpm deploy:localhost

# Terminal 3: Start the frontend
pnpm start
```

**Option B: Sepolia Testnet**

```bash
# Deploy to Sepolia testnet
pnpm deploy:sepolia

# Start the frontend
pnpm start
```

### 4. Connect MetaMask

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Connect Wallet" and select MetaMask
3. If using localhost, add the Hardhat network to MetaMask:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

### 5. Try the New API Demo

The homepage now features **two demos side-by-side**:

- **NEW API Demo** (top): Uses the Universal FHEVM SDK with modern hooks
- **Legacy API Demo** (bottom): Original implementation for comparison

Compare the code and see how the new API simplifies FHEVM integration!

### ⚠️ Sepolia Production note

- `NEXT_PUBLIC_ALCHEMY_API_KEY` is optional (see `packages/nextjs/scaffold.config.ts`). The app will fall back to public RPCs if not set.
- For better reliability and rate limits, it's recommended to set your own Alchemy API key in production.
- Ensure `packages/nextjs/contracts/deployedContracts.ts` points to your live contract addresses.
- Optional: set `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` for better WalletConnect reliability.
- Optional: add per-chain RPCs via `rpcOverrides` in `packages/nextjs/scaffold.config.ts`.

## 🔧 Troubleshooting

**Nonce Mismatch Error**: Open MetaMask → Settings → Advanced → Clear Activity Tab

**Cached View Results**: Restart your browser after restarting Hardhat

For more details, see the [MetaMask development guide](https://docs.metamask.io/wallet/how-to/run-devnet/).

## 📁 Project Structure

This template uses a monorepo structure with three main packages:

```
fhevm-react-template/
├── packages/
│   ├── fhevm-sdk/                 # Universal FHEVM SDK
│   │   ├── src/
│   │   │   ├── core/              # Framework-agnostic core
│   │   │   ├── react/             # React hooks
│   │   │   ├── vue/               # Vue composables
│   │   │   └── storage/           # Storage adapters
│   │   └── dist/                  # Build output (58 files)
│   ├── hardhat/                   # Smart contracts & deployment
│   ├── nextjs/                    # Next.js + React demo
│   │   ├── app/_components/
│   │   │   ├── FHECounterDemoNew.tsx    # NEW API
│   │   │   └── FHECounterDemo.tsx       # Legacy API
│   │   └── hooks/fhecounter-example/
│   └── nuxtjs/                    # Nuxt 3 + Vue demo
│       ├── components/
│       │   └── FHECounterDemo.vue       # Vue + FHEVM SDK
│       └── composables/
└── scripts/                       # Build and deployment scripts
```

### Key Components

#### 🆕 Universal FHEVM SDK (`packages/fhevm-sdk/`)

**New Architecture:**
- **`src/core/`**: Framework-agnostic core with event-driven client
  - `client.ts`: FhevmClient with lifecycle management
  - `encryption.ts`: Builder pattern encryption utilities
  - `decryption.ts`: Automatic signature management
  - `EventEmitter.ts`: Lightweight event system

- **`src/react/`**: React integration
  - `hooks/useFhevm.ts`: Client lifecycle hook
  - `hooks/useEncrypt.ts`: Encryption hook with builder pattern
  - `hooks/useDecrypt.ts`: Decryption with staleness detection

- **`src/vue/`**: Vue.js integration
  - `composables/useFhevm.ts`: Client lifecycle composable
  - `composables/useEncrypt.ts`: Encryption composable
  - `composables/useDecrypt.ts`: Decryption composable

#### 🔗 Demo Applications

**Next.js (`packages/nextjs/`)**:
- **`FHECounterDemoNew.tsx`**: NEW API with `useFhevm()`, `useEncrypt()`, `useDecrypt()`
- **`FHECounterDemo.tsx`**: Legacy API (for comparison)
- Uses RainbowKit for wallet connection

**Nuxt (`packages/nuxtjs/`)**:
- **`FHECounterDemo.vue`**: Vue 3 Composition API with FHEVM SDK
- Uses Wagmi Vue composables
- DaisyUI components for styling

## 📚 SDK Documentation

For detailed SDK documentation, see:

- **[SDK README](packages/fhevm-sdk/README.md)** - Complete API reference
- **[CHANGELOG](packages/fhevm-sdk/CHANGELOG.md)** - Version history
- **[MIGRATION.md](packages/fhevm-sdk/MIGRATION.md)** - Migration from legacy API

### API Reference Quick Links

**Core API:**
- `createFhevmClient()` - Create FHEVM client instance
- `getEncryptionMethod()` - Map Solidity types to encryption methods
- `buildParamsFromAbi()` - Build contract parameters from encrypted data

**React Hooks:**
- `useFhevm()` - Client lifecycle management
- `useEncrypt()` - Encryption with builder pattern
- `useDecrypt()` - Decryption with automatic signatures

**Vue Composables:**
- `useFhevm()` - Client lifecycle management
- `useEncrypt()` - Encryption with builder pattern
- `useDecrypt()` - Decryption with automatic signatures

## 📚 Additional Resources

### Official Documentation
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/) - Complete FHEVM guide
- [FHEVM Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat) - Hardhat integration
- [Relayer SDK Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/) - SDK reference
- [Environment Setup](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) - MNEMONIC & API keys

### Development Tools
- [MetaMask + Hardhat Setup](https://docs.metamask.io/wallet/how-to/run-devnet/) - Local development
- [React Documentation](https://reactjs.org/) - React framework guide
- [Vue.js Documentation](https://vuejs.org/) - Vue.js framework guide

### Community & Support
- [FHEVM Discord](https://discord.com/invite/zama) - Community support
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues) - Bug reports & feature requests

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Zama community**

*Universal FHEVM SDK v0.1.0 - Making FHEVM development accessible to everyone*
