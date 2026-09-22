import type { Metadata } from "next";
import { Noto_Sans, Fascinate } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const noto = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const fascinate = Fascinate({
  variable: "--font-fascinate",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Uulzy — Ulaanbaatar, planned together",
  description:
    "Find every place in Ulaanbaatar with real prices, build date plans, and find people to join your activities.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${noto.variable} ${fascinate.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-16">
          {children}
        </main>
        <footer className="border-t border-black/5 bg-white py-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft">
            <span>
              <span className="font-display text-primary">Uulzy</span> — Ulaanbaatar,
              planned together
            </span>
            <span>Prices are community estimates in MNT (₮)</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
