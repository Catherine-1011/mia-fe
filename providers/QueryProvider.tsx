// app/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState } from "react";
import { couponQueryKeys, productQueryKeys, singleProductQueryKeys } from "@/lib/queryKeys";
import { clearCheckoutOptionsCache } from "@/lib/guestCartUtils";
import { CacheInvalidationPayload, getSocket } from "@/lib/socket";

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

  useEffect(() => {
    const socket = getSocket();
    let hasConnected = socket.connected;

    const handleCacheInvalidation = ({ scope }: CacheInvalidationPayload) => {
      if (scope === "products") {
        void queryClient.invalidateQueries({ queryKey: productQueryKeys.products });
        void queryClient.invalidateQueries({ queryKey: singleProductQueryKeys.all });
      } else if (scope === "coupons") {
        void queryClient.invalidateQueries({ queryKey: couponQueryKeys.coupons });
      } else if (scope === "checkout") {
        clearCheckoutOptionsCache();
      }
    };

    const handleReconnect = () => {
      if (!hasConnected) {
        hasConnected = true;
        return;
      }

      // Socket events are transient. Refresh only public cached data after a
      // real reconnect so changes made while offline cannot remain hidden.
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.products });
      void queryClient.invalidateQueries({ queryKey: singleProductQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: couponQueryKeys.coupons });
      clearCheckoutOptionsCache();
    };

    socket.on("cache:invalidate", handleCacheInvalidation);
    socket.on("connect", handleReconnect);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("cache:invalidate", handleCacheInvalidation);
      socket.off("connect", handleReconnect);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
