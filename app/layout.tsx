import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://purple-aurora.vercel.app"),
  title: "Something I wanted to say.",
  description: "A small, private letter.",
  openGraph: {
    title: "Something I wanted to say.",
    description: "A small, private letter.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = { themeColor: "#080611", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
