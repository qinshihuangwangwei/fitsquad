import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/providers/SessionProvider";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "FitSquad",
  description: "组团健身、记录训练、挑战排行榜",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "FitSquad",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#22c55e" />
      </head>
      <body className="min-h-screen bg-surface-50">
        <ErrorBoundary>
          <SessionProvider>
            <Navbar />
            <main className="pb-16">{children}</main>
            <Toaster position="top-center" richColors />
          </SessionProvider>
        </ErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
