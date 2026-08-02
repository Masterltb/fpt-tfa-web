import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import App from "@/App";
import { AuthProvider } from "@/lib/auth";
import "@/styles.css";

const queryClient = new QueryClient();

const root = document.getElementById("root");
if (!root) throw new Error("#root not found in index.html");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
