"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  Loader2,
  User,
  Sparkles,
  Compass,
  Lightbulb,
  ArrowUpRight,
  Zap,
  Leaf,
  Target,
  BarChart
} from "lucide-react";
import { motion } from "framer-motion";

export default function TeamUserResultPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const userId = params.userId as string;

  const [result, setResult] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: res } = await supabase
        .from("eneagrama_results")
        .select(`*, users:user_id (full_name, name)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (res) {
        setResult(res);
        const profile = Array.isArray(res.users) ? res.users[0] : res.users;
        setUserName(profile?.full_name || profile?.name || "Membro");
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-amber-200 gap-4">
      <Loader2 className="animate-spin w-10 h-10" />
      <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Sincronizando Dossiê...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-amber-500/30 pb-20 overflow-x-hidden">
      {/* BACKGROUND PREMIUM */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_#1a150a_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_#0a0a0a_0%,_transparent_50%)]"></div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 lg:px-16 relative z-10 pt-12">
        
        {/* HEADER ESTRUTURAL */}
        <header className="flex justify-between items-center mb-12 border-b border-white/[0.03] pb-8">
          <button
            onClick={() => router.push(`/teams/${teamId}`)}
            className="group flex items-center gap-4 text-zinc-500 hover:text-amber-500 transition-all text-xs font-black uppercase tracking-[0.3em]"
          >
            <div className="p-3 rounded-2xl border border-zinc-800 group-hover:border-amber-500/50 group-hover:bg-amber-500/5 transition-all">
              <ArrowLeft size={16} />
            </div>
            Voltar ao Hub
          </button>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-white/[0.02] text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <Target size={14} className="text-amber-500" /> Referência: {result?.type}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">
              <Leaf size={14} /> Desenvolvimento de Elite
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-stretch">
          
          {/* PAINEL DE IDENTIDADE (COLUNA ESQUERDA) */}
          <div className="xl:col-span-8 space-y-8 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/30 border border-white/[0.05] p-12 lg:p-16 rounded-[60px] backdrop-blur-3xl flex-1 relative overflow-hidden"
            >
              {/* Marca d'água de fundo */}
              <div className="absolute -bottom-10 -right-10 text-[15rem] font-black text-white/[0.02] pointer-events-none italic select-none">
                {result?.type}
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-8 mb-20 relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-700 p-[1px] shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                  <div className="w-full h-full bg-zinc-950 rounded-3xl flex items-center justify-center text-amber-500">
                    <User size={40} />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-6xl font-medium text-white tracking-tighter">{userName}</h1>
                  <p className="text-amber-500/50 font-black uppercase tracking-[0.4em] text-[10px] mt-2 flex items-center gap-2">
                    <Sparkles size={12} /> Dossiê Individual Ativado
                  </p>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600 block">Arquétipo Dominante</span>
                {/* Fonte responsiva para não estourar */}
                <h2 className="text-6xl md:text-8xl lg:text-9xl xl:text-[7vw] font-serif italic text-white leading-none tracking-tight">
                  {result?.archetype}
                </h2>
                <div className="flex flex-wrap gap-4 mt-8">
                   <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                    <Compass size={16} className="text-amber-500" /> Mapa Mental: Tipo {result?.type}
                  </div>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest">
                    Afinidade: {result?.score}%
                  </div>
                </div>
              </div>
            </motion.div>

            {/* INSIGHTS DE PERFORMANCE EXPANDIDOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900/20 border border-white/[0.05] p-10 rounded-[48px] backdrop-blur-sm group hover:bg-zinc-900/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                  <Lightbulb size={24} />
                </div>
                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Núcleo de Potencial</h4>
                <p className="text-zinc-500 text-base leading-relaxed">
                  Este perfil manifesta uma tendência natural para {result?.type === '4' ? 'autenticidade profunda e sensibilidade estética' : result?.type === '8' ? 'liderança assertiva e proteção do grupo' : 'equilíbrio e suporte estratégico'}.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-900/20 border border-white/[0.05] p-10 rounded-[48px] backdrop-blur-sm group hover:bg-zinc-900/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Motor de Engajamento</h4>
                <p className="text-zinc-500 text-base leading-relaxed">
                  A energia central de <span className="text-amber-500/70">{result?.archetype}</span> é otimizada quando há espaço para {result?.type === '4' ? 'expressão criativa' : 'domínio de desafios'}.
                </p>
              </motion.div>
            </div>
          </div>

          {/* ANÁLISE QUANTITATIVA (COLUNA DIREITA) */}
          <div className="xl:col-span-4 space-y-8 flex flex-col">
            <motion.div 
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/30 border border-white/[0.05] p-12 rounded-[60px] backdrop-blur-3xl flex-1"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] flex items-center gap-3">
                  <BarChart size={16} className="text-amber-500" /> Sinergia de Tipos
                </h3>
                <ArrowUpRight size={18} className="text-zinc-700" />
              </div>

              <div className="space-y-10">
                {Object.entries(result?.sums || {}).sort((a:any, b:any) => b[1] - a[1]).map(([type, value]) => (
                  <div key={type} className="group">
                    <div className="flex justify-between items-end mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black w-6 h-6 rounded-md flex items-center justify-center border ${Number(type) === result?.type ? 'bg-amber-500 border-amber-500 text-black' : 'border-zinc-800 text-zinc-600'}`}>
                          {type}
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${Number(type) === result?.type ? 'text-white' : 'text-zinc-500'}`}>
                          Vetor {type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-amber-500/50">{value as number} pts</span>
                    </div>
                    <div className="h-[2px] w-full bg-zinc-800/50 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Math.min((value as number / 40) * 100, 100)}%` }}
                         transition={{ duration: 1.5, ease: "circOut" }}
                         className={`h-full transition-all ${Number(type) === result?.type ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-zinc-700'}`}
                       />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 p-8 rounded-[40px] bg-amber-500/5 border border-amber-500/10 relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <Leaf size={40} />
                </div>
                <p className="text-[12px] leading-relaxed text-amber-200/40 text-center italic font-serif relative z-10">
                  "O autoconhecimento é o início da sabedoria. Este mapa indica onde sua luz brilha com mais intensidade."
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}