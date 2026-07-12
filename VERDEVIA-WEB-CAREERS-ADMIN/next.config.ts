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
    // In Docker, Next.js SSR rewrites run inside the container — 127.0.0.1:3333
    // resolves to the frontend container itself, NOT the backend service.
    // BACKEND_INTERNAL_URL should be set to http://backend:3333 in docker-compose.
    // Falls back to 127.0.0.1:3333 for local development outside Docker.
    const backendUrl = process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:3333';
    return [
      {
        source: '/graphql',
        destination: `${backendUrl}/graphql`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${backendUrl}/socket.io/:path*`,
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
