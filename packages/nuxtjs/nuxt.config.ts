// https://nuxt.com/docs/api/configuration/nuxt-config
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  // Dev server configuration
  devServer: {
    port: 3001,
  },

  modules: ["@nuxtjs/color-mode", "@vueuse/nuxt", "@nuxt/eslint"],

  // Alias for workspace dependencies
  alias: {
    "@fhevm-sdk/vue": resolve(currentDir, "../fhevm-sdk/dist/vue"),
    "@fhevm-sdk/core": resolve(currentDir, "../fhevm-sdk/dist/core"),
    "@fhevm-sdk/storage": resolve(currentDir, "../fhevm-sdk/dist/storage"),
    "@fhevm-sdk": resolve(currentDir, "../fhevm-sdk/dist"),
  },

  // Transpile workspace dependencies
  build: {
    transpile: ["@fhevm-sdk"],
  },

  css: ["~/assets/css/main.css"],

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },

  colorMode: {
    classSuffix: "",
  },

  // CORS headers for WASM/SharedArrayBuffer support
  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Cross-Origin-Embedder-Policy": "require-corp",
          "Cross-Origin-Opener-Policy": "same-origin",
          "Cross-Origin-Resource-Policy": "cross-origin",
        },
      },
    },
  },

  vite: {
    optimizeDeps: {
      include: ["ethers", "@fhevm-sdk/vue", "@fhevm-sdk/core"],
    },
    build: {
      target: "esnext",
      commonjsOptions: {
        include: [/fhevm-sdk/, /node_modules/], // allow CJS transform on the workspace package
      },
    },
    ssr: {
      noExternal: ["@fhevm-sdk"], // bundle the SDK for the Nitro build too
    },
  },

  typescript: {
    strict: false,
    typeCheck: false,
  },

  runtimeConfig: {
    public: {
      fhevmNetwork: process.env.NUXT_PUBLIC_FHEVM_NETWORK || "hardhat",
      contractAddressHardhat:
        process.env.NUXT_PUBLIC_CONTRACT_ADDRESS_HARDHAT || "",
      contractAddressSepolia:
        process.env.NUXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA || "",
      alchemyApiKey: process.env.NUXT_PUBLIC_ALCHEMY_API_KEY || "",
    },
  },
});
