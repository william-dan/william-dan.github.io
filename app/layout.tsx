import type { Metadata } from "next";
import { Geist_Mono, Crimson_Pro } from "next/font/google";
import { siteContent } from "@/lib/site-content";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: siteContent.metadata.title,
  description: siteContent.metadata.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="prefetch"
          href="/models/grand_piano.glb"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="prefetch"
          href="/models/studio_small_03_1k.exr"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistMono.variable} ${crimsonPro.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
