/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Cloudflare Pages
  env: {
    REMOVE_BG_API_KEY: process.env.REMOVE_BG_API_KEY,
  },
}

module.exports = nextConfig
