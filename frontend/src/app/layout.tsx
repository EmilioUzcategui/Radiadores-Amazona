import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "@n8n/chat/style.css";
import "./globals.css";
import { AppNavBar } from "../components/AppNavBar";
import { ThemeInitializer } from "../components/ThemeInitializer";
import AutoLogout from "../components/AutoLogout";

// 1. Configuramos la fuente Inter (para los textos generales)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// 2. Configuramos Space Grotesk (para esos títulos industriales gigantes)
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// 3. Metadatos de tu aplicación
export const metadata: Metadata = {
  title: "Dashboard | Radiadores Amazona",
  description: "Panel de métricas comerciales y métricas CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Agregamos la clase "dark" al html porque tus colores están pensados para modo oscuro
    <html lang="es"  // Aquí inyectamos las variables de las fuentes para que Tailwind las lea
      className={`dark ${inter.variable} ${spaceGrotesk.variable}`} >
      <body
        className="bg-surface text-on-surface font-body overflow-x-hidden antialiased"
      >
        <ThemeInitializer />
        <AutoLogout inactivityMs={300000} confirmTimeoutMs={15000} />
        <AppNavBar />

        {/* Aquí es donde Next.js inserta el contenido de page.tsx */}
        {children}
      </body>
    </html>
  );
}