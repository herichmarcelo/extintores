import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthSessionProvider from "@/components/SessionProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SplashScreen } from "@/components/SplashScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bello Alimentos - Gestão de Extintores",
  description: "Sistema de inspeção e controle de extintores e hidrantes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rota de Incêndio",
    // iOS usa a imagem splash como launch screen nativa
    startupImage: [
      // iPhone SE / 5s (320×568)
      { url: "/splash.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone 6/7/8 (375×667)
      { url: "/splash.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone X/XS/11 Pro (375×812)
      { url: "/splash.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone XR/11 (414×896)
      { url: "/splash.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
      // iPhone 12/13/14 (390×844)
      { url: "/splash.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 14 Pro / 15 (393×852)
      { url: "/splash.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      // iPhone 15 Pro Max / 14 Plus (430×932)
      { url: "/splash.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
    ],
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#B11226",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SplashScreen />
        <AuthSessionProvider>
          <TooltipProvider>
            {children}
            <PWAInstallPrompt />
          </TooltipProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
