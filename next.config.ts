import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  webpack: (config, { webpack }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    if (config.plugins) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
        })
      );
    }
    return config;
  },
  experimental: {
    webpackBuildWorker: true,
    optimizePackageImports: [
      "@/hooks",
      "@/services",
      "@mantine/core",
      "@mantine/hooks",
    ],
  },
};

export default nextConfig;
