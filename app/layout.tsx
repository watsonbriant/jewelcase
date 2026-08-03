import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Jewel Case",
    template: "%s – Jewel Case",
  },
  description:
    "Music reviews from someone who alphabetized their CD tower.",
  icons: {
    icon: [
      { url: "/brand/symbol-on-dark-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/symbol-on-dark-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/brand/app-icon-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
