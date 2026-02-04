import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Screenshot uploads use Server Actions; increase payload limit above 1MB.
  // Next config key is under experimental.
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions
  experimental: {
    // NextConfig typing may lag behind; keep as-is.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  } as any,
};

export default nextConfig;
