// app/layout.tsx

import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/Providers'
import "@/styles/fairsplit-theme.css";

/* ── Fonts loaded at build time — no network calls at runtime ── */
const jakarta = Plus_Jakarta_Sans({
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700", "800"],
  style:    ["normal", "italic"],
  variable: "--font-jakarta",
  display:  "swap",
});

const serif = Instrument_Serif({
  subsets:  ["latin"],
  weight:   ["400"],
  style:    ["normal", "italic"],
  variable: "--font-serif",
  display:  "swap",
});

const mono = JetBrains_Mono({
  subsets:  ["latin"],
  weight:   ["400", "500"],
  variable: "--font-mono",
  display:  "swap",
});

export const metadata: Metadata = {
  title: "FairSplit",
  description: "Split bills. Settle instantly. On Base.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Font variables injected here — readable by fairsplit-theme.css anywhere in the tree
      className={`${jakarta.variable} ${serif.variable} ${mono.variable}`}
    >
      <body>
        {/*
          ↓ Keep your existing Providers wrapper EXACTLY as it was.
            It contains WagmiProvider, RainbowKitProvider, QueryClientProvider, etc.
            Nothing inside it changes — only the font className on <html> is new.
        */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
