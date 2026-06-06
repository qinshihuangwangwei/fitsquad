/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  serverExternalPackages: ["bcryptjs"],
  allowedDevOrigins: ["10.71.24.30", "localhost"],
};

module.exports = nextConfig;
