import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@libsql/client'],
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
};

export default nextConfig;
