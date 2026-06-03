import type { NextConfig } from "next"; 
 
 const nextConfig: NextConfig = { 
   // Mantemos isso para economizar memória na Vercel 
   typescript: { 
     ignoreBuildErrors: true, 
   }, 
   // No Next.js 16, o turbopack fica na raiz da configuração 
   turbopack: {}, 
 }; 
 
 export default nextConfig; 
