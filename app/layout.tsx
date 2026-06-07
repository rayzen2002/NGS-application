"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <html
        lang="en"
        suppressHydrationWarning
      >
        <body className="antialiased">
          <Toaster />
          <ThemeProvider
            attribute="class" // ← isso faz o controle do tema com a classe `dark`
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </QueryClientProvider>
  );
}
