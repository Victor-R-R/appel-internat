import type { Metadata } from "next";
import { Lato, Roboto } from "next/font/google";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Appel Internat - Internat d'Excellence de Sourdun",
  description: "Système de gestion d'appel pour l'Internat d'Excellence de Sourdun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${roboto.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
