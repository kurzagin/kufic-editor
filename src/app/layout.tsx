import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://khattat.krzgn.xyz"),
  applicationName: "Khattat",
  category: "design",
  title: {
    default: "Khattat: Geometric Kufic Design Tool",
    template: "%s | Khattat",
  },
  description:
    "Design, refine, and export geometric Kufic typography with a purpose-built grid-based web editor.",
  keywords: [
    "geometric Kufic",
    "Square Kufic",
    "Kufic typography",
    "Arabic calligraphy design",
    "grid-based design editor",
    "vector typography",
    "Khattat",
  ],
  authors: [{ name: "Kur Zagin", url: "https://krzgn.xyz" }],
  creator: "Kur Zagin",
  publisher: "Kur Zagin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Khattat: Geometric Kufic Design Tool",
    description:
      "Design, refine, and export geometric Kufic typography in a purpose-built grid-based web editor.",
    siteName: "Khattat",
    images: [
      {
        url: "/og.png",
        width: 1730,
        height: 909,
        alt: "Khattat geometric Kufic design workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khattat: Geometric Kufic Design Tool",
    description:
      "Design, refine, and export geometric Kufic typography in a purpose-built grid-based editor.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
