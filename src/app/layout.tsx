import type { Metadata, Viewport } from "next";
import { SessionProvider } from "@/providers/SessionProvider";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "FitSquad — 健身打卡与社交",
  description: "组团健身、记录训练、挑战排行榜",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-surface-50">
        <SessionProvider>
          <Navbar />
          <main className="pb-16">{children}</main>
          <Toaster position="top-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
