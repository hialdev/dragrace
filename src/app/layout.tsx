import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";

const headline = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "THE STAR DRAG RACE | MOBIL 1 LUXE",
  description:
    "Defined by performance. Join the elite echelon of speed at Jakarta's premier automotive showcase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headline.variable} ${body.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
