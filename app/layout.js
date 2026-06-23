import { Fredoka, Space_Mono } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata = {
  title: "Roomy — Find Your Perfect College Roommate",
  description:
    "Stop rooming with a stranger. Roomy matches you with roommates based on habits, vibe, and preferences — not luck. Built by students, for students.",
  keywords: [
    "roommate",
    "college",
    "roommate matching",
    "student housing",
    "SNU",
    "find roommate",
  ],
  openGraph: {
    title: "Roomy — Find Your Perfect College Roommate",
    description:
      "Match with roommates based on habits, vibe, and preferences — not luck.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roomy — Find Your Perfect College Roommate",
    description:
      "Match with roommates based on habits, vibe, and preferences — not luck.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${spaceMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Fontshare General Sans */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
