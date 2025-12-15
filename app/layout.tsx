import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PySketch - Drawing to Python Turtle Code",
  description: "Draw on canvas and generate executable Python Turtle code. A visual programming tool for learning and creating with Python Turtle graphics.",
  keywords: ["Python", "Turtle", "Drawing", "Code Generator", "Educational", "Programming"],
  authors: [{ name: "PySketch" }],
  openGraph: {
    title: "PySketch - Drawing to Python Turtle Code",
    description: "Draw on canvas and generate executable Python Turtle code",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}
