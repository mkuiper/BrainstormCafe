/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@brainstorm-cafe/shared'],
  webpack: (config) => {
    // Handle canvas for some dependencies
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
