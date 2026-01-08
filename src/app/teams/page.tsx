"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Plus, Users, KeyRound, ArrowRight, UserCog, ShieldCheck, LayoutGrid, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1 mb-2 border border-amber-500/30 rounded-full bg-amber-500/10 backdrop-blur-sm text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase"
            >
              <LayoutGrid size={12} /> Hub de Inteligência Estratégica
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
              Suas <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Equipes</span>
            </h1>
            <p className="text-gray-500 text-xl leading-relaxed max-w-2xl">
              Gerencie a sinergia entre talentos e maximize a performance coletiva através do mapeamento de personalidade.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <input 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Código de Acesso"
              className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl px-6 py-5 text-sm focus:border-amber-500 outline-none transition-all text-white font-mono uppercase tracking-widest"
            />
            <button onClick={handleJoinTeam} className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all">
              <ArrowRight size={20} />
            </button>
          </div>
        </header>

        {loading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
        ) : (
          <div className="space-y-20">
            <section>
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white/40 mb-10">Liderança e Gestão</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <div onClick={() => router.push("/teams/create")} className="cursor-pointer group h-[280px] rounded-[40px] border border-dashed border-white/10 hover:border-amber-500/40 transition-all flex flex-col items-center justify-center gap-4 bg-neutral-900/20">
                  <Plus size={32} className="text-amber-500" />
                  <p className="text-white/80 font-bold uppercase tracking-widest">Nova Equipe</p>
                </div>
                {managerTeams.map((team) => (
                  <TeamCard key={team.id} team={team} isOwner={true} onClick={() => router.push(`/teams/${team.id}`)} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white/40 mb-10">Participação Colaborativa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {memberTeams.map((team) => (
                  <TeamCard key={team.id} team={team} isOwner={false} onClick={() => router.push(`/teams/${team.id}`)} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team, isOwner, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="relative cursor-pointer h-[280px] rounded-[45px] bg-neutral-900/40 border border-white/5 p-10 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-2xl overflow-hidden"
    >
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl ${isOwner ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'}`}>
          {isOwner ? <UserCog size={26} /> : <Users size={26} />}
        </div>
        <div className="px-4 py-2 rounded-full bg-black/40 border border-white/5 text-[10px] font-mono font-bold text-neutral-500 tracking-widest uppercase">{team.code}</div>
      </div>
      <h3 className="text-3xl font-bold text-white tracking-tighter truncate">{team.name}</h3>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isOwner ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-blue-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{isOwner ? 'Diretor' : 'Estrategista'}</span>
      </div>
    </motion.div>
  );
}