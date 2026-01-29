import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PriceLens AI - Data-Driven Pricing Strategy",
  description: "Extract monetization signals and pricing strategies from customer interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
