// app/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data will be considered fresh for 15 minutes (increased from 5)
            staleTime: 1000 * 60 * 15,
            // Keep data in cache for 30 minutes (increased from 10)
            gcTime: 1000 * 60 * 30,
            // Retry failed requests only once (reduced from 2)
            retry: 1,
            // Retry with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // NEVER refetch on window focus/tab switch
            refetchOnWindowFocus: false,
            // NEVER refetch on reconnect
            refetchOnReconnect: false,
            // Don't refetch when component mounts if data exists
            refetchOnMount: false,
            // Don't refetch in background automatically
            refetchInterval: false,
            // Don't refetch when browser comes back online
            refetchIntervalInBackground: false,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}