import { Inter, JetBrains_Mono } from "next/font/google";

// Both are variable fonts — do NOT pass `weight`; that forces static
// instances and breaks the 400/500/600/700 range the type scale uses.
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-src",
});
