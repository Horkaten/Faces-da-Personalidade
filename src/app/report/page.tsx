"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, BrainCircuit, Zap, AlertTriangle, Leaf, Target, Sparkles, 
  Compass, User, ShieldCheck, Flame, Eye, MessageSquare, Briefcase, 
  Fingerprint, Gem, Mountain, ArrowUpRight // <--- Adicionado aqui
} from "lucide-react";
import { motion } from "framer-motion";

type Superpoder = {
  titulo: string;
  frente: string;
  alta: string;
  desequilibrio: string;
  evolucao: string;
};

// --- BASE DE CONHECIMENTO EXPANDIDA (HARDCODED INTELLIGENCE) ---
const typeKnowledge: any = {
  "1": {
    vicio: "Raiva (Reprimida)", defesa: "Formação de Reação", virtude: "Serenidade",
    comunicacao: "Precisa, corretiva, lógica e focada em deveres.",
    lideranca: "Lidera pelo exemplo. Exigente, organizado e focado em qualidade total.",
    conselho: "Aceite que o 'bom o suficiente' muitas vezes é perfeito. Permita-se errar."
  },
  "2": {
    vicio: "Orgulho", defesa: "Repressão", virtude: "Humildade",
    comunicacao: "Elogiosa, focada no outro, empática e conselheira.",
    lideranca: "Líder servidor. Motiva a equipe através do relacionamento e apoio pessoal.",
    conselho: "Aprenda a dizer 'não' sem se sentir culpado. Suas necessidades também importam."
  },
  "3": {
    vicio: "Vaidade", defesa: "Identificação", virtude: "Veracidade",
    comunicacao: "Rápida, eficiente, vendedora e focada em resultados.",
    lideranca: "Inspirador e pragmático. Foca em metas, eficiência e imagem de sucesso.",
    conselho: "Separe quem você 'é' do que você 'faz'. Tire a máscara da performance."
  },
  "4": {
    vicio: "Inveja", defesa: "Introjeção", virtude: "Equanimidade",
    comunicacao: "Expressiva, subjetiva, dramática e focada em sentimentos.",
    lideranca: "Visionário criativo. Lidera com intuição e busca significado no trabalho.",
    conselho: "A disciplina é a chave da liberdade. Não dependa da inspiração para agir."
  },
  "5": {
    vicio: "Avareza", defesa: "Isolamento", virtude: "Desapego",
    comunicacao: "Técnica, breve, objetiva e focada em dados/fatos.",
    lideranca: "Estrategista técnico. Lidera planejando e delegando, evitando envolvimento emocional.",
    conselho: "O conhecimento só tem valor quando compartilhado. Conecte-se com o corpo."
  },
  "6": {
    vicio: "Medo", defesa: "Projeção", virtude: "Coragem",
    comunicacao: "Questionadora, cautelosa, lógica e focada em riscos.",
    lideranca: "Guardião do grupo. Lidera prevendo problemas e criando segurança para o time.",
    conselho: "Confie na sua própria bússola interna. A segurança está dentro, não fora."
  },
  "7": {
    vicio: "Gula", defesa: "Racionalização", virtude: "Sobriedade",
    comunicacao: "Rápida, entusiasmada, narrativa e focada em ideias futuras.",
    lideranca: "Inovador. Lidera gerando ideias e mantendo o clima otimista e ágil.",
    conselho: "Comprometa-se com o fim das coisas. A profundidade traz uma alegria que a novidade não traz."
  },
  "8": {
    vicio: "Luxúria (Intensidade)", defesa: "Negação", virtude: "Inocência",
    comunicacao: "Direta, assertiva, comandanda e focada na verdade crua.",
    lideranca: "O Comandante. Lidera com força, protege os seus e remove obstáculos.",
    conselho: "A vulnerabilidade não é fraqueza. É a maior demonstração de força que existe."
  },
  "9": {
    vicio: "Preguiça (Inércia)", defesa: "Narcotização", virtude: "Ação Correta",
    comunicacao: "Agradável, conciliadora, vaga e focada em evitar conflitos.",
    lideranca: "Diplomata. Lidera ouvindo todos os lados e buscando consenso harmonioso.",
    conselho: "Sua voz é necessária. O conflito é, às vezes, o único caminho para a paz real."
  }
};

const typeDynamics: any = {
  "1": { medo: "Ser mau/imperfeito", desejo: "Integridade", foco: "Erros e correção" },
  "2": { medo: "Não ser amado", desejo: "Ser necessário", foco: "Necessidades alheias" },
  "3": { medo: "Fracassar", desejo: "Ser valioso", foco: "Metas e imagem" },
  "4": { medo: "Não ter identidade", desejo: "Ser autêntico", foco: "O que falta" },
  "5": { medo: "Ser incapaz", desejo: "Competência", foco: "Conhecimento/Privacidade" },
  "6": { medo: "Ficar sem apoio", desejo: "Segurança", foco: "Perigos potenciais" },
  "7": { medo: "Sofrer/Tédio", desejo: "Felicidade", foco: "Possibilidades futuras" },
  "8": { medo: "Ser controlado", desejo: "Autonomia", foco: "Poder e justiça" },
  "9": { medo: "Conflito/Separação", desejo: "Paz interior", foco: "Harmonia do ambiente" },
};

export default function IndividualReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const session = (sessionData as any)?.session;
    if (!session) { router.push("/login"); return; }
    
    const userId = session.user.id;
    const { data: profile } = await supabase.from("users").select("full_name, name").eq("id", userId).maybeSingle();
    setUserName(profile?.full_name || profile?.name || session.user.email.split("@")[0]);

    const { data: res } = await supabase.from("eneagrama_results").select("*").eq("user_id", userId).is("team_id", null).order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (!res) { router.push("/questionnaire"); return; }
    
    // Normaliza superpoderes se necessário
    if (Array.isArray(res.superpoderes)) {
      res.superpoderes = res.superpoderes.map((p: any) => {
        if (typeof p === "object") return p;
        return { titulo: p, frente: "Força essencial.", alta: "Alto impacto.", desequilibrio: "Cuidado necessário.", evolucao: "Integração consciente." };
      });
    }
    setResult(res);
    setLoading(false);
  }

  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-amber-200"><Loader2 className="animate-spin w-10 h-10" /></div>;

  const info = typeKnowledge[result.type] || typeKnowledge["9"];
  const dynamic = typeDynamics[result.type] || typeDynamics["9"];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-amber-500/30 pb-20 overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_#1a150a_0%,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_#0a0a0a_0%,_transparent_50%)]"></div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 relative z-10 pt-12">
        <header className="flex justify-between items-center mb-16 border-b border-white/[0.03] pb-8">
          <button onClick={() => router.push("/dashboard")} className="group flex items-center gap-4 text-zinc-500 hover:text-amber-500 transition-all text-xs font-black uppercase tracking-[0.3em]">
            <div className="p-3 rounded-2xl border border-zinc-800 group-hover:border-amber-500/50 transition-all"><ArrowLeft size={16} /></div>
            Retornar
          </button>
          <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3">
            <Leaf size={14} /> Dossiê Completo
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
          
          {/* === COLUNA ESQUERDA: PERFIL CENTRAL === */}
          <div className="xl:col-span-8 space-y-12">
            
            {/* HERO CARD */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/30 border border-white/[0.05] p-12 lg:p-20 rounded-[60px] backdrop-blur-3xl relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 text-[25rem] font-black text-white/[0.02] italic select-none pointer-events-none">{result.type}</div>
              <div className="relative z-10">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500"><User size={32}/></div>
                  <div>
                    <h1 className="text-4xl font-medium text-white tracking-tighter">{userName}</h1>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Mapeamento de Personalidade</span>
                  </div>
                </div>
                
                <h2 className="text-7xl md:text-9xl font-serif italic text-white leading-none tracking-tight mb-12">{result.archetype}</h2>
                
                {/* 3 PILARES PSICOLÓGICOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5 group hover:border-amber-500/30 transition-all">
                     <div className="flex items-center gap-3 mb-3 text-red-400"><Flame size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Paixão (Vício)</span></div>
                     <p className="text-white text-lg font-bold">{info.vicio}</p>
                     <p className="text-xs text-zinc-500 mt-2 leading-relaxed">A emoção que distorce sua visão quando está no piloto automático.</p>
                  </div>
                  <div className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5 group hover:border-amber-500/30 transition-all">
                     <div className="flex items-center gap-3 mb-3 text-blue-400"><ShieldCheck size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Mecanismo de Defesa</span></div>
                     <p className="text-white text-lg font-bold">{info.defesa}</p>
                     <p className="text-xs text-zinc-500 mt-2 leading-relaxed">A estratégia inconsciente que você usa para evitar a dor.</p>
                  </div>
                  <div className="bg-amber-500/10 p-6 rounded-[32px] border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                     <div className="flex items-center gap-3 mb-3 text-amber-500"><Gem size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Virtude (Essência)</span></div>
                     <p className="text-amber-400 text-lg font-bold">{info.virtude}</p>
                     <p className="text-xs text-amber-500/60 mt-2 leading-relaxed">O estado elevado que você atinge quando está presente.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SEÇÃO: COMPORTAMENTO PROFISSIONAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-zinc-900/20 border border-white/[0.05] p-10 rounded-[48px]">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-3"><MessageSquare size={18} className="text-emerald-500"/> Estilo de Comunicação</h3>
                  <p className="text-zinc-400 text-sm leading-7 border-l-2 border-emerald-500/30 pl-4">{info.comunicacao}</p>
               </div>
               <div className="bg-zinc-900/20 border border-white/[0.05] p-10 rounded-[48px]">
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 flex items-center gap-3"><Briefcase size={18} className="text-blue-500"/> Estilo de Liderança</h3>
                  <p className="text-zinc-400 text-sm leading-7 border-l-2 border-blue-500/30 pl-4">{info.lideranca}</p>
               </div>
            </div>

            {/* SEÇÃO: DETALHAMENTO DE SUPERPODERES */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 ml-4">Mapeamento de Competências</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.superpoderes?.map((poder: Superpoder, i: number) => (
                    <div key={i} className="bg-zinc-900/20 border border-white/[0.05] p-8 rounded-[40px] hover:bg-zinc-900/40 transition-all">
                       <div className="flex justify-between items-start mb-4">
                          <h4 className="text-white font-bold uppercase">{poder.titulo}</h4>
                          <Zap size={16} className="text-amber-500" />
                       </div>
                       <div className="space-y-3">
                          <p className="text-[11px] text-zinc-500 leading-relaxed border-b border-white/5 pb-3">{poder.frente}</p>
                          <div className="flex items-center gap-2 text-[10px] text-emerald-400"><ArrowUpRight size={12}/> <span className="opacity-80">ALTA: {poder.alta}</span></div>
                          <div className="flex items-center gap-2 text-[10px] text-rose-400"><AlertTriangle size={12}/> <span className="opacity-80">RISCO: {poder.desequilibrio}</span></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

          </div>

          {/* === COLUNA DIREITA: ESTRUTURA INTERNA & EVOLUÇÃO === */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* O QUE TE MOVE (DINÂMICA) */}
            <div className="bg-zinc-900/30 border border-white/[0.05] p-10 rounded-[50px] backdrop-blur-3xl space-y-8">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-2"><Fingerprint size={16} className="text-amber-500"/> Estrutura Psíquica</h3>
              
              <div className="space-y-1">
                 <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Desejo Básico</span>
                 <p className="text-white text-lg font-medium leading-tight">{dynamic.desejo}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Medo Primário</span>
                 <p className="text-white text-lg font-medium leading-tight">{dynamic.medo}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Foco de Atenção</span>
                 <p className="text-white text-lg font-medium leading-tight">{dynamic.foco}</p>
              </div>
            </div>

            {/* ASAS */}
            <div className="bg-zinc-900/30 border border-white/[0.05] p-10 rounded-[50px]">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2"><BrainCircuit size={16} className="text-purple-500"/> Asas (Influências)</h3>
              <div className="space-y-8">
                {result.wings?.map((wing: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white mb-2"><span>Tipo {wing.type}</span><span>{wing.score}%</span></div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${wing.score}%` }} transition={{ duration: 1.5 }} className="h-full bg-purple-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CONSELHO DE MESTRE */}
            <div className="bg-amber-500 p-10 rounded-[50px] relative overflow-hidden text-black">
               <div className="relative z-10">
                  <h3 className="font-black text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-2"><Mountain size={16}/> Próximo Nível</h3>
                  <p className="font-bold text-xl leading-tight mb-4">"{info.conselho}"</p>
                  <div className="h-[1px] w-full bg-black/10 my-4" />
                  <p className="text-xs font-medium opacity-70">Sua evolução depende de integrar este conceito na sua rotina diária.</p>
               </div>
               <div className="absolute -bottom-10 -right-10 text-black/5 rotate-12"><Target size={150} /></div>
            </div>

            {/* FRAQUEZAS */}
            <div className="bg-zinc-900/30 border border-white/[0.05] p-10 rounded-[50px]">
              <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2"><AlertTriangle size={16}/> Pontos Cegos</h3>
              <ul className="space-y-4">
                {result.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-zinc-400 leading-relaxed"><div className="w-1 h-1 rounded-full bg-rose-500/50 mt-1.5 shrink-0" />{w}</li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}