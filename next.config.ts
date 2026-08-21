import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@navikt/ds-react", "@navikt/ds-css", "@navikt/aksel-icons"],
  reactStrictMode: true,
};

export default nextConfig;
