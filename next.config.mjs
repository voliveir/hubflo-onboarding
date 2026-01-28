/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix Turbopack workspace root inference issue
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
}

export default nextConfig
