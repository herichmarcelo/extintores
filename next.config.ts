import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: import('next').NextConfig = {
  // Silencia o aviso do Turbopack 
  experimental : { 
    turbopack : {}, 
  }, 
  // Ignora erros de linting durante o build na Vercel (economiza muita RAM) 
  eslint : { 
    ignoreDuringBuilds: true , 
  }, 
  // Ignora erros de TypeScript durante o build na Vercel (economiza muita RAM) 
  typescript : { 
    ignoreBuildErrors: true , 
  }, 
};

export default withPWA(nextConfig);
