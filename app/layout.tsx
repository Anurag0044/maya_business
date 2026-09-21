import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { PageLoadProvider } from "@/context/PageLoadContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MAYA Business",
  description:
    "MAYA Business is your always-on AI receptionist, lead manager and operations partner — so you can focus on what truly matters.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} data-theme="dark" suppressHydrationWarning>
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
        <ThemeProvider>
          <PageLoadProvider>{children}</PageLoadProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
