"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Users, ArrowLeft, BarChart3, Shield, Loader2,
  ChevronRight, Trophy, User, Trash2, Edit3, XCircle, Settings2, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [editMode, setEditMode] = useState(false);

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

        const isOwner = teamData?.owner_id === uid;
        const { data: membershipData } = await supabase.from("team_members").select("role").eq("team_id", teamId).eq("user_id", uid).maybeSingle();

        if (!isOwner && !membershipData) { router.push("/teams"); return; }
        const managerStatus = isOwner || membershipData?.role === "manager";
        if (mounted) setIsManager(managerStatus);

        // 2. BUSCA DE MEMBROS
        const { data: membersList } = await supabase
          .from("team_members")
          .select(`id, role, user_id, joined_at, users!user_id (id, name, full_name, email, avatar_url)`)
          .eq("team_id", teamId);
        
        if (mounted) setMembers(membersList || []);

        // 3. BUSCA DE RESULTADOS (Lógica Blindada por User ID)
        if (managerStatus && membersList && membersList.length > 0) {
          const memberUserIds = membersList.map(m => m.user_id);

          const { data: resList } = await supabase
            .from("eneagrama_results")
            .select("*")
            .in("user_id", memberUserIds) // Busca pelos IDs de quem está na equipe
            .order("created_at", { ascending: false });

          // Filtrar para pegar apenas o mais recente de cada usuário
          const uniqueResults = resList?.reduce((acc: any[], current) => {
            const exists = acc.find(item => item.user_id === current.user_id);
            if (!exists) acc.push(current);
            return acc;
          }, []);

          if (mounted) setResults(uniqueResults || []);
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

  // --- FUNÇÕES DE GESTÃO ---
  const handleRenameTeam = async () => {
    const newName = prompt("Novo nome para a unidade:", team?.name);
    if (!newName || newName === team?.name) return;
    const { error } = await supabase.from("teams").update({ name: newName }).eq("id", teamId);
    if (!error) setTeam({ ...team, name: newName });
  };

  const handleRemoveMember = async (memberUserId: string, name: string) => {
    if (memberUserId === team?.owner_id) return;
    if (!confirm(`Confirmar expulsão de ${name}?`)) return;
    const { error } = await supabase.from("team_members").delete().eq("team_id", teamId).eq("user_id", memberUserId);
    if (!error) setMembers(members.filter(m => m.user_id !== memberUserId));
  };

  const handleDeleteTeam = async () => {
    const confirmCode = prompt(`ATENÇÃO CRÍTICA: Digite o código [ ${team?.code} ] para APAGAR PERMANENTEMENTE a unidade:`);
    if (confirmCode !== team?.code) return;
    const { error } = await supabase.from("teams").delete().eq("id", teamId);
    if (!error) router.push("/teams");
  };

  const getMemberName = (memberObj: any) => {
    const profile = Array.isArray(memberObj?.users) ? memberObj.users[0] : memberObj?.users;
    return profile?.full_name || profile?.name || "Operador";
  };

  const getNameByUserId = (resUserId: string) => {
    const member = members.find(m => m.user_id === resUserId);
    return getMemberName(member);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-amber-500"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-black/95 to-neutral-900"></div>
        <div className="absolute top-[-5%] right-[-5%] w-[800px] h-[800px] bg-amber-500/[0.08] rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-12 relative z-10">
        
        <header className="mb-20">
          <div className="flex justify-between items-start mb-8">
            <button onClick={() => router.push("/teams")} className="flex items-center gap-3 text-gray-600 hover:text-amber-500 transition-all uppercase text-[11px] font-black tracking-[0.3em]">
              <ArrowLeft size={18} /> Voltar ao Hub
            </button>
            
            {isManager && (
              <button 
                onClick={() => setEditMode(!editMode)}
                className={`px-6 py-3 rounded-2xl border flex items-center gap-3 transition-all duration-500 ${editMode ? 'bg-amber-500 border-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
              >
                <Settings2 size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{editMode ? 'Sair da Gestão' : 'Configurações'}</span>
              </button>
            )}
          </div>

          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
            <div className="max-w-4xl">
              <div className="flex items-center gap-6 mb-4">
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">
                  {team?.name} <span className={gradientText}>Eneagrama</span>
                </h1>
                
                <AnimatePresence>
                  {editMode && (
                    <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={handleRenameTeam} className="p-4 rounded-full bg-amber-500 text-black hover:scale-110 transition-all shadow-xl">
                      <Edit3 size={20} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <div className="bg-white/[0.02] inline-block px-4 py-2 rounded-xl border border-white/[0.05] text-sm tracking-widest text-amber-500 font-mono">
                PROTOCOLO: {team?.code}
              </div>
            </div>
            
            <button 
              onClick={() => router.push(`/teams/${teamId}/analysis`)}
              className="px-10 py-5 rounded-[20px] bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-amber-500 transition-all shadow-2xl flex items-center gap-3"
            >
              <BarChart3 size={18} /> Gerar Análise Coletiva
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-10">
          
          <div className="2xl:col-span-3">
            <div className={`bg-neutral-900/40 backdrop-blur-2xl border rounded-[40px] p-10 transition-all duration-500 ${editMode ? 'border-amber-500/40' : 'border-white/5'}`}>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-10 flex items-center gap-3">
                <Users size={16} className="text-amber-500" /> Especialistas Ativos
              </h2>
              
              <div className="space-y-4">
                {members.map((m, i) => {
                  const isOwner = m.user_id === team?.owner_id;
                  const name = getMemberName(m);
                  return (
                    <div key={i} className={`flex items-center gap-4 p-5 rounded-[22px] border transition-all ${isOwner ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                      <div className={`w-12 h-12 rounded-xl overflow-hidden border shrink-0 ${isOwner ? 'border-amber-500' : 'border-white/10'}`}>
                        {m.users?.avatar_url ? <img src={m.users.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-gray-600"><User size={20}/></div>}
                      </div>
                      <div className="flex-1 truncate">
                        <span className={`text-[15px] font-bold ${isOwner ? 'text-amber-500' : 'text-white'}`}>{name}</span>
                      </div>
                      
                      <AnimatePresence>
                        {isOwner ? <Trophy size={16} className="text-amber-500" /> : editMode && (
                          <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onClick={() => handleRemoveMember(m.user_id, name)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                            <XCircle size={18} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence>
                {editMode && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mt-12 pt-10 border-t border-white/5">
                    <p className="text-[9px] text-red-500/50 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert size={12}/> Zona de Perigo</p>
                    <button onClick={handleDeleteTeam} className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 text-white transition-all text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                      <Trash2 size={14} /> Encerrar Unidade
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="2xl:col-span-9">
             <div className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[45px] p-10 lg:p-14">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60 mb-14">Relatórios Gerados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {results.map((r, i) => (
                    <motion.div key={i} whileHover={{ y: -10 }} onClick={() => router.push(`/teams/${teamId}/results/${r.user_id}`)} className="p-8 rounded-[35px] bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/30 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-8">
                         <div className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest">T-{r.type}</div>
                         <ChevronRight size={20} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {/* Pegamos o nome do membro baseado no user_id do resultado */}
                      <h4 className="text-2xl font-black text-white group-hover:text-amber-400 truncate tracking-tighter mb-4">{getNameByUserId(r.user_id)}</h4>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{r.archetype}</div>
                    </motion.div>
                  ))}
                </div>
                {results.length === 0 && (
                  <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px] text-gray-600 text-sm uppercase tracking-widest font-black">
                    Aguardando mapeamento dos especialistas...
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}