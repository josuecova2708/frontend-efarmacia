import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    // BACKEND_URL es leída en runtime por el servidor Next.js (no se hornea en el bundle)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
  images: {
    remotePatterns: [
      // Permite imágenes firmadas de MinIO/S3 cuando se usa dominio HTTPS
      // Ajusta el hostname al dominio real de tu instancia MinIO en Coolify
      {
        protocol: 'https',
        hostname: '**.duckdns.org',
        port: '',
        pathname: '/**',
      },
      // Fallback para desarrollo local con MinIO en HTTP
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;