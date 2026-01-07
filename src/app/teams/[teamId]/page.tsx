"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Users, UserPlus, ArrowLeft, BarChart3, Shield, Loader2,
  ChevronRight, Zap, Globe, Trophy, User
} from "lucide-react";
import { motion } from "framer-motion";

export default function TeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);

  const gradientText = "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent";

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) { router.push("/login"); return; }
        const uid = sessionData.session.user.id;

        // 1. Dados da Equipe
        const { data: teamData } = await supabase.from("teams").select("*").eq("id", teamId).maybeSingle();
        if (mounted) setTeam(teamData || null);

        // 2. Validação de Membro/Gestor
        const { data: membershipData } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", uid)
          .maybeSingle();

        const isOwner = teamData?.owner_id === uid;
        if (!isOwner && !membershipData) { router.push("/teams"); return; }
        const managerStatus = isOwner || membershipData?.role === "manager";
        if (mounted) setIsManager(managerStatus);

        // 3. BUSCA DE MEMBROS COM JOIN (Garante que 'users' não venha nulo)
        const { data: membersList, error: mError } = await supabase
          .from("team_members")
          .select(`
            id, role, user_id, joined_at,
            users!user_id (id, name, full_name, email, avatar_url)
          `)
          .eq("team_id", teamId);

        if (mError) console.error("Erro na query de membros:", mError);
        if (mounted) setMembers(membersList || []);

        // 4. Busca de Resultados
        if (managerStatus) {
          const { data: resList } = await supabase
            .from("eneagrama_results")
            .select("*")
            .eq("team_id", teamId)
            .order("created_at", { ascending: false });
          if (mounted) setResults(resList || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [teamId, router]);

  // FUNÇÃO DE LEITURA REFORÇADA
  const getMemberName = (memberObj: any) => {
    const profile = Array.isArray(memberObj?.users) ? memberObj.users[0] : memberObj?.users;
    if (!profile) return "Sincronizando..."; 
    return profile.full_name || profile.name || profile.email?.split('@')[0] || "Operador";
  };

  const getNameByUserId = (resUserId: string) => {
    const member = members.find(m => m.user_id === resUserId);
    return getMemberName(member);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <Loader2 className="animate-spin h-12 w-12 text-amber-500" />
    </div>
  );

  const resultsForMembers = results.filter((r) => members.some(m => m.user_id === r.user_id));
  const respondentsCount = Array.from(new Set(resultsForMembers.map(r => r.user_id))).length;

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-black/95 to-neutral-900"></div>
        <div className="absolute top-[-5%] right-[-5%] w-[800px] h-[800px] bg-amber-500/[0.08] rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-12 relative z-10">
        <header className="mb-20">
          <button onClick={() => router.push("/teams")} className="flex items-center gap-3 text-gray-600 hover:text-amber-500 transition-all mb-8 group uppercase text-[11px] font-black tracking-[0.3em]">
            <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Voltar ao Hub
          </button>

          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
            <div className="max-w-4xl">
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">
                {team?.name} <span className={gradientText}>Eneagrama</span>
              </h1>
              <div className="flex items-center gap-6 mt-8">
                <div className="bg-white/[0.02] px-4 py-2 rounded-xl border border-white/[0.05] text-sm tracking-widest text-amber-500 font-mono uppercase">
                  Protocolo: {team?.code}
                </div>
              </div>
            </div>
            {isManager && (
              <button 
                onClick={() => router.push(`/teams/${teamId}/analysis`)}
                className="px-10 py-5 rounded-[20px] bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-500 transition-all shadow-2xl active:scale-95 flex items-center gap-3"
              >
                <BarChart3 size={18} /> Gerar Análise Coletiva
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-10">
          {/* LISTA DE MEMBROS - LIMPA */}
          <div className="2xl:col-span-3">
            <div className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-10 flex items-center gap-3">
                <Users size={16} className="text-amber-500" /> Especialistas Ativos
              </h2>
              <div className="space-y-4">
                {members.map((m, i) => {
                  const isOwner = m.users?.id === team?.owner_id || m.user_id === team?.owner_id;
                  const avatar = Array.isArray(m.users) ? m.users[0]?.avatar_url : m.users?.avatar_url;

                  return (
                    <div key={i} className={`flex items-center gap-4 p-5 rounded-[22px] border transition-all ${isOwner ? 'bg-amber-500/5 border-amber-500/20 shadow-lg' : 'bg-white/[0.02] border-white/[0.05]'} group hover:border-amber-500/30`}>
                      <div className={`w-12 h-12 rounded-xl overflow-hidden border shrink-0 ${isOwner ? 'border-amber-500' : 'border-white/10'}`}>
                        {avatar ? (
                          <img src={avatar} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-gray-600"><User size={20}/></div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 justify-center">
                        <span className={`text-[15px] font-bold truncate ${isOwner ? 'text-amber-500' : 'text-white'} group-hover:text-amber-400 transition-colors`}>
                          {getMemberName(m)}
                        </span>
                      </div>
                      {isOwner && <Trophy size={16} className="text-amber-500 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="2xl:col-span-9">
            {isManager ? (
              <div className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[45px] p-10 lg:p-14">
                <div className="flex justify-between items-center mb-14">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">Relatórios Gerados</h2>
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{respondentsCount} / {members.length} Mapeados</div>
                </div>

                {resultsForMembers.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-white/[0.05] rounded-[40px]">
                    <p className="text-gray-600 text-xs font-black uppercase tracking-[0.4em]">Aguardando dados...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {resultsForMembers.map((r, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        onClick={() => router.push(`/teams/${teamId}/results/${r.user_id}`)}
                        className="p-8 rounded-[35px] bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-8">
                           <div className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">T-{r.type}</div>
                           <ChevronRight size={20} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors tracking-tighter mb-4 truncate">
                          {getNameByUserId(r.user_id)}
                        </h4>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{r.archetype}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[45px] p-20 text-center">
                <Shield size={64} className="text-neutral-800 mb-8" />
                <h3 className="text-3xl font-black text-white uppercase mb-4">Acesso Gerencial Necessário</h3>
                <p className="text-gray-500 max-w-md mx-auto">Relatórios de terceiros só podem ser acessados pelo comando.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}