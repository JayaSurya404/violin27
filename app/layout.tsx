import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { siteConfig } from "@/src/config/site";
import "./globals.css";

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: siteConfig.theme.colors.midnightBlack,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const imageUrl = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: siteConfig.metadata.shareTitle,
    description: siteConfig.metadata.shareDescription,
    applicationName: siteConfig.metadata.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: siteConfig.metadata.locale,
      title: siteConfig.metadata.shareTitle,
      description: siteConfig.metadata.shareDescription,
      siteName: siteConfig.metadata.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.metadata.name} — a birthday aurora`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.metadata.shareTitle,
      description: siteConfig.metadata.shareDescription,
      images: [imageUrl],
    },
    icons: {
      icon: "/favicon.png",
      apple: "/favicon.png",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
