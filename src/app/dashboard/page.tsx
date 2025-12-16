"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  BarChart3,
  ChevronRight,
  BrainCircuit,
  Lock,
  Zap,
  AlertTriangle,
  Plus,
  KeyRound,
  Users,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/* -------------------------------------------------------
   DADOS DE DEMONSTRAÇÃO
------------------------------------------------------- */
const individualDemoResult = {
  archetype: "O Realizador",
  type: "Tipo 3",
  score: 92,
  strengths: ["Foco em Metas", "Eficiência", "Orientação a Resultado"],
  weaknesses: ["Impaciência", "Competitividade Excessiva"],
  wings: [
    { type: "Tipo 2", score: 40 },
    { type: "Tipo 4", score: 25 },
  ],
};

/* -------------------------------------------------------
   COMPONENTES AUXILIARES
------------------------------------------------------- */
function InfoCard({ title, icon, data }: any) {
  return (
    <div className="group p-6 bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-black transition-colors duration-300 text-amber-500">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <ul className="space-y-2">
        {(data ?? []).map((item: any, i: number) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-200 transition-colors"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------
   DASHBOARD CORRIGIDO
------------------------------------------------------- */
export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("Carregando...");
  const [loading, setLoading] = useState(true);
  const [managerTeams, setManagerTeams] = useState<any[]>([]);
  const [memberTeams, setMemberTeams] = useState<any[]>([]);
  const [individualResult, setIndividualResult] = useState<any>(null);

  useEffect(() => {
    // substitute inside useEffect -> loadData()
async function loadData() {
  setLoading(true);

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session) {
    router.push("/login");
    return;
  }
  const userId = sessionData.session.user.id;

  // Nome (igual)
  const { data: profile } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();
  setUserName(profile?.name || sessionData.session.user.email.split("@")[0]);

  // 1) Equipes onde é dono (igual — é simples e direto)
  const { data: teamsAsOwner, error: ownerErr } = await supabase
    .from("teams")
    .select("id, name, code, created_at, owner_id")
    .eq("owner_id", userId);
  if (ownerErr) console.error("teamsAsOwner err", ownerErr);
  setManagerTeams(teamsAsOwner || []);

  // 2) Buscar memberships (APENAS team_members) — sem join com teams
  const { data: memberships, error: membersErr } = await supabase
    .from("team_members")
    .select("role, team_id")
    .eq("user_id", userId);

  if (membersErr) {
    console.error("memberships err", membersErr);
    setMemberTeams([]);
  } else {
    const teamIds = Array.from(new Set((memberships || []).map((m: any) => m.team_id).filter(Boolean)));
    if (teamIds.length > 0) {
      // 3) Buscar os dados das teams em uma query separada (mais robusto com RLS)
      const { data: teamsFromMemberships, error: teamsErr } = await supabase
        .from("teams")
        .select("id, name, code, owner_id")
        .in("id", teamIds);

      if (teamsErr) {
        console.error("teamsFromMemberships err", teamsErr);
        setMemberTeams([]);
      } else {
        // Excluir times que o user já possui como owner (para não duplicar)
        const filtered = (teamsFromMemberships || []).filter((t: any) => t.owner_id !== userId);
        // Mapear para o formato esperado pelo UI (mantém campo role)
        // Encontrar o role em memberships
        const formatted = filtered.map((t: any) => {
          const mem = memberships.find((m: any) => m.team_id === t.id);
          return { role: mem?.role || "member", ...t };
        });
        setMemberTeams(formatted);
      }
    } else {
      setMemberTeams([]);
    }
  }

  // 4) Resultado Individual (igual)
  const { data: myResult } = await supabase
    .from("eneagrama_results")
    .select("archetype, type, score, created_at")
    .eq("user_id", userId)
    .is("team_id", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  setIndividualResult(myResult || null);
  setLoading(false);
}


    loadData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function openTeam(teamId: string) {
    router.push(`/dashboard/teams/${teamId}`);
  }

  const currentResult = individualResult
    ? {
        ...individualResult,
        strengths: individualDemoResult.strengths,
        weaknesses: individualDemoResult.weaknesses,
        wings: individualDemoResult.wings,
      }
    : individualDemoResult;

  const hasResult = !!individualResult;

  const gradientText =
    "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent";
  const primaryButton =
    "px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 transition-all duration-300";
  const glassCard =
    "bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-3xl";

  return (
    <div className="min-h-screen w-full flex bg-black text-gray-200 font-sans overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-neutral-900"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-800/20 rounded-full blur-[100px]"></div>
      </div>

      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 h-screen border-r border-white/10 bg-black/60 backdrop-blur-md flex flex-col justify-between relative z-20">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <span
            className={`hidden lg:block font-bold tracking-wider text-xs uppercase ${gradientText}`}
          >
            Faces da <br /> Personalidade
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-3 mt-8">
          <SidebarBtn
            icon={<LayoutDashboard size={18} />}
            label="Visão Geral"
            active
            onClick={() => router.push("/dashboard")}
          />
          <SidebarBtn
            icon={<Users size={18} />}
            label="Minhas Equipes"
            onClick={() => router.push("/teams")}
          />
          <SidebarBtn
            icon={<FileText size={18} />}
            label="Questionário"
            onClick={() => router.push("/questionnaire")}
          />
          <SidebarBtn
            icon={<BarChart3 size={18} />}
            label="Relatório"
            onClick={() => router.push("/report")}
            disabled={!hasResult}
            locked={!hasResult}
          />
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <SidebarBtn
            icon={<User size={18} />}
            label="Meu Perfil"
            onClick={() => router.push("/profile")}
          />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/10 hover:text-red-300 transition-all text-xs uppercase tracking-wider font-bold"
          >
            <LogOut size={18} />
            <span className="hidden lg:block">Sair</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10 p-6 lg:p-12 scrollbar-thin scrollbar-thumb-amber-900 scrollbar-track-black">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <div className="inline-block px-3 py-1 mb-2 border border-amber-500/30 rounded-full bg-amber-500/10 backdrop-blur-sm">
              <span className="text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                Painel de Controle
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Olá, <span className={gradientText}>{userName}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/teams/create")}
              className="group px-6 py-2 rounded-full border border-gray-700 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 hover:border-amber-500/50 transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={14} className="group-hover:text-amber-400 transition-colors" />{" "}
              Criar Equipe
            </button>
            <button
              onClick={() => router.push("/teams")}
              className={primaryButton}
            >
              Minhas Equipes
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center gap-3 text-amber-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>{" "}
            Carregando...
          </div>
        ) : (
          <div className="space-y-16">
            {/* --- RESULTADO INDIVIDUAL --- */}
            {hasResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className={`${glassCard} p-8 lg:p-12 relative overflow-hidden group`}>
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[80px] group-hover:bg-amber-500/10 transition-all duration-700"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div>
                      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Seu Arquétipo
                      </h2>
                      <h3 className="text-5xl lg:text-7xl font-extrabold text-white mb-4 tracking-tight leading-none">
                        {currentResult.archetype}
                      </h3>
                      <div className="flex items-center gap-4 text-xl">
                        <span className="text-gray-300">{currentResult.type}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span className="text-amber-400 font-bold">
                          {currentResult.score}% de Compatibilidade
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push("/report")}
                      className="w-20 h-20 rounded-full border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-500 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 bg-black/40 backdrop-blur-md"
                    >
                      <ChevronRight
                        size={32}
                        className="text-white group-hover:text-amber-400 transition-colors"
                      />
                    </button>
                  </div>

                  <div className="mt-10 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${currentResult.score}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoCard title="Superpoderes" icon={<Zap size={24} />} data={currentResult.strengths} />
                  <InfoCard title="Pontos de Atenção" icon={<AlertTriangle size={24} />} data={currentResult.weaknesses} />
                  <div className="group p-6 bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300 text-purple-400">
                      <BrainCircuit size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">Suas Asas</h3>
                    <div className="space-y-4">
                      {(currentResult.wings || []).map((wing: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs text-gray-400 mb-1 uppercase tracking-wider">
                            <span>{wing.type}</span>
                            <span>{wing.score}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${wing.score}%` }}
                              className="h-full bg-purple-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className={`${glassCard} p-12 text-center relative overflow-hidden border-amber-500/30`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent"></div>
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold text-white mb-6">Descubra sua verdadeira face</h2>
                  <p className="text-gray-400 mb-8 text-lg">
                    Você ainda não mapeou seu perfil. Inicie o questionário agora para desbloquear relatórios estratégicos e insights de carreira.
                  </p>
                  <button onClick={() => router.push("/questionnaire")} className={primaryButton}>
                    INICIAR AVALIAÇÃO AGORA
                  </button>
                </div>
              </div>
            )}

            {/* --- EQUIPES --- */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded-full"></div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Suas Equipes</h2>
              </div>

              {managerTeams.length === 0 && memberTeams.length === 0 ? (
                <div className="border border-dashed border-gray-700 rounded-2xl p-12 text-center hover:border-amber-500/50 transition-colors">
                  <p className="text-gray-500 mb-6">Você ainda não participa de nenhuma equipe estratégica.</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => router.push("/teams")}
                      className="text-amber-400 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors"
                    >
                      Entrar em Equipe
                    </button>
                    <span className="text-gray-700">|</span>
                    <button
                      onClick={() => router.push("/teams/create")}
                      className="text-amber-400 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors"
                    >
                      Criar Nova
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...managerTeams, ...memberTeams].map((t, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -5 }}
                      onClick={() => openTeam(t.id)}
                      className="group cursor-pointer bg-neutral-900 border border-white/5 rounded-xl p-6 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors"></div>

                      <h3 className="font-bold text-xl text-white mb-2 group-hover:text-amber-400 transition-colors">
                        {t.name}
                      </h3>

                      <div className="flex justify-between items-end mt-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Função</p>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              t.owner_id
                                ? "bg-amber-900/30 text-amber-400 border border-amber-500/20"
                                : "bg-gray-800 text-gray-300"
                            }`}
                          >
                            {t.owner_id ? "DONO" : "MEMBRO"}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Código</p>
                          <div className="flex items-center gap-1 text-gray-300 font-mono text-sm">
                            <KeyRound size={12} className="text-amber-500" /> {t.code}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------
   BOTÃO SIDEBAR
------------------------------------------------------- */
function SidebarBtn({ icon, label, onClick, active = false, disabled = false, locked = false }: any) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
        ${
          active
            ? "bg-amber-500 text-black font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            : disabled
            ? "opacity-50 cursor-not-allowed text-gray-600"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }
      `}
    >
      <div className="relative z-10 flex items-center gap-4">
        {icon}
        <span className="hidden lg:block text-xs uppercase tracking-widest font-bold">{label}</span>
      </div>

      {locked && <Lock size={14} className="ml-auto hidden lg:block text-gray-600" />}

      {!active && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
}
