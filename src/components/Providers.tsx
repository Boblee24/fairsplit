"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { useState } from "react";
// import { OnchainKitProvider } from "@coinbase/onchainkit";
// import { baseSepolia } from "wagmi/chains";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    // <OnchainKitProvider
    //   apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
    //   chain={baseSepolia}
    // >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    // </OnchainKitProvider>
  );
}
