import type { NextConfig } from "next"; 
 
 // Diz para o TypeScript ignorar o aviso de que o next-pwa não tem @types oficiais 
 // @ts-expect-error 
 import withPWAInit from "next-pwa"; 
 
 const withPWA = withPWAInit({ 
   dest: "public", 
   disable: process.env.NODE_ENV === "development", // Desativa no modo de desenvolvimento para não bugar o cache local 
   register: true, 
   skipWaiting: true, 
 }); 
 
 const nextConfig: NextConfig = { 
   // Mantemos isso para a Vercel não estourar a memória (WorkerError) 
   typescript: { 
     ignoreBuildErrors: true, 
   }, 
   // Configuração obrigatória para o Next.js 16 
   turbopack: {}, 
 }; 
 
 export default withPWA(nextConfig); 
