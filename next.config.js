/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false,   // Garantir que o Turbo está desligado
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig;
