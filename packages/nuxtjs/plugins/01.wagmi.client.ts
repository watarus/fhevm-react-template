import { QueryClient, VueQueryPlugin } from "@tanstack/vue-query";
import { WagmiPlugin, createConfig, http } from "@wagmi/vue";
import { hardhat, mainnet, sepolia } from "@wagmi/vue/chains";
import { injected } from "@wagmi/vue/connectors";

export default defineNuxtPlugin({
  name: "wagmi",
  parallel: false,
  setup(nuxtApp) {
    console.log("[01.wagmi plugin] Plugin file loaded");

    // SSR guard
    if (typeof window === "undefined") {
      console.log("[01.wagmi plugin] Skipping initialization on server side");
      return;
    }

    try {
      console.log("[01.wagmi plugin] Starting initialization on client side");
      const config = useRuntimeConfig();
      console.log("[01.wagmi plugin] Runtime config loaded");

      // Create QueryClient for TanStack Query
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
          },
        },
      });
      console.log("[01.wagmi plugin] QueryClient created");

      console.log("[01.wagmi plugin] Installing VueQueryPlugin");
      // Install VueQueryPlugin first (required by Wagmi)
      nuxtApp.vueApp.use(VueQueryPlugin, { queryClient });
      console.log("[01.wagmi plugin] VueQueryPlugin installed");

      console.log("[01.wagmi plugin] Creating Wagmi config");
      const wagmiConfig = createConfig({
        chains: [hardhat, sepolia, mainnet],
        connectors: [injected()],
        transports: {
          [hardhat.id]: http("http://localhost:8545"),
          [sepolia.id]: http(
            `https://eth-sepolia.g.alchemy.com/v2/${config.public.alchemyApiKey || "demo"}`,
          ),
          [mainnet.id]: http(
            `https://eth-mainnet.g.alchemy.com/v2/${config.public.alchemyApiKey || "demo"}`,
          ),
        },
      });
      console.log("[01.wagmi plugin] Wagmi config created:", wagmiConfig);

      console.log("[01.wagmi plugin] Installing WagmiPlugin");
      // Install Wagmi plugin to Vue app
      nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiConfig });
      console.log("[01.wagmi plugin] ✅ Wagmi initialized successfully");
    } catch (error) {
      console.error("[01.wagmi plugin] ❌ Error during initialization:", error);
      throw error;
    }
  },
});
