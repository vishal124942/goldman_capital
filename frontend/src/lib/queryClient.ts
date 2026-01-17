import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;

    // Check if the response is JSON and has a message
    let message = text;
    try {
      const json = JSON.parse(text);
      if (json.message) {
        message = json.message;
      }
    } catch (e) {
      // Not JSON, use original text
    }

    // Handle session replacement (logged in from another device)
    if (res.status === 401) {
      try {
        // Since we are now using just the message, we can check it directly or parse if needed
        // But for session replacement, the backend usually sends specific code
        const json = JSON.parse(text);
        if (json.code === "SESSION_REPLACED") {
          // Redirect to home with notification about session being replaced
          window.location.href = "/?session=replaced";
          return;
        }
      } catch {
        // Regular auth error, continue with normal flow
      }
    }

    throw new Error(message);
  }
}

const getApiBaseUrl = () => {
  // Check for VITE_API_URL in import.meta.env (Vite standard)
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  // Check for VITE_API_URL in process.env (fallback/older setups)
  if (typeof process !== "undefined" && process.env?.VITE_API_URL) return process.env.VITE_API_URL;
  return "";
};

const API_BASE_URL = getApiBaseUrl();

// Debug log to help verify the backend URL in production
if (import.meta.env.PROD) {
  console.log("Connected to Backend:", API_BASE_URL || "Local Proxy (Relative Path)");
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      // Construct the path from queryKey
      const path = queryKey.join("/") as string;
      // Ensure the path starts with /api if it doesn't already have a protocol
      const fullUrl = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

      console.log("[QueryFn] Fetching:", fullUrl); // Debug log

      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
