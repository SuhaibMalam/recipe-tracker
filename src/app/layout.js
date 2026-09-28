import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const description =
  "Save the recipes you actually cook and see what they add up to — calories, protein, carbs and fat, day by day.";

export const metadata = {
  // Needed so the og:image URL (from app/opengraph-image.png) is absolute.
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description,
  openGraph: { title: SITE_NAME, description, type: "website" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
