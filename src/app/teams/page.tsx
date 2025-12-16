"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Plus, Users, KeyRound, ArrowRight, UserCog } from "lucide-react";
import { motion } from "framer-motion";

export default function TeamsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [managerTeams, setManagerTeams] = useState<any[]>([]);
  const [memberTeams, setMemberTeams] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Estilos de cor
  const amberGradient = "bg-gradient-to-r from-amber-400 to-yellow-600";
  const amberAccent = "text-amber-400";

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadTeams() {
    setLoading(true);
    setAlertMessage(null);

    try {
      // Sessão
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        router.push("/login");
        return;
      }
      const userId = sessionData.session.user.id;
      console.log("[loadTeams] session user:", userId);

      // ==========================
      // EQUIPES ONDE SOU GESTOR
      // ==========================
      const { data: teamsAsManager, error: mgrErr } = await supabase
        .from("teams")
        .select("*")
        .eq("owner_id", userId);

      if (mgrErr) {
        console.warn("[loadTeams] teamsAsManager err:", mgrErr);
      }
      setManagerTeams(teamsAsManager || []);
      const managerIds = (teamsAsManager || []).map((t: any) => t.id);

      // ==========================
      // EQUIPES ONDE SOU MEMBRO
      // ==========================
      const { data: memberships, error: memErr } = await supabase
        .from("team_members")
        .select("role, team_id")
        .eq("user_id", userId);

      if (memErr) {
        console.warn("[loadTeams] memberships err:", memErr);
      }

      const teamIds = memberships?.map((m: any) => m.team_id) || [];
      console.log("[loadTeams] member teamIds:", teamIds);

      let memberTeamsData: any[] = [];
      if (teamIds.length > 0) {
        const { data: teamsData, error: teamsErr } = await supabase
          .from("teams")
          .select("*")
          .in("id", teamIds);

        if (teamsErr) {
          console.warn("[loadTeams] teamsData err:", teamsErr);
        }
        memberTeamsData = teamsData || [];
      }

      // Combinar role do membership com dados do team (e remover duplicatas onde o usuário já é owner)
      const finalFormatted = memberTeamsData
        .map((team) => {
          const member = memberships!.find((m) => m.team_id === team.id);
          return {
            ...team,
            role: member?.role || "member",
          };
        })
        // NÃO remover por owner_id diretamente; em vez disso, evita duplicar times que já aparecem em managerTeams
        .filter((team) => !managerIds.includes(team.id));

      setMemberTeams(finalFormatted);
    } catch (err) {
      console.error("[loadTeams] unexpected error", err);
      setAlertMessage("Erro ao carregar equipes. Veja console para detalhes.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================
  // ENTRAR EM UMA NOVA EQUIPE
  // ==========================
  async function handleJoinTeam() {
    if (!joinCode.trim()) {
      setAlertMessage("Por favor, insira um código de equipe.");
      return;
    }

    setAlertMessage(null);
    setLoading(true);

    try {
      // 1. Buscar equipe pelo código
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("code", joinCode.trim())
        .maybeSingle();

      if (teamError) {
        console.error("[handleJoinTeam] teamError", teamError);
        setAlertMessage("Erro ao procurar equipe. Tente novamente.");
        return;
      }

      if (!team) {
        setAlertMessage("Código de equipe inválido ou equipe não encontrada.");
        return;
      }

      // 2. Ver sessão
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setAlertMessage("Faça login antes de entrar na equipe.");
        return;
      }
      const userId = sessionData.session.user.id;

      // 3. Checar se já é membro (evita erro RLS/sequelas)
      const { data: existingMember, error: existingErr } = await supabase
        .from("team_members")
        .select("id")
        .eq("user_id", userId)
        .eq("team_id", team.id)
        .maybeSingle();

      if (existingErr) {
        console.warn("[handleJoinTeam] existingMember check err", existingErr);
      }
      if (existingMember) {
        setAlertMessage("Você já é membro desta equipe.");
        await loadTeams();
        return;
      }

      // 4. Upsert membership (idempotente). Pode falhar por RLS se não estiver autenticado corretamente.
      const { error: insertError } = await supabase
        .from("team_members")
        .upsert({
          team_id: team.id,
          user_id: userId,
          role: "member",
          joined_at: new Date().toISOString(),
        }, { onConflict: ["team_id", "user_id"] });

      if (insertError) {
        const msg = (insertError.message || "").toLowerCase();
        console.warn("[handleJoinTeam] insertError", insertError);
        // Se for RLS ou duplicate, ignora porque o trigger ou outra ação pode ter criado a linha
        if (insertError.code === "23505" || msg.includes("row-level security") || msg.includes("duplicate")) {
          // ignora
        } else {
          setAlertMessage("Erro ao entrar na equipe. Tente novamente.");
          return;
        }
      }

      // 5. Atualizar UI
      await loadTeams();
      try { router.refresh(); } catch (e) { /* ok se não suportado */ }

      setJoinCode("");
      setAlertMessage("Você entrou na equipe com sucesso!");
    } finally {
      setLoading(false);
    }
  }

  // ROTA CORRIGIDA DE VOLTA PARA O ORIGINAL FUNCIONAL (SEM PREFIXO /dashboard)
  function handleOpenTeam(teamId: string) {
    router.push(`/teams/${teamId}`);
  }

  return (
    <div className="min-h-screen p-6 lg:p-12 bg-black text-white font-sans relative">
      {/* Efeito de Fundo (Similar ao Dashboard) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-neutral-800/10 rounded-full blur-[100px] animate-pulse-slow delay-500"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <h1 className="text-4xl font-extrabold mb-4">
          <span className={amberAccent}>Gestão</span> de Equipes
        </h1>
        <p className="text-neutral-500 text-lg mb-10">
          Visualize, crie e gerencie o desempenho dos grupos com o Eneagrama.
        </p>

        {loading && (
          <div className="p-8 text-center text-neutral-400">
            <svg className="animate-spin h-5 w-5 mr-3 inline-block text-amber-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando equipes...
          </div>
        )}

        {!loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">

            {/* ==== 1. SOU GESTOR ==== */}
            <section className="p-6 bg-neutral-900/50 rounded-2xl border border-amber-500/10 shadow-2xl shadow-black/30">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <UserCog size={24} className={amberAccent} />
                Minhas Equipes (Gestor)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Card: Criar nova equipe */}
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 30px rgba(245,158,11,0.2)" }}
                  onClick={() => router.push("/teams/create")}
                  className="cursor-pointer bg-neutral-900 border border-amber-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 group aspect-video min-h-[150px]"
                >
                  <Plus size={36} className={`${amberAccent} group-hover:scale-110 transition`} />
                  <p className="mt-4 text-sm font-semibold text-neutral-300">Criar Nova Equipe</p>
                  <p className="text-xs text-neutral-500">Gerenciar talentos</p>
                </motion.div>

                {/* Minhas equipes como gestor */}
                {managerTeams.map((team) => (
                  <motion.div
                    key={team.id}
                    whileHover={{ translateY: -3, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}
                    className="bg-neutral-800 border border-white/10 rounded-xl p-6 transition-all duration-200 cursor-pointer"
                    onClick={() => handleOpenTeam(team.id)}
                  >
                    <h3 className="font-bold text-lg mb-2 text-white">{team.name}</h3>

                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">Gestor</span>
                        <div className="flex items-center gap-1 text-neutral-400 text-sm">
                            <KeyRound size={14} />
                            <span className="font-mono text-xs">{team.code}</span>
                        </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ==== 2. SOU MEMBRO ==== */}
            <section className="p-6 bg-neutral-900/50 rounded-2xl border border-white/10 shadow-2xl shadow-black/30">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Users size={24} className="text-neutral-400" />
                Equipes Colaborativas
              </h2>

              {/* Caixa para entrar em equipe */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-800 border border-white/10 rounded-xl p-6 mb-8 shadow-inner shadow-black/20"
              >
                <div className="text-sm font-semibold text-neutral-300 mb-4">Entrar em uma Equipe Existente</div>

                {/* Mensagem de Alerta/Sucesso */}
                {alertMessage && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`mb-4 p-3 rounded text-sm ${
                        alertMessage.includes('sucesso') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-600/30' :
                        'bg-red-500/10 text-red-400 border border-red-600/30'
                    }`}
                  >
                    {alertMessage}
                  </motion.p>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    className="flex-1 bg-black border border-white/20 rounded-lg px-4 py-3 outline-none text-white focus:border-amber-500/50 transition duration-200 placeholder:text-neutral-500"
                    placeholder="Insira o código de acesso"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinTeam}
                    disabled={!joinCode.trim()}
                    className={`px-8 py-3 ${amberGradient} text-black font-bold rounded-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition disabled:opacity-50 disabled:shadow-none`}
                  >
                    <div className="flex items-center gap-2">
                        Entrar <ArrowRight size={18} />
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Minhas equipes como membro */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {memberTeams.length === 0 && managerTeams.length === 0 ? (
                    <p className="text-neutral-500 col-span-full italic p-4 bg-neutral-800/50 rounded-xl border border-white/5">
                        Você ainda não faz parte de nenhuma equipe. Crie uma acima ou entre com um código.
                    </p>
                ) : memberTeams.length === 0 && (
                    <p className="text-neutral-500 col-span-full italic">Você só gerencia equipes, mas ainda não é membro de nenhuma equipe colaborativa.</p>
                )}

                {memberTeams.map((team) => (
                  <motion.div
                    key={team.id}
                    whileHover={{ translateY: -3, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}
                    className="bg-neutral-800 border border-white/10 rounded-xl p-6 transition-all duration-200 cursor-pointer"
                    onClick={() => handleOpenTeam(team.id)}
                  >
                    <h3 className="font-bold text-lg mb-2 text-white">{team.name}</h3>

                    <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Membro</span>
                        <div className="flex items-center gap-1 text-neutral-400 text-sm">
                            <Users size={14} />
                            <span>Você é: {team.role === "manager" ? "Gestor" : "Membro"}</span>
                        </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </div>

    {/* Keyframe Styles for Animation */} 
    <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.05); opacity: 0.15; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
