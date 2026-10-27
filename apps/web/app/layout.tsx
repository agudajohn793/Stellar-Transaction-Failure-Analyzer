import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar Transaction Failure Analyzer",
  description: "Decode Stellar transaction results and inspect documented failure causes.",
  applicationName: "Stellar Failure Analyzer"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
