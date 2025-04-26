'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from 'wagmi';
import { lisk, liskSepolia } from 'wagmi/chains';
import { defaultConfig } from '@xellar/kit';
import { injected } from 'wagmi/connectors';



const xellarConfig = defaultConfig({
  appName: "MakmurTani",
  walletConnectProjectId:  "d6ff0a78e265acb1c3389f8e3d926efb",
  xellarAppId: "e56762e7-51cb-4c47-963a-eda7b9bd8a3f",
  xellarEnv: "sandbox",
  chains: [lisk, liskSepolia],
  ssr: true,
});

// Initialize QueryClient outside component to prevent multiple instances
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient());

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <WagmiProvider config={xellarConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </SessionContextProvider>
  );
} 