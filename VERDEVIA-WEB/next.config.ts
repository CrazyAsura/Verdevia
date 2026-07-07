import path from "path";
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  /* Design-Driven Engineering: Turbopack Migration */
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@radix-ui/react-slot"],
  },
  // Meta-Standard: Otimização de performance e escalabilidade
  turbopack: {
    root: path.resolve(__dirname),
  },
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: 'http://127.0.0.1:3333/graphql',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3333/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://127.0.0.1:3333/socket.io/:path*',
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
        ],
      };
    }
    return config;
  },
};

export default withPWA(nextConfig);
