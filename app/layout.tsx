import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MAYA Business — AI That Works While You Do",
  description:
    "MAYA Business is your always-on AI receptionist, lead manager and operations partner — so you can focus on what truly matters.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="image"
          href="/videos/night_poster.webp"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="antialiased selection:bg-neutral-500/20">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
