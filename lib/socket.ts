// lib/socket.ts
// Singleton Socket.io client — shared across the entire app.
// Use `autoConnect: false` so we connect only when a component actually needs it.

import { io, Socket } from "socket.io-client";

const SOCKET_URL = "https://backend.madeinarnhemland.com.au";

// ServerToClientEvents shape
interface ServerToClientEvents {
  "stock:update": (data: {
    productId: string;
    stock: number;
    isAvailable: boolean;
    timestamp?: string;
  }) => void;
}

// ClientToServerEvents shape
interface ClientToServerEvents {
  "watch:product": (productId: string) => void;
  "unwatch:product": (productId: string) => void;
  "watch:cart": (productIds: string[]) => void;
}

// Use a module-level variable so Next.js HMR doesn't create multiple sockets
let _socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (typeof window === "undefined") {
    // Return a dummy object for SSR — components must guard with `typeof window`
    throw new Error("Socket can only be used in the browser");
  }

  if (!_socket) {
    _socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,         // 2 s between retries (handles Render cold-starts)
      transports: ["websocket", "polling"],
    });

    // Re-subscribe to watched entities after every reconnect so we never miss
    // updates that arrived while the connection was down.
    _socket.on("connect", () => {
      if (process.env.NODE_ENV === "development") {
    
      }

      // Restore product watch
      const watchingProductId =
        typeof window !== "undefined"
          ? (window as any).__socketWatchingProductId as string | undefined
          : undefined;
      if (watchingProductId) {
        _socket!.emit("watch:product", watchingProductId);
      }

      // Restore cart watch
      const cartIds =
        typeof window !== "undefined"
          ? (window as any).__socketCartProductIds as string[] | undefined
          : undefined;
      if (cartIds?.length) {
        _socket!.emit("watch:cart", cartIds);
      }
    });

    _socket.on("disconnect", (reason) => {
      if (process.env.NODE_ENV === "development") {
      }
    });
  }

  return _socket;
}

export { getSocket };
export type StockUpdatePayload = {
  productId: string;
  stock: number;
  isAvailable: boolean;
  timestamp?: string;
};
