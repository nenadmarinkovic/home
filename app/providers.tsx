"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useContext } from "react";

import { ToastProvider } from "@/components/toasts";
import { TooltipProvider } from "@/components/ui/tooltip";

const AuthContext = createContext<boolean>(false);

export function useAuthedContext(): boolean {
  return useContext(AuthContext);
}

export function Providers({
  children,
  authed,
}: {
  children: React.ReactNode;
  authed: boolean;
}) {
  return (
    <AuthContext.Provider value={authed}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider delay={200}>
          <ToastProvider>{children}</ToastProvider>
        </TooltipProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}
