import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "reactflow/dist/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRATYAKSH — Cybercrime Cash-Out Hotspot Intelligence",
  description: "Predictive Cybercrime Cash-Out Hotspot Intelligence Platform | Ministry of Home Affairs (MHA) & I4C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAFC] text-[#0F172A] min-h-screen antialiased selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
