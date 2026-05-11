import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { HostProvider } from "./context/hostProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YT-GroupWatch",
  description: "A YouTube Watch-Together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col items-center justify-center font-[var(--font-dm-sans)]">
        <HostProvider>
            {children}
        </HostProvider>
      </body>
    </html>
  );
}