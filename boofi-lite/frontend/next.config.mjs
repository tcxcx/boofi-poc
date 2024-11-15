import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

const config = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "dynamic-assets.coinbase.com",
        pathname: "**",
      },

      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname:
          "bafybeihfbjhiz5rytxcug7l7ymu6veyam5dcdrmqevz2jkepsgec6xobgi.ipfs.web3approved.com",
        pathname: "**",
      },
    ],
  },
  experimental: {},
};

export default withNextIntl(config);
