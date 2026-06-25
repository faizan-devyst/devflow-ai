import type { Metadata } from "next";

export const siteConfig = {
  name: "DevFlow AI",
  description:
    "The AI workspace for engineering teams: written async standups with AI summaries and weekly digests, plus a codebase onboarding agent that turns any GitHub repo into semantic search, grounded Q&A, and an automatically generated onboarding guide. Open source, bring your own keys.",
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
    applicationName: "DevFlow AI",
    authors: [{ name: "Devyst", url: "https://devyst.com" }],
    creator: "Devyst",
    publisher: "Devyst",
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
