"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Plus, Users, KeyRound, ArrowRight, UserCog, ShieldCheck, LayoutGrid, ArrowLeft, Trash2, Edit3, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [managerTeams, setManagerTeams] = useState<any[]>([]);
  const [memberTeams, setMemberTeams] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    setLoading(true);
    setAlertMessage(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) { router.push("/login"); return; }
      const userId = sessionData.session.user.id;

      const { data: teamsAsManager } = await supabase.from("teams").select("*").eq("owner_id", userId);
      setManagerTeams(teamsAsManager || []);

      const { data: memberships } = await supabase.from("team_members").select("role, team_id").eq("user_id", userId);
      const teamIds = memberships?.map((m: any) => m.team_id) || [];

      if (teamIds.length > 0) {
        const { data: teamsData } = await supabase.from("teams").select("*").in("id", teamIds);
        const managerIds = (teamsAsManager || []).map((t: any) => t.id);
        const finalFormatted = (teamsData || [])
          .map((team) => {
            const member = memberships!.find((m) => m.team_id === team.id);
            return { ...team, role: member?.role || "member" };
          })
          .filter((team) => !managerIds.includes(team.id));
        setMemberTeams(finalFormatted);
      }
    } catch (err) {
      setAlertMessage("Erro ao carregar os dados.");
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÕES DE GESTÃO ---

  const handleRenameTeam = async (e: React.MouseEvent, team: any) => {
    e.stopPropagation();
    const newName = prompt("Digite o novo nome da unidade:", team.name);
    if (!newName || newName === team.name) return;

    const { error } = await supabase.from("teams").update({ name: newName }).eq("id", team.id);
    if (error) alert("Erro: " + error.message);
    else loadTeams();
  };

  const handleDeleteTeam = async (e: React.MouseEvent, team: any) => {
    e.stopPropagation();
    const confirmCode = prompt(`ALERTA CRÍTICO: Digite o código [ ${team.code} ] para confirmar a destruição desta unidade:`);
    if (confirmCode !== team.code) return alert("Código incorreto. Operação cancelada.");

    const { error } = await supabase.from("teams").delete().eq("id", team.id);
    if (error) alert("Erro: " + error.message);
    else loadTeams();
  };

  async function handleJoinTeam() {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const { data: team } = await supabase.from("teams").select("id").eq("code", joinCode.trim().toUpperCase()).maybeSingle();
      if (!team) { setAlertMessage("Código inválido."); return; }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user.id;

      const { error } = await supabase.from("team_members").upsert({
        team_id: team.id,
        user_id: userId,
        role: "member",
        joined_at: new Date().toISOString(),
      });

      if (!error) {
        setJoinCode("");
        setAlertMessage("Sucesso! Você entrou na equipe.");
        loadTeams();
      } else {
        setAlertMessage("Você já faz parte desta unidade.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-black/95 to-neutral-900"></div>
        <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-12 relative z-10">
        <button 
          onClick={() => router.push("/dashboard")} 
          className="flex items-center gap-2 text-gray-500 hover:text-amber-500 transition-all mb-8 group uppercase text-[10px] font-black tracking-[0.2em]"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao Painel
        </button>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-4 py-1 mb-2 border border-amber-500/30 rounded-full bg-amber-500/10 backdrop-blur-sm text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase">
              <LayoutGrid size={12} /> Hub de Inteligência Estratégica
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
              Suas <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Equipes</span>
            </h1>
            <p className="text-gray-500 text-xl leading-relaxed max-w-2xl">
              Gerencie a sinergia entre talentos e maximize a performance coletiva através do mapeamento de personalidade.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Código de Acesso"
                className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl px-6 py-5 text-sm focus:border-amber-500/40 focus:bg-neutral-800/50 outline-none transition-all placeholder:text-neutral-700 text-white font-mono tracking-widest"
              />
              <button onClick={handleJoinTeam} className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-bold rounded-xl transition-all flex items-center justify-center group shadow-lg shadow-amber-500/10">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {alertMessage && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-10 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium flex items-center justify-between">
               <div className="flex items-center gap-3"><ShieldCheck size={20} /> {alertMessage}</div>
               <button onClick={() => setAlertMessage(null)}><XCircle size={18} className="opacity-50 hover:opacity-100" /></button>
            </motion.div>
          </AnimatePresence>
        )}

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-28">
            <section>
              <div className="flex items-center gap-4 mb-12">
                <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white/40 flex items-center gap-6 w-full">
                  <span className="whitespace-nowrap">Liderança e Gestão</span>
                  <div className="h-[1px] w-full bg-white/[0.05]" />
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                <motion.div
                  whileHover={{ y: -8 }}
                  onClick={() => router.push("/teams/create")}
                  className="cursor-pointer group relative h-[280px] rounded-[40px] border border-dashed border-white/[0.1] hover:border-amber-500/40 transition-all flex flex-col items-center justify-center gap-6 overflow-hidden bg-neutral-900/20 backdrop-blur-sm"
                >
                  <div className="w-20 h-20 rounded-3xl bg-neutral-800/50 border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500/30 transition-all duration-500">
                    <Plus size={32} className="text-amber-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/80 font-bold text-base uppercase tracking-widest group-hover:text-white transition-colors">Nova Equipe</p>
                    <p className="text-gray-600 text-[11px] uppercase mt-2 tracking-widest font-medium">Expandir Organização</p>
                  </div>
                </motion.div>

                {managerTeams.map((team) => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                    isOwner={true} 
                    onClick={() => router.push(`/teams/${team.id}`)}
                    onRename={(e: any) => handleRenameTeam(e, team)}
                    onDelete={(e: any) => handleDeleteTeam(e, team)}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-12">
                <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white/40 flex items-center gap-6 w-full">
                  <span className="whitespace-nowrap">Participação Colaborativa</span>
                  <div className="h-[1px] w-full bg-white/[0.05]" />
                </h2>
              </div>
              {memberTeams.length === 0 ? (
                <div className="p-20 rounded-[50px] border border-white/[0.03] bg-neutral-900/10 text-center backdrop-blur-sm">
                  <p className="text-gray-600 font-medium tracking-widest text-sm uppercase">Nenhuma participação colaborativa detectada</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                  {memberTeams.map((team) => (
                    <TeamCard key={team.id} team={team} isOwner={false} onClick={() => router.push(`/teams/${team.id}`)} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team, isOwner, onClick, onRename, onDelete }: any) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="relative group cursor-pointer h-[280px] rounded-[45px] bg-neutral-900/40 backdrop-blur-xl border border-white/5 p-10 flex flex-col justify-between overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-2xl"
    >
      <div className={`absolute top-0 right-0 w-48 h-48 blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${isOwner ? 'bg-amber-500' : 'bg-blue-500'}`} />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className={`p-4 rounded-2xl ${isOwner ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'} border border-white/[0.03]`}>
            {isOwner ? <UserCog size={26} /> : <Users size={26} />}
          </div>
          
          {/* CONTROLES ADMINISTRATIVOS */}
          <div className="flex items-center gap-2">
            {isOwner && (
              <div className="flex gap-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={onRename} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Edit3 size={14} /></button>
                 <button onClick={onDelete} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500/60 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
              </div>
            )}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/40 border border-white/5">
              <KeyRound size={14} className="text-neutral-600" />
              <span className="font-mono text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{team.code}</span>
            </div>
          </div>
        </div>
        <h3 className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors leading-tight truncate tracking-tighter">
          {team.name}
        </h3>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-black tracking-[0.3em] text-neutral-600">Cargo Estratégico</p>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isOwner ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-blue-500'}`} />
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
              {isOwner ? 'Diretor' : 'Estrategista'}
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-500">
          <ArrowRight size={24} className="text-amber-500" />
        </div>
      </div>
    </motion.div>
  );
}