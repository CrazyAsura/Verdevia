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
    // CHATBOT FRONTEND: SSR rewrites run inside the container against the web-gateway.
    // web-gateway (port 3335) federates chatbot-backend (port 3337) and the AI layer.
    // BACKEND_INTERNAL_URL=http://web-gateway:3335 in docker-compose (ECOA_chatbot_net).
    // Falls back to localhost:3335 for local development outside Docker.
    const backendUrl = process.env.BACKEND_INTERNAL_URL ?? 'http://127.0.0.1:3335';
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
