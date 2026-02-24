import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvenAI - Smart Inventory Management",
  description:
    "AI-powered inventory management system with smart insights and automation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                className:
                  "!bg-white !text-gray-900 dark:!bg-gray-800 dark:!text-gray-100",
              }}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
