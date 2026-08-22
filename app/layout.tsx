import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://gitflex.lol"),
  title: "GitFlex — Flex Your GitHub",
  description: "The live leaderboard where developers flex their GitHub stats. Boost your rank. Get clicks. Show off your stars.",
  openGraph: {
    title: "GitFlex — Can Your Repo Beat the Board?",
    description: "The live leaderboard where developers flex their GitHub stats. Compete, climb, and get ranked.",
    images: [
      {
        url: "/gitflex-launch-card.png",
        width: 1672,
        height: 941,
        alt: "GitFlex live GitHub repository leaderboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitFlex — Can Your Repo Beat the Board?",
    description: "The live leaderboard where developers flex their GitHub stats. Compete, climb, and get ranked.",
    images: ["/gitflex-launch-card.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gh-canvas text-gh-text transition-colors duration-300">
        {children}
        <Script
          defer
          src="https://datafa.st/js/script.js"
          data-website-id="dfid_GF1L1YMTUtbaXEHNdy15E"
          data-domain="gitflex.lol"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
