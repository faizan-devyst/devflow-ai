import type { Metadata } from "next";
import { DM_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Header from "@/components/layout/header/header";
import Footer from "@/components/layout/footer/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { StoreProvider } from "@/components/providers/store-provider";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

import { Toaster } from "@/components/ui/sonner";
import { constructMetadata } from "@/lib/metadata";

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en" suppressHydrationWarning
      className={cn(
        "h-full antialiased", dmSans.variable, "font-sans", geist.variable)}
    >
      <body className="flex flex-col bg-canvas-base" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <StoreProvider>
            <AuthProvider>
              <Toaster position="bottom-right" />
              <TooltipProvider>
                <Header />
                {children}
                <Footer />
              </TooltipProvider>
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}