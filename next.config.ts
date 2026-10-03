import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.wikimedia.org' }],
  },
  async redirects() {
    // Routes of the previous version of the site
    return [{ source: '/informations', destination: '/etats', permanent: true }]
  },
}

export default nextConfig
