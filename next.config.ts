/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Cross-Origin headers ──────────────────────────────────────────────────
  // Required for WalletConnect / RainbowKit wallet popups.
  // "same-origin-allow-popups" lets wallet windows open while still blocking
  // unrelated cross-origin openers — the right balance for a Web3 app.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },

  // ── Keep any existing config you already have below this line ────────────
  // e.g. reactStrictMode, images, webpack overrides, etc.
  reactStrictMode: true,
};

module.exports = nextConfig;