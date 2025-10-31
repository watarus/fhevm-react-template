# FHEVM Nuxt Template

A Nuxt.js template for building dApps with Fully Homomorphic Encryption (FHE) using Zama's FHEVM.

## Features

- 🚀 **Nuxt 3** - Vue 3 with SSR support
- 🔐 **FHEVM SDK** - Vue composables for FHE operations
- 💅 **Tailwind CSS + DaisyUI** - Beautiful, responsive UI
- 🌐 **Network Switching** - Hardhat/Sepolia via environment variables
- 🔌 **Wallet Connection** - Web3Modal (coming soon)
- 📦 **Monorepo** - Integrated with Turbo workspace

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm (package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3001`.

### Build for Production

```bash
pnpm build
pnpm preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# FHEVM Network: "hardhat" or "sepolia"
NUXT_PUBLIC_FHEVM_NETWORK=hardhat

# Contract Addresses
NUXT_PUBLIC_CONTRACT_ADDRESS_HARDHAT=0x40e8Aa088739445BC3a3727A724F56508899f65B
NUXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0xead137D42d2E6A6a30166EaEf97deBA1C3D1954e

# API Keys (optional)
NUXT_PUBLIC_ALCHEMY_API_KEY=
NUXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
```

## Project Structure

```
packages/nuxtjs/
├── assets/          # CSS and static assets
├── components/      # Vue components
├── composables/     # Vue composables
├── config/          # Configuration files
├── layouts/         # Nuxt layouts
├── pages/           # Nuxt pages (routes)
├── public/          # Public static files
├── app.vue          # Root component
└── nuxt.config.ts   # Nuxt configuration
```

## Usage

### Using FHEVM SDK

```vue
<script setup lang="ts">
import { useFhevm, useEncrypt, useDecrypt } from "@fhevm-sdk/vue";

const { instance, status } = useFhevm({
  network: window.ethereum,
  chainId: 31337,
});

// Encrypt a value
const encryptValue = async (value: number) => {
  if (!instance.value) return;
  const encrypted = await instance.value.encrypt_u32(value);
  return encrypted;
};
</script>
```

### Custom Composables

The template includes `useFHECounter` composable that demonstrates:

- FHEVM SDK integration
- Encryption/Decryption
- Contract interactions
- Loading states

## Development

```bash
# Run dev server
pnpm dev

# Type check
pnpm check-types

# Lint
pnpm lint

# Format
pnpm format
```

## Learn More

- [Nuxt 3 Documentation](https://nuxt.com)
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Tailwind CSS](https://tailwindcss.com)
- [DaisyUI](https://daisyui.com)

## License

BSD-3-Clause-Clear
