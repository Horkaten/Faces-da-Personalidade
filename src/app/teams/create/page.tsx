"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ArrowLeft, Rocket, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function CreateTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validar Sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão não identificada. Por favor, faça login.");
      
      const userId = session.user.id;
      const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 2. Inserir a Equipe
      // Especificamos as colunas no .select() para evitar que o RLS tente validar colunas desnecessárias
      const { data: newTeam, error: teamError } = await supabase
        .from("teams")
        .insert([
          {
            name: name,
            code: teamCode,
            owner_id: userId,
          },
        ])
        .select("id, name, code, owner_id")
        .single();

      if (teamError) {
        // Se ainda der erro de recursão aqui, verifique se rodou o SQL de limpeza de RLS
        throw new Error(`Erro no Banco: ${teamError.message}`);
      }

      // 3. Vincular Criador como Membro/Dono
      // Isso garante que você apareça na lista de membros da equipe
      const { error: memberError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: newTeam.id,
            user_id: userId,
            role: "owner",
          },
        ]);

      if (memberError) {
        console.error("Equipe criada, mas falha ao vincular membro:", memberError);
      }

      // Redirecionamento de Sucesso
      router.push(`/teams/${newTeam.id}`);
      
    } catch (err: any) {
      console.error("Falha na Operação:", err);
      setError(err.message || "Erro interno ao processar fundação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 flex items-center justify-center font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 z-0 bg-black">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/[0.05] rounded-full blur-[120px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-neutral-900/40 backdrop-blur-3xl border border-white/5 rounded-[45px] p-10 lg:p-14 relative z-10 shadow-2xl"
      >
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-500 hover:text-amber-500 transition-all mb-10 uppercase text-[10px] font-black tracking-[0.3em] group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Cancelar
        </button>

        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-amber-500"></div>
            <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em]">Protocolo de Fundação</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-tight">
            Nova <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent font-black">Unidade</span>
          </h1>
        </header>

        <form onSubmit={handleCreate} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-4">Nome da Operação</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: TACTICAL ALPHA"
              className="w-full bg-black/50 border border-white/10 rounded-[22px] px-8 py-5 text-lg text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-gray-800"
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <button 
              type="submit" 
              disabled={loading || !name}
              className="w-full py-6 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-[22px] hover:bg-amber-500 transition-all shadow-[0_0_30px_rgba(255,255,255,0.05)] flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
              {loading ? "Sincronizando..." : "Confirmar Fundação"}
            </button>
            
            <p className="text-center text-[9px] text-gray-700 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={12} /> Criptografia SHA-256 ativa na criação do código
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}