import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dualism",
  description: "Edit LLM-generated code, preserving prompt/code pairs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <script
          defer
          data-domain="dualism.dev"
          src="https://plausible.io/js/script.js"
        ></script>
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
