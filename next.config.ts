import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/frontend_II_projeto' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/frontend_II_projeto/' : '',
};

export default nextConfig;
