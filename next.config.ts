import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@navikt/ds-react", "@navikt/ds-css", "@navikt/aksel-icons"],
  // pino.transport() til team logs starter en worker som laster pino-socket på navn
  // i runtime. Den oppslagsmekanismen virker ikke om pakkene bundles inn av Next.
  serverExternalPackages: ["pino", "pino-socket", "@navikt/pino-logger"],
  reactStrictMode: true,
};

export default nextConfig;
