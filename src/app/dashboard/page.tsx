"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FileText, User, LogOut, BarChart3, ChevronRight,
  BrainCircuit, Lock, Zap, AlertTriangle, Plus, KeyRound, Users,
  Target, ShieldCheck, Rocket, Eye, Heart, Anchor
} from "lucide-react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/* -------------------------------------------------------
   COMPONENTES AUXILIARES DE DESIGN
------------------------------------------------------- */
const enneagramTypes = [
  { id: 1, type: "Tipo 1", archetype: "O Perfeccionista", icon: Target, desc: "Precisão absoluta e metas assertivas." },
  { id: 2, type: "Tipo 2", archetype: "O Ajudador", icon: Heart, desc: "Coesão de cultura e suporte estratégico." },
  { id: 3, type: "Tipo 3", archetype: "O Realizador", icon: Zap, desc: "Foco em alta performance e resultados." },
  { id: 4, type: "Tipo 4", archetype: "O Individualista", icon: Eye, desc: "Autenticidade e visão criativa única." },
  { id: 5, type: "Tipo 5", archetype: "O Investigador", icon: BrainCircuit, desc: "Análise profunda e estratégia técnica." },
  { id: 6, type: "Tipo 6", archetype: "O Leal", icon: ShieldCheck, desc: "Segurança operacional e antecipação de riscos." },
  { id: 7, type: "Tipo 7", archetype: "O Entusiasta", icon: Rocket, desc: "Inovação constante e otimismo ágil." },
  { id: 8, type: "Tipo 8", archetype: "O Desafiador", icon: Anchor, desc: "Liderança impositiva e proteção de ativos." },
  { id: 9, type: "Tipo 9", archetype: "O Pacificador", icon: Users, desc: "Diplomacia e harmonia em grandes fluxos." },
];

function ProfileCard({ type, archetype, icon: Icon, description }: any) {
  return (
    <div className="relative group p-8 bg-neutral-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden hover:border-amber-500/40 transition-all duration-500 shadow-xl">
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 border border-white/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
          <Icon size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-amber-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">{type}</h3>
        <h4 className="text-white font-bold text-lg mb-3 tracking-tight">{archetype}</h4>
        <p className="text-gray-500 text-xs leading-relaxed max-w-[180px] group-hover:text-gray-300 transition-colors">{description}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   COMPONENTE: GEOMETRIA ENEAGRAMA (SETA REFINADA)
------------------------------------------------------- */
function EnneagramGeometry({ activeType }: { activeType: number }) {
  const CENTER = 50;
  const RADIUS = 40;
  
  const getPoint = (index: number) => {
    const angleDeg = (index * 40) - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    let typeNum = index === 0 ? 9 : index;
    return {
      id: typeNum,
      x: CENTER + RADIUS * Math.cos(angleRad),
      y: CENTER + RADIUS * Math.sin(angleRad),
      angle: angleDeg
    };
  };

  const points = Array.from({ length: 9 }, (_, i) => getPoint(i));
  const activePoint = points.find(p => p.id === activeType) || points[0];
  const p = (id: number) => points.find(pt => pt.id === id) || { x: 50, y: 50 };

  const tipX = CENTER + (activePoint.x - CENTER) * 0.92;
  const tipY = CENTER + (activePoint.y - CENTER) * 0.92;

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      <div className="absolute w-[80%] h-[80%] bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>

      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <defs>
          <filter id="neon-glow-fixed" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="beamGradient" x1="50" y1="50" x2={tipX} y2={tipY} gradientUnits="userSpaceOnUse">
             <stop offset="0%" stopColor="#b45309" stopOpacity="0.2" />
             <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r={RADIUS} stroke="#222" strokeWidth="0.6" fill="none" />
        <path d={`M${p(9).x},${p(9).y} L${p(6).x},${p(6).y} L${p(3).x},${p(3).y} Z`} stroke="#222" strokeWidth="0.6" fill="none" />
        <path d={`M${p(1).x},${p(1).y} L${p(4).x},${p(4).y} L${p(2).x},${p(2).y} L${p(8).x},${p(8).y} L${p(5).x},${p(5).y} L${p(7).x},${p(7).y} Z`} stroke="#222" strokeWidth="0.6" fill="none" />

        {activeType > 0 && (
          <g filter="url(#neon-glow-fixed)">
            <line x1="50" y1="50" x2={tipX} y2={tipY} stroke="url(#beamGradient)" strokeWidth="1.8" strokeLinecap="round" />
            <g transform={`translate(${tipX}, ${tipY}) rotate(${activePoint.angle + 90})`}>
              <path d="M -3.5 0 L 0 -7 L 3.5 0 L 0 -1.8 Z" fill="#ffffff" />
            </g>
          </g>
        )}

        <circle cx="50" cy="50" r="1.5" fill="#f59e0b" filter="url(#neon-glow-fixed)" />

        {points.map((pt) => {
          const isActive = pt.id === activeType;
          return (
            <g key={pt.id}>
              <text 
                x={pt.x} y={pt.y} 
                dx={(pt.x - 50) * 0.3} dy={(pt.y - 50) * 0.3 + 1.2}
                textAnchor="middle" alignmentBaseline="middle"
                fontSize={isActive ? 8 : 4.5} fontWeight={isActive ? "900" : "500"} 
                fill={isActive ? "#f59e0b" : "#333"}
                className="select-none font-mono transition-all duration-700"
              >
                {pt.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------
   DASHBOARD PAGE
------------------------------------------------------- */
export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Carregando...");
  const [loading, setLoading] = useState(true);
  const [managerTeams, setManagerTeams] = useState<any[]>([]);
  const [memberTeams, setMemberTeams] = useState<any[]>([]);
  const [individualResult, setIndividualResult] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) { router.push("/login"); return; }
      const userId = sessionData.session.user.id;

      const { data: profile } = await supabase.from("users").select("name").eq("id", userId).maybeSingle();
      setUserName(profile?.name || sessionData.session.user.email.split("@")[0]);

      const { data: teamsAsOwner } = await supabase.from("teams").select("*").eq("owner_id", userId);
      setManagerTeams(teamsAsOwner || []);

      const { data: memberships } = await supabase.from("team_members").select("role, team_id").eq("user_id", userId);
      if (memberships && memberships.length > 0) {
        const teamIds = memberships.map(m => m.team_id);
        const { data: teams } = await supabase.from("teams").select("*").in("id", teamIds);
        const filtered = (teams || []).filter(t => t.owner_id !== userId).map(t => {
          const mem = memberships.find(m => m.team_id === t.id);
          return { ...t, role: mem?.role || "member" };
        });
        setMemberTeams(filtered);
      }

      const { data: myResult } = await supabase.from("eneagrama_results")
        .select("*")
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

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };
  const openTeam = (id: string) => router.push(`/teams/${id}`);
  const hasResult = !!individualResult;
  const activeTypeNum = individualResult ? parseInt(individualResult.type?.replace(/\D/g, "") || "0") : 0;

  const gradientText = "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent";
  const primaryButton = "px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-bold text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 transition-all duration-300";
  const glassCard = "bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-3xl";

  return (
    <div className="min-h-screen w-full flex bg-black text-gray-200 font-sans overflow-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-black/90 to-neutral-900"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      {/* SIDEBAR */}
      <aside className="w-20 lg:w-64 h-screen border-r border-white/10 bg-black/60 backdrop-blur-md flex flex-col justify-between relative z-20">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg" />
          <span className={`hidden lg:block font-bold tracking-wider text-xs uppercase ${gradientText}`}>Faces da <br /> Personalidade</span>
        </div>
        <nav className="flex-1 px-4 space-y-3 mt-8">
          <SidebarBtn icon={<LayoutDashboard size={18} />} label="Visão Geral" active onClick={() => router.push("/dashboard")} />
          <SidebarBtn icon={<Users size={18} />} label="Minhas Equipes" onClick={() => router.push("/teams")} />
          <SidebarBtn icon={<FileText size={18} />} label="Questionário" onClick={() => router.push("/questionnaire")} />
          <SidebarBtn icon={<BarChart3 size={18} />} label="Relatório" onClick={() => router.push("/report")} disabled={!hasResult} locked={!hasResult} />
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          <SidebarBtn icon={<User size={18} />} label="Meu Perfil" onClick={() => router.push("/profile")} />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/10 text-xs uppercase tracking-wider font-bold"><LogOut size={18} /><span className="hidden lg:block">Sair</span></button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto relative z-10 p-6 lg:p-12 scrollbar-thin scrollbar-thumb-amber-900 scrollbar-track-black">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <div className="inline-block px-3 py-1 mb-2 border border-amber-500/30 rounded-full bg-amber-500/10 backdrop-blur-sm">
              <span className="text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase">Painel de Controle</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Olá, <span className={gradientText}>{userName}</span></h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => router.push("/teams/create")} className="group px-6 py-2 rounded-full border border-gray-700 text-white font-bold text-xs uppercase tracking-widest hover:border-amber-500/50 transition-all flex items-center gap-2">
              <Plus size={14} /> Criar Equipe
            </button>
            <button onClick={() => router.push("/teams")} className={primaryButton}>Minhas Equipes</button>
          </div>
        </header>

        {loading ? <div className="text-amber-500 animate-pulse">Carregando...</div> : (
          <div className="space-y-24">
            
            {/* --- RESULTADO ESTILO ENEAGRAMA --- */}
            {hasResult ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className={`${glassCard} p-8 lg:p-12 relative overflow-hidden group`}>
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[80px] group-hover:bg-amber-500/10 transition-all duration-1000"></div>
                  <div className="relative z-10 flex flex-col xl:flex-row items-center gap-12">
                    <div className="flex-1 text-center xl:text-left">
                      <p className="text-amber-500 font-bold uppercase tracking-[0.4em] text-[10px]">Arquétipo de Liderança</p>
                      <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none uppercase drop-shadow-2xl mb-4">
                        {individualResult.archetype}
                      </h2>
                      <div className="flex justify-center xl:justify-start items-center gap-4 text-xl mb-6">
                        <span className="text-gray-300 font-medium">{individualResult.type}</span>
                        <div className="h-[1px] w-10 bg-amber-500/50"></div>
                        <span className="text-amber-400 font-black tracking-tighter text-2xl">{individualResult.score}% Compatibilidade</span>
                      </div>
                      <button onClick={() => router.push("/report")} className="flex items-center gap-2 text-white/50 hover:text-amber-400 transition-colors uppercase text-[10px] font-bold tracking-widest mx-auto xl:mx-0">
                        Acessar Relatório Completo <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="w-full xl:w-[450px]">
                      <EnneagramGeometry activeType={activeTypeNum} />
                    </div>
                  </div>
                </div>

                {/* --- GRADE DE DIRECIONAMENTO --- */}
                <section className="space-y-12">
                  <div className="flex items-center gap-6 justify-center">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Direcionamento Estratégico</h2>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {enneagramTypes.map((t) => (
                      <ProfileCard key={t.id} type={t.type} archetype={t.archetype} icon={t.icon} description={t.desc} />
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <div className={`${glassCard} p-12 text-center relative overflow-hidden border-amber-500/30`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent"></div>
                <div className="relative z-10 max-w-2xl mx-auto py-10">
                  <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-tighter leading-tight">Descubra sua <br/> verdadeira face</h2>
                  <p className="text-gray-400 mb-8 text-lg">Inicie o questionário agora para desbloquear seu mapa de personalidade e insights estratégicos.</p>
                  <button onClick={() => router.push("/questionnaire")} className={primaryButton}>INICIAR AVALIAÇÃO AGORA</button>
                </div>
              </div>
            )}

            {/* --- SEÇÃO DE EQUIPES --- */}
            <section className="pb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded-full"></div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Suas Equipes</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...managerTeams, ...memberTeams].map((t, idx) => (
                  <motion.div key={idx} whileHover={{ y: -5 }} onClick={() => openTeam(t.id)} className="group cursor-pointer bg-neutral-900 border border-white/5 rounded-xl p-6 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full group-hover:bg-amber-500/10 transition-colors"></div>
                    <h3 className="font-bold text-xl text-white mb-2 group-hover:text-amber-400 transition-colors">{t.name}</h3>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Função</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${t.owner_id === t.user_id ? "bg-amber-900/30 text-amber-400 border border-amber-500/20" : "bg-gray-800 text-gray-300"}`}>
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
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function SidebarBtn({ icon, label, onClick, active = false, disabled = false, locked = false }: any) {
  return (
    <button onClick={disabled ? undefined : onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${active ? "bg-amber-500 text-black font-bold shadow-lg" : disabled ? "opacity-50 cursor-not-allowed text-gray-600" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
      <div className="relative z-10 flex items-center gap-4">{icon}<span className="hidden lg:block text-xs uppercase tracking-widest font-bold">{label}</span></div>
      {locked && <Lock size={14} className="ml-auto hidden lg:block text-gray-600" />}
    </button>
  );
}