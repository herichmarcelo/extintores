"use client" 
 
 import { useState, useEffect } from "react" 
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" 
 import { Button } from "@/components/ui/button" 
 import { Input } from "@/components/ui/input" 
 import { Badge } from "@/components/ui/badge" 
 import { 
   Dialog, 
   DialogContent, 
   DialogDescription, 
   DialogFooter, 
   DialogHeader, 
   DialogTitle, 
   DialogTrigger, 
 } from "@/components/ui/dialog" 
 import { 
   Users, 
   ShieldAlert, 
   Search, 
   Filter, 
   UserPlus, 
   Eye, 
   ClipboardCheck, 
   MoreVertical, 
   ShieldCheck,
   Loader2,
   Lock
 } from "lucide-react" 
 import { motion } from "framer-motion" 
 import { getUsuarios, createUsuario, deleteUsuario } from "@/app/actions/usuarios"
 
 // Definição de Cores das Hierarquias 
 const ROLES = { 
   Administrador: { 
     nome: "Bombeiro (Admin)", 
     cor: "#ff1744", // Red Neon 
     bgShadow: "shadow-[0_8px_30px_rgba(255,23,68,0.15)]", 
     icon: ShieldAlert, 
     descricao: "Controle total do sistema" 
   }, 
   Gestor: { 
     nome: "Téc. Segurança", 
     cor: "#7c3aed", // Violet Neon 
     bgShadow: "shadow-[0_8px_30px_rgba(124,58,237,0.15)]", 
     icon: Eye, 
     descricao: "Auditoria e visualização" 
   }, 
   Inspetor: { 
     nome: "Brigadista", 
     cor: "#00e676", // Green Neon 
     bgShadow: "shadow-[0_8px_30px_rgba(0,230,118,0.15)]", 
     icon: ClipboardCheck, 
     descricao: "Exclusivo para vistorias" 
   },
   SESMT: { 
     nome: "SESMT", 
     cor: "#2979ff", // Blue Neon 
     bgShadow: "shadow-[0_8px_30px_rgba(41,121,255,0.15)]", 
     icon: ShieldCheck, 
     descricao: "Gestão de Segurança" 
   } 
 } 
 
 const container = { 
   hidden: { opacity: 0 }, 
   show: { opacity: 1, transition: { staggerChildren: 0.1 } } 
 } 
 
 const item = { 
   hidden: { y: 20, opacity: 0 }, 
   show: { y: 0, opacity: 1 } 
 } 
 
 export default function UsuariosPage() { 
   const [open, setOpen] = useState(false) 
   const [isSubmitting, setIsSubmitting] = useState(false) 
   const [usuarios, setUsuarios] = useState<any[]>([])
   const [isLoading, setIsLoading] = useState(true)

   const loadUsuarios = async () => {
     setIsLoading(true)
     const data = await getUsuarios()
     setUsuarios(data)
     setIsLoading(false)
   }

   useEffect(() => {
     loadUsuarios()
   }, [])
 
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
     e.preventDefault() 
     setIsSubmitting(true) 
     
     const formData = new FormData(e.currentTarget)
     const result = await createUsuario(formData)

     if (result.success) {
       setOpen(false)
       loadUsuarios()
     } else {
       alert(result.error)
     }
     setIsSubmitting(false)
   } 
 
   return ( 
     <motion.div 
       variants={container} 
       initial="hidden" 
       animate="show" 
       className="space-y-8 bg-slate-50/50 p-4 md:p-8 min-h-screen rounded-3xl" 
     > 
       {/* Cabeçalho */} 
       <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"> 
         <div> 
           <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> 
             Usuários 
           </h1> 
           <p className="text-slate-500 font-bold text-lg mt-1 uppercase tracking-widest"> 
             Controle de Acesso e Permissões 
           </p> 
         </div> 
         
         {/* Modal de Cadastro de Usuário */} 
         <Dialog open={open} onOpenChange={setOpen}> 
           <DialogTrigger asChild>
             <Button
               className="sm:w-auto w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-black uppercase tracking-widest rounded-full px-8 h-12 shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2" 
             > 
               <UserPlus className="h-5 w-5" /> 
               Novo Usuário 
             </Button>
           </DialogTrigger> 
           <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-8 bg-white"> 
             <form onSubmit={handleSubmit} className="space-y-6"> 
               <DialogHeader> 
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 shadow-[0_0_15px_rgba(37,99,235,0.1)]"> 
                   <ShieldCheck className="h-6 w-6 text-blue-600" /> 
                 </div> 
                 <DialogTitle className="text-2xl font-black text-slate-800 uppercase tracking-tighter"> 
                   Cadastrar Colaborador 
                 </DialogTitle> 
                 <DialogDescription className="font-bold text-slate-400"> 
                   Defina os dados e o nível de acesso ao Rota de Incêndio. 
                 </DialogDescription> 
               </DialogHeader> 
 
               <div className="space-y-5 mt-4"> 
                 <div className="space-y-2"> 
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label> 
                   <Input name="nome" placeholder="Ex: Herich Marcelo" required className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-blue-600 transition-all" /> 
                 </div> 
                 
                 <div className="space-y-2"> 
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label> 
                   <Input name="email" type="email" placeholder="usuario@belloalimentos.com" required className="rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-blue-600 transition-all" /> 
                 </div> 

                 <div className="space-y-2"> 
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label> 
                   <div className="relative">
                     <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                     <Input name="senha" type="password" placeholder="••••••••" required className="pl-12 rounded-xl border-slate-200 bg-slate-50 font-bold h-12 focus-visible:ring-blue-600 transition-all" /> 
                   </div>
                 </div> 
 
                 <div className="space-y-2"> 
                   <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Nível de Hierarquia (Cargo)</label> 
                   <select name="perfil" required className="w-full rounded-xl border border-slate-200 bg-slate-50 font-bold h-12 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer"> 
                     <option value="" disabled selected>Selecione a permissão...</option> 
                     <option value="Administrador">🔥 Bombeiro (Admin - Acesso Total)</option> 
                     <option value="Gestor">👁️ Técnico de Segurança (Auditor - Somente Leitura)</option> 
                     <option value="Inspetor">📋 Brigadista (Acesso restrito a Vistorias)</option> 
                     <option value="SESMT">🛡️ SESMT (Gestão de Segurança)</option> 
                   </select> 
                 </div> 
               </div> 
 
               <DialogFooter className="mt-8"> 
                 <Button 
                   type="submit" 
                   disabled={isSubmitting} 
                   className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-sm font-black uppercase tracking-widest shadow-[0_8px_25px_rgba(79,70,229,0.3)] transition-all" 
                 > 
                   {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmar Acesso"} 
                 </Button> 
               </DialogFooter> 
             </form> 
           </DialogContent> 
         </Dialog> 
       </div> 
 
       {/* Cards Explicativos de Hierarquia */} 
       <div className="grid gap-6 md:grid-cols-4"> 
         {Object.entries(ROLES).map(([key, role]) => ( 
           <motion.div key={key} variants={item}> 
             <Card className={`relative overflow-hidden border border-slate-100 ${role.bgShadow} hover:-translate-y-1 transition-all duration-300 group bg-white rounded-3xl h-full`}> 
               <div 
                 className="absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 blur-2xl" 
                 style={{ backgroundColor: role.cor }} 
               /> 
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10"> 
                 <CardTitle className="text-sm font-black text-slate-800 tracking-tight">{role.nome}</CardTitle> 
                 <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100"> 
                   <role.icon 
                     className="h-5 w-5 transition-transform group-hover:scale-110" 
                     style={{ color: role.cor, filter: `drop-shadow(0px 0px 8px ${role.cor}80)` }} 
                   /> 
                 </div> 
               </CardHeader> 
               <CardContent className="relative z-10 pt-2"> 
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed"> 
                   {role.descricao} 
                 </p> 
               </CardContent> 
             </Card> 
           </motion.div> 
         ))} 
       </div> 
 
       {/* Lista de Usuários */} 
       <motion.div variants={item} className="space-y-4"> 
         <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"> 
           <div className="relative flex-1 w-full group"> 
             <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" /> 
             <Input 
               placeholder="Pesquisar colaborador..." 
               className="pl-12 h-11 bg-slate-50 border-none rounded-xl text-sm focus-visible:ring-0 focus-visible:bg-slate-100 transition-all font-bold w-full" 
             /> 
           </div> 
           <Button variant="outline" className="h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest w-full sm:w-auto"> 
             <Filter className="mr-2 h-4 w-4" /> 
             Filtrar Cargo 
           </Button> 
         </div> 
 
         <div className="grid grid-cols-1 gap-4"> 
           {isLoading ? (
             <div className="flex items-center justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
             </div>
           ) : usuarios.map((user) => { 
             const roleInfo = ROLES[user.perfil as keyof typeof ROLES] || ROLES.Inspetor; 
             const isActive = true; // No schema atual não temos campo status, assumimos ativo
             
             return ( 
               <div key={user.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 lg:p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all gap-4"> 
                 
                 <div className="flex items-center gap-4 w-full lg:w-1/3"> 
                   <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 text-lg shrink-0 border border-slate-200 uppercase"> 
                     {user.nome.charAt(0)} 
                   </div> 
                   <div className="truncate"> 
                     <h4 className="font-black text-slate-800 tracking-tight truncate">{user.nome}</h4> 
                     <p className="text-xs font-bold text-slate-400 truncate">{user.email}</p> 
                   </div> 
                 </div> 
 
                 <div className="w-full lg:w-1/3 flex lg:justify-center"> 
                   <Badge 
                     className="border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm" 
                     style={{ backgroundColor: `${roleInfo.cor}15`, color: roleInfo.cor }} 
                   > 
                     <roleInfo.icon className="h-3.5 w-3.5" /> 
                     {roleInfo.nome} 
                   </Badge> 
                 </div> 
 
                 <div className="w-full lg:w-1/3 flex items-center justify-between lg:justify-end gap-4"> 
                   <div className="flex items-center gap-2"> 
                     <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-[#00e676] shadow-[0_0_8px_#00e676]' : 'bg-slate-300'}`} /> 
                     <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest"> 
                       Ativo 
                     </span> 
                   </div> 
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    onClick={async () => {
                      if (confirm('Deseja realmente excluir este usuário?')) {
                        await deleteUsuario(user.id);
                        loadUsuarios();
                      }
                    }}
                   > 
                     <MoreVertical className="h-5 w-5" /> 
                   </Button> 
                 </div> 
               </div> 
             ) 
           })}

           {!isLoading && usuarios.length === 0 && (
             <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
               <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum usuário cadastrado</p>
             </div>
           )}
         </div> 
       </motion.div> 
     </motion.div> 
   ) 
 }
