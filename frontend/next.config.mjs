/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Next.js 13+ uses app router which doesn't support the i18n config option
  // Instead, the app directory can handle internationalization differently
  // removing this to fix CSS loading issues
  // i18n: {
  //   locales: ['en', 'id'],
  //   defaultLocale: 'en',
  // },
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false }; // Fix for Pinata storage
    return config;
  },
};

export default nextConfig;
