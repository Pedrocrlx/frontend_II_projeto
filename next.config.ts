import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/frontend_II_projeto' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/frontend_II_projeto/' : '',
  // Skip API routes and dynamic pages during static export
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
