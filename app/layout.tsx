import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeartCart — Send Love to Palm Springs Nursing Homes",
  description:
    "Send soft fruit, comfort gifts, and more to loved ones in Palm Springs area nursing homes. Order in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
