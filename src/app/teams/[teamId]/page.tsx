"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Users,
  UserPlus,
  ArrowLeft,
  BarChart3,
  Shield,
  CheckCircle,
  Loader2,
  CircleDashed,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TeamPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [debugMsg, setDebugMsg] = useState<string | null>(null);

  // Estilos de cor
  const amberGradient = "bg-gradient-to-r from-amber-400 to-yellow-600";
  const amberAccent = "text-amber-400";
  const amberBg = "bg-amber-500/10 border-amber-500/30";

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setFatalError(null);
      setDebugMsg(null);

      try {
        // Sessão
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("session error:", sessionError);
        }
        if (!sessionData?.session) {
          router.push("/login");
          return;
        }
        const uid = sessionData.session.user.id;
        if (!mounted) return;
        setUserId(uid);

        // 1) Buscar equipe
        const { data: teamData, error: teamErr } = await supabase
          .from("teams")
          .select("*")
          .eq("id", teamId)
          .maybeSingle();

        if (teamErr) {
          console.error("teams select error:", teamErr);
          if (teamErr?.status === 500) {
            setFatalError("Erro interno ao buscar equipe (RLS/policies).");
            setLoading(false);
            return;
          } else {
            setDebugMsg(`teamsErr: ${teamErr.message || JSON.stringify(teamErr)}`);
          }
        }

        if (!mounted) return;
        setTeam(teamData || null);

        // 2) Verifica vínculo do usuário na equipe
        const { data: membershipData, error: membershipErr } = await supabase
          .from("team_members")
          .select("role")
          .eq("team_id", teamId)
          .eq("user_id", uid)
          .maybeSingle();

        if (membershipErr) {
          console.error("member lookup error:", membershipErr);
          if (membershipErr?.status === 500) {
            setFatalError("Erro interno ao validar associação do usuário (RLS/policies).");
            setLoading(false);
            return;
          } else {
            setDebugMsg(`memberLookupErr: ${membershipErr.message || JSON.stringify(membershipErr)}`);
          }
        }

        const isOwner = teamData?.owner_id === uid;
        const isMember = !!membershipData;

        // SE NÃO FOR OWNER NEM MEMBRO → expulsar
        if (!isOwner && !isMember) {
          router.push("/dashboard/teams");
          return;
        }

        setIsManager(isOwner || membershipData?.role === "manager");

        // 3) Buscar membros da equipe — trazendo também dados do profile (users)
        const { data: membersList, error: membersErr } = await supabase
          .from("team_members")
          .select("id, role, user_id, joined_at, users(id, name, full_name, email)")
          .eq("team_id", teamId);

        if (membersErr) {
          console.error("members list error:", membersErr);
          if (membersErr?.status === 500) {
            setFatalError("Erro interno ao buscar membros (RLS/policies).");
            setLoading(false);
            return;
          } else {
            setDebugMsg(`membersErr: ${membersErr.message || JSON.stringify(membersErr)}`);
          }
        }

        const membersArr = membersList || [];
        // se owner não estiver presente em team_members, tentamos buscar o profile do owner e adicioná-lo temporariamente
        let finalMembers = [...membersArr];

        try {
          const ownerId = teamData?.owner_id;
          const ownerPresent = finalMembers.some((m) => m.user_id === ownerId);
          if (ownerId && !ownerPresent) {
            const { data: ownerProfile, error: ownerErr } = await supabase
              .from("users")
              .select("id, name, full_name, email")
              .eq("id", ownerId)
              .maybeSingle();

            if (!ownerErr && ownerProfile) {
              // adiciona como owner temporário (não persiste no banco)
              finalMembers = [
                { id: `owner-temp-${ownerProfile.id}`, role: "owner", user_id: ownerProfile.id, users: ownerProfile },
                ...finalMembers,
              ];
            } else {
              // se não foi possível buscar profile, adiciona um placeholder leve (apenas para exibição)
              finalMembers = [
                { id: `owner-temp-${ownerId}`, role: "owner", user_id: ownerId, users: { id: ownerId, name: null, full_name: null, email: null } },
                ...finalMembers,
              ];
            }
          }
        } catch (err) {
          console.warn("Não foi possível anexar owner ao members array:", err);
        }

        if (mounted) setMembers(finalMembers);

        // 4) Buscar resultados da equipe — somente para gestores
        if (isOwner || membershipData?.role === "manager") {
          const { data: resList, error: resErr } = await supabase
            .from("eneagrama_results")
            .select("id, user_id, team_id, type, archetype, score, created_at, rawscore")
            .eq("team_id", teamId)
            .order("created_at", { ascending: false });

          if (resErr) {
            console.error("results list error:", resErr);
            if (resErr?.status === 500) {
              setFatalError("Erro interno ao buscar resultados (RLS/policies).");
              setLoading(false);
              return;
            } else {
              setDebugMsg(`resultsErr: ${resErr.message || JSON.stringify(resErr)}`);
            }
            if (mounted) setResults([]);
          } else {
            if (mounted) setResults(resList || []);
          }
        } else {
          if (mounted) setResults([]);
        }
      } catch (err) {
        console.error("Unexpected error loading team page:", err);
        if (mounted) setFatalError("Erro inesperado ao carregar a equipe.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [router, teamId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-neutral-400">
        <Loader2 className="animate-spin mr-2 h-8 w-8 text-amber-500" />
        <p className="mt-3 text-lg">Carregando painel da equipe...</p>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-neutral-300 p-6">
        <p className="text-xl font-bold text-amber-400 mb-4">Erro</p>
        <p className="mb-6 text-center">{fatalError}</p>
        <p className="text-sm text-neutral-500 mb-4">
          Possíveis causas: policies RLS não configuradas corretamente no banco, ou sua sessão não está sendo enviada ao REST API.
        </p>
        {debugMsg && <p className="text-xs text-red-400 mb-4">DEBUG: {debugMsg}</p>}
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="px-6 py-3 rounded-lg bg-amber-500 text-black font-semibold"
        >
          Recarregar
        </button>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-neutral-400">
        <CircleDashed className="mr-2 h-8 w-8" />
        <p className="mt-3 text-lg">Equipe não encontrada ou você não tem acesso.</p>
        <button
          onClick={() => router.push("/dashboard/teams")}
          className="mt-6 text-amber-500 hover:text-amber-400 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>
    );
  }

  const formatRole = (role: string) => {
    if (role === "owner") return <span className="text-amber-500 font-bold">Dono(a)</span>;
    if (role === "manager") return <span className="text-yellow-400">Gestor</span>;
    return <span className="text-neutral-400">Membro</span>;
  };

  const handleGoBack = () => router.push("/dashboard/teams");

  // helper para pegar nome do usuário a partir do members array
  const getUserDisplay = (userIdToFind: string | null | undefined) => {
    if (!userIdToFind) return "Usuário";
    const m = members.find((mm) => mm.user_id === userIdToFind || mm.users?.id === userIdToFind);
    if (m?.users) {
      return m.users.full_name || m.users.name || m.users.email || userIdToFind;
    }
    return userIdToFind;
  };

  // contar resultados válidos referentes a membros
  const memberIds = members.map((m) => m.user_id || m.users?.id).filter(Boolean);
  const resultsForMembers = results.filter((r) => memberIds.includes(r.user_id));
  const uniqueRespondents = Array.from(new Set(resultsForMembers.map((r) => r.user_id)));

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-0 w-80 h-80 bg-neutral-800/10 rounded-full blur-[100px] delay-500" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="mb-12 border-b border-white/5 pb-6">
          <button onClick={handleGoBack} className="text-neutral-400 hover:text-amber-500 flex items-center gap-2 mb-4 transition">
            <ArrowLeft size={18} /> Voltar para Equipes
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-extrabold text-white">
                <span className={amberAccent}>Equipe</span> {team.name}
              </h1>
              <p className="text-lg text-neutral-500 mt-3">
                Código de Convite: <span className="text-amber-400 font-bold">{team.code}</span>
              </p>
            </div>

            {isManager && (
              <div className={`p-3 rounded-xl flex items-center gap-2 ${amberBg} transition-all`}>
                <Shield size={24} className="text-amber-500" />
                <span className="text-sm font-semibold text-amber-200">Acesso: Gestor</span>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-neutral-900/70 border border-white/10 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
                <Users size={20} className={amberAccent} /> Membros da Equipe ({members.length})
              </h2>

              <ul className="space-y-4">
                {members.map((m, index) => (
                  <li key={m.id ?? index} className="flex justify-between items-center text-neutral-300 border-b border-white/5 pb-2">
                    <span className="font-medium text-white">{m.users?.full_name ?? m.users?.name ?? m.users?.email ?? m.user_id ?? "Usuário"}</span>
                    <span className="text-xs">{formatRole(m.role)}</span>
                  </li>
                ))}
              </ul>

              {isManager && (
                <button onClick={() => alert("Função de convite implementada aqui!")} className={`mt-6 w-full ${amberBg} text-amber-200 font-semibold px-4 py-3 rounded-lg hover:bg-amber-500/20 transition flex justify-center items-center gap-2`}>
                  <UserPlus size={18} /> Convidar Membro
                </button>
              )}
            </motion.div>

            {!isManager && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className={`p-6 rounded-2xl shadow-xl ${amberBg} border-2 border-amber-500/50`}>
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-amber-200">
                  <CheckCircle size={20} /> Seu Progresso
                </h2>

                <p className="text-amber-100 mb-4">Responda o questionário para incluir seu perfil no relatório da equipe.</p>

                <button onClick={() => router.push(`/questionnaire?team=${teamId}`)} className={`w-full ${amberGradient} text-black font-bold px-5 py-3 rounded-lg hover:scale-[1.01] transition-transform flex justify-center items-center gap-2 shadow-lg shadow-amber-500/20`}>
                  Iniciar Questionário <ChevronRight size={18} />
                </button>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-2">
            {isManager ? (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="bg-neutral-900/70 border border-amber-500/20 p-8 rounded-2xl shadow-2xl shadow-black/40">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-amber-300">
                  <BarChart3 size={24} /> Relatórios de Membros ({uniqueRespondents.length} de {members.length})
                </h2>

                {resultsForMembers.length === 0 ? (
                  <p className="text-neutral-500 italic p-4 bg-neutral-800 rounded-lg">Nenhum membro respondeu ao questionário ainda.</p>
                ) : (
                  <ul className="space-y-4">
                    {resultsForMembers.map((r, i) => {
                      const name = getUserDisplay(r.user_id);
                      return (
                        <motion.li key={r.id ?? i} whileHover={{ scale: 1.01, backgroundColor: "rgba(50, 50, 50, 0.5)" }} onClick={() => router.push(`/dashboard/teams/${teamId}/results/${r.user_id}`)} className="bg-neutral-800 p-5 rounded-xl border border-white/5 hover:border-amber-500/40 transition cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-white">{name}</p>
                              <p className="text-sm text-neutral-400 mt-1">
                                <span className="font-medium text-amber-300">{r.archetype}</span> — Afinição: {r.score ?? r.rawscore ?? "N/A"}%
                              </p>
                            </div>

                            <ChevronRight size={20} className="text-amber-500" />
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}

                {resultsForMembers.length > 0 && (
                  <button onClick={() => alert("Análise Agregada da Equipe (Em breve!)")} className="mt-8 px-6 py-3 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 transition flex items-center gap-2">
                    Ver Análise Agregada
                    <BarChart3 size={18} />
                  </button>
                )}
              </motion.div>
            ) : (
              <div className="bg-neutral-900/70 border border-white/10 text-neutral-500 text-center py-16 rounded-2xl shadow-xl">
                <Shield size={40} className="mx-auto mb-3 text-neutral-700" />
                <p className="text-lg font-medium">Acesso Restrito</p>
                <p className="text-sm mt-1">Apenas gestores podem visualizar os relatórios detalhados da equipe.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
