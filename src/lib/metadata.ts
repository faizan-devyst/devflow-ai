import type { Metadata } from "next";

export const siteConfig = {
  name: "DevFlow AI",
  description:
    "Open source AI productivity platform for dev teams. Async standups, sprint digests, and codebase onboarding, powered by Claude.",
  url: process.env.NEXT_PUBLIC_APP_URL!,
  ogImage: "/api/og",
};

export function constructMetadata({
  title,
  description,
  image,
  noIndex,
}: {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: `DevFlow AI | ${title}`,
    description: description || siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title: `DevFlow AI | ${title}`,
      description: description || siteConfig.description,
      url: siteConfig.url,
      siteName: "DevFlow AI",
      images: [
        {
          url: image || "/api/og",
          width: 1200,
          height: 630,
          alt: title || "DevFlow AI",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `DevFlow AI | ${title}`,
      description: description || siteConfig.description,
      images: [image || "/api/og"],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    icons: {
      icon: "/favicon/favicon.ico",
      shortcut: "/favicon/favicon-16x16.png",
      apple: "/favicon/apple-touch-icon.png",
    },
    manifest: "/favicon/site.webmanifest",
  };
}
