import type { Metadata } from "next";
import "./globals.css"; // Isso carrega o Tailwind

export const metadata: Metadata = {
  title: "SIAC - UTFPR",
  description: "Sistema de Identificação e Análise de Colônias",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>
        {children}
      </body>
    </html>
  );
}