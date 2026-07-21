import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The frontend does not use Next.js server features. Exporting it as a
  // complete static site keeps the HTML and its hashed /_next assets together
  // when Hostinger publishes the `out` directory.
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SITE_NAME: "Admisi UPJ Assistant",
  },
};

export default nextConfig;
