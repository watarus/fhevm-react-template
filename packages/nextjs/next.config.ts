import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Disable caching completely to avoid symlink issues
    config.cache = false;

    // Add aliases for @fhevm-sdk subpath exports
    const fhevmSdkPath = path.resolve(__dirname, '../fhevm-sdk/dist');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fhevm-sdk/react$': path.join(fhevmSdkPath, 'react/index.js'),
      '@fhevm-sdk/core$': path.join(fhevmSdkPath, 'core/index.js'),
      '@fhevm-sdk/storage$': path.join(fhevmSdkPath, 'storage/index.js'),
      '@fhevm-sdk/types$': path.join(fhevmSdkPath, 'fhevmTypes.js'),
      '@fhevm-sdk/vue$': path.join(fhevmSdkPath, 'vue/index.js'),
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;
