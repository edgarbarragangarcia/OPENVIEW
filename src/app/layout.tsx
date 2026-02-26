import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  title: "Open View | Agencia de Software & Inteligencia Artificial",
  description:
    "Construimos el software que tu empresa necesitaba ayer. Plataformas digitales, IA y productos web a la medida en Colombia.",
  openGraph: {
    title: "Open View | Software & IA de Nivel World-Class",
    description:
      "Plataformas digitales, inteligencia artificial y productos web a la medida. Rápido, elegante, escalable.",
    url: "https://openview.com.co",
    siteName: "Open View",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-black font-sans antialiased selection:bg-white selection:text-black",
          inter.variable,
          syne.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
