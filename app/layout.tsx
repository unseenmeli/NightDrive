import type { Metadata } from "next";
import { Audiowide, Exo_2, Share_Tech_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const audiowide = Audiowide({ weight: "400", subsets: ["latin"], variable: "--font-audiowide" });
const exo = Exo_2({ subsets: ["latin"], variable: "--font-exo" });
const shareTech = Share_Tech_Mono({ weight: "400", subsets: ["latin"], variable: "--font-share-tech" });

export const metadata: Metadata = {
  title: "NightDrive",
  description: "Discover and plan scenic night drives.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${audiowide.variable} ${exo.variable} ${shareTech.variable}`}>
      <body className="flex flex-col">
        <Nav />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-20 sm:px-6">{children}</div>
        <footer className="border-t border-line/60 py-6 text-center font-mono text-[0.65rem] tracking-[0.3em] text-mist/60 uppercase">
          NightDrive · drive slow · lights low · 41.69°N 44.80°E
        </footer>
      </body>
    </html>
  );
}
