import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MyFinance",
  description: "Controle financeiro pessoal multiusuário",
};

// Fonte padrão (recomendação do shadcn/ui)
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased text-foreground",
          fontSans.variable
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
