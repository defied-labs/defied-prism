import type { Metadata } from "next";

import { Inter, Lora } from "next/font/google";

import "../index.css";
import "@defied/prism-vue-demos/style.css";
import Providers from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Defied Prism: pick your stack",
  description:
    "Accessible components generated for React or Vue, styled with Tailwind or CSS Modules, written into your repo as code you own.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
