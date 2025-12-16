"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

/* -----------------------------------------
   QUESTIONÁRIO PREMIUM (INDIVIDUAL) - ATUALIZADO
   - Mantém toda UI premium do seu arquivo.
   - Calcula e salva: sums, counts, rawScore, strengths, weaknesses, wings.
   - Salva team_id: null (NULL real).
----------------------------------------- */

const QUESTIONS: { id: number; text: string; typeIndex: number }[] = [
  { id: 1, text: "Sou extremamente orientado(a) a metas, imagem de sucesso e eficiência.", typeIndex: 3 },
  { id: 2, text: "Meu foco principal é atender às necessidades dos outros e manter conexões.", typeIndex: 2 },
  { id: 3, text: "Tenho uma busca interna por autenticidade, profundidade e significado.", typeIndex: 4 },
  { id: 4, text: "Sou analítico(a), reservado(a) e priorizo a aquisição de conhecimento antes de agir.", typeIndex: 5 },
  { id: 5, text: "Tenho forte senso de identidade, estilo próprio e aversão ao que é comum/superficial.", typeIndex: 4 },
  { id: 6, text: "Procuro independência, controle sobre o ambiente e evitar vulnerabilidade.", typeIndex: 8 },
  { id: 7, text: "Valorizo a harmonia no grupo e evito ativamente a confrontação ou conflitos diretos.", typeIndex: 9 },
  { id: 8, text: "Sou enérgico(a), direto(a) e uso a assertividade para impor minha visão.", typeIndex: 8 },
  { id: 9, text: "Sou atento(a) aos detalhes e busco a perfeição para evitar erros ou críticas.", typeIndex: 1 },
  { id: 10, text: "Me adapto rapidamente a mudanças, sou otimista e busco sempre o que é novo e interessante.", typeIndex: 7 },
  { id: 11, text: "Tenho tendência a refletir profundamente sobre meus sentimentos e motivações complexas.", typeIndex: 4 },
  { id: 12, text: "Sinto-me à vontade em posições de liderança e em assumir responsabilidades públicas.", typeIndex: 3 },
  { id: 13, text: "Sou cauteloso(a), busco suporte de autoridade e me preparo para possíveis riscos.", typeIndex: 6 },
  { id: 14, text: "Sou calmo(a), observador(a) e prefiro ambientes de trabalho estruturados e discretos.", typeIndex: 5 },
  { id: 15, text: "Demonstro grande lealdade e dedicação a indivíduos, grupos ou causas nas quais confio.", typeIndex: 6 },
  { id: 16, text: "Procuro experimentar e colecionar boas experiências para manter meu engajamento.", typeIndex: 7 },
  { id: 17, text: "Tenho forte tendência a ser crítico(a) (de mim e dos outros) para alcançar melhorias.", typeIndex: 1 },
  { id: 18, text: "Priorizo eficiência e sou altamente competitivo(a) quando necessário.", typeIndex: 3 },
];

const TYPE_ARQUETYPES: { [k: number]: { name: string; archetype: string } } = {
  1: { name: "Tipo 1", archetype: "O Perfeccionista" },
  2: { name: "Tipo 2", archetype: "O Ajudador" },
  3: { name: "Tipo 3", archetype: "O Realizador" },
  4: { name: "Tipo 4", archetype: "O Individualista" },
  5: { name: "Tipo 5", archetype: "O Investigador" },
  6: { name: "Tipo 6", archetype: "O Leal" },
  7: { name: "Tipo 7", archetype: "O Entusiasta" },
  8: { name: "Tipo 8", archetype: "O Desafiador" },
  9: { name: "Tipo 9", archetype: "O Pacificador" },
};

/**
 * Mapeamento simples de strengths/weaknesses por tipo.
 * Você pode refinar textos depois — por enquanto são frases curtas úteis para o relatório.
 */
const TYPE_DETAILS: { [k: number]: { strengths: string[]; weaknesses: string[] } } = {
  1: {
    strengths: ["Consciencioso e ético", "Busca a excelência"],
    weaknesses: ["Autocrítico", "Rigidez em excesso"],
  },
  2: {
    strengths: ["Empático e solidário", "Constrói conexões"],
    weaknesses: ["Busca aprovação", "Dificuldade em dizer não"],
  },
  3: {
    strengths: ["Focado em resultados", "Adaptável e persuasivo"],
    weaknesses: ["Excessiva preocupação com imagem", "Impaciência emocional"],
  },
  4: {
    strengths: ["Autêntico e criativo", "Sensível às nuances emocionais"],
    weaknesses: ["Sentimento de inadequação", "Oscilações emocionais"],
  },
  5: {
    strengths: ["Analítico e independente", "Busca conhecimento profundo"],
    weaknesses: ["Isolamento", "Dificuldade em expressar emoções"],
  },
  6: {
    strengths: ["Leal e responsável", "Planejador atento a riscos"],
    weaknesses: ["Ansiedade", "Tendência a duvidar"],
  },
  7: {
    strengths: ["Otimista e enérgico", "Criativo em soluções"],
    weaknesses: ["Evasão de dor", "Falta de foco prolongado"],
  },
  8: {
    strengths: ["Assertivo e protetor", "Tomada de decisão rápida"],
    weaknesses: ["Dominância", "Dificuldade em mostrar vulnerabilidade"],
  },
  9: {
    strengths: ["Calmo e conciliador", "Estabilidade emocional"],
    weaknesses: ["Inércia", "Evita confrontos necessários"],
  },
};

export default function QuestionnairePage() {
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = (data as any)?.session;
        if (!session) {
          router.push("/login");
        }
      } catch (err) {
        console.error("Erro ao checar sessão:", err);
        router.push("/login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = QUESTIONS.length;
  const progress = Math.round((Object.keys(answers).length / total) * 100) || 0;

  function handleSetAnswer(qid: number, value: number) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }

  function goNext() {
    if (currentIndex < total - 1) setCurrentIndex((i) => i + 1);
  }
  function goPrev() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  // calcula tipo do eneagrama a partir das respostas
  const result = useMemo(() => {
    const sums: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (const q of QUESTIONS) {
      const v = answers[q.id] ?? 0;
      sums[q.typeIndex] += v;
    }

    // encontra o tipo com maior soma
    let bestType = 1;
    let bestScore = -Infinity;
    for (let t = 1; t <= 9; t++) {
      if (sums[t] > bestScore) {
        bestScore = sums[t];
        bestType = t;
      }
    }

    const counts: Record<number, number> = { 1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0 };
    for (const q of QUESTIONS) counts[q.typeIndex] += 1;
    const maxPossible = counts[bestType] * 5 || 1;
    const percent = Math.round((bestScore / maxPossible) * 100);

    // Calcular wings (adjacentes: n-1 e n+1 com wrap)
    const leftWing = bestType === 1 ? 9 : bestType - 1;
    const rightWing = bestType === 9 ? 1 : bestType + 1;
    const wingScoreLeft = Math.round((sums[leftWing] / (counts[leftWing] * 5 || 1)) * 100);
    const wingScoreRight = Math.round((sums[rightWing] / (counts[rightWing] * 5 || 1)) * 100);
    const wings = [
      { type: `Tipo ${leftWing}`, score: wingScoreLeft },
      { type: `Tipo ${rightWing}`, score: wingScoreRight },
    ];

    // strengths/weaknesses: combinações a partir de TYPE_DETAILS para o bestType
    const typeDetails = TYPE_DETAILS[bestType] || { strengths: [], weaknesses: [] };
    const strengths = typeDetails.strengths;
    const weaknesses = typeDetails.weaknesses;

    return {
      type: TYPE_ARQUETYPES[bestType].name,
      archetype: TYPE_ARQUETYPES[bestType].archetype,
      score: percent,
      rawScore: bestScore,
      sums,
      counts,
      wings,
      strengths,
      weaknesses,
      bestType,
    };
  }, [answers]);

  // enviar resultado para o Supabase
  async function handleSubmit() {
    if (Object.keys(answers).length < total) {
      setMessage("Por favor, responda todas as perguntas antes de enviar.");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = (sessionData as any)?.session;
      if (!session?.user) {
        setMessage("Sessão não encontrada. Faça login novamente.");
        setSaving(false);
        router.push("/login");
        return;
      }
      const userId = session.user.id;

      // Preparar payload completo (team_id = null para INDIVIDUAL)
      const payload = {
        user_id: userId,
        team_id: null,
        answers: answers,
        score: result.score,
        type: result.type,
        archetype: result.archetype,
        rawscore: result.rawScore,
        sums: result.sums,
        counts: result.counts,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        wings: result.wings,
      };

      // inserir no Supabase (tabela eneagrama_results)
      const { error } = await supabase.from("eneagrama_results").insert(payload);

      if (error) {
        console.error("SUPABASE ERROR:", error);
        setMessage("Erro ao salvar: " + (error.message ?? JSON.stringify(error)));
        setSaving(false);
        return;
      }

      // sucesso
      setMessage("Resultado salvo com sucesso!");
      setSaving(false);

      // redireciona para dashboard
      setTimeout(() => router.push("/dashboard"), 900);
    } catch (err: any) {
      console.error("Erro inesperado ao salvar resultado:", err);
      setMessage("Erro inesperado: " + (err?.message ?? String(err)));
      setSaving(false);
    }
  }

  const currentQuestion = QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen flex items-stretch bg-neutral-950 text-white font-sans">
      {/* LEFT (branding/visual) */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black items-center justify-center p-12 relative overflow-hidden shadow-xl">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-400/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow delay-500"></div>

        <div className="max-w-md text-center relative z-10">
          <div className="text-4xl font-extrabold tracking-wider uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent mb-6">
            Faces da Personalidade
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">Desbloqueie seu <span className="text-yellow-400">Mindset Estratégico</span></h2>
          <p className="text-neutral-300 text-lg mb-8 leading-relaxed">
            Esta é a sua jornada de autoconhecimento e desenvolvimento. As respostas sinceras são a base para um Relatório Estratégico que alavancará sua carreira e liderança.
          </p>

          <div className="bg-white/5 border border-amber-700/30 p-8 rounded-2xl shadow-lg backdrop-blur-sm">
            <h3 className="text-sm text-yellow-200 mb-4 font-semibold uppercase tracking-wide">Como Funciona</h3>
            <ol className="text-sm text-neutral-300 space-y-3 text-left list-decimal list-inside marker:text-yellow-400 marker:font-bold">
              <li>Responda sinceramente cada afirmação na escala.</li>
              <li>Utilize a escala de 1 (Discordo Totalmente) a 5 (Concordo Totalmente).</li>
              <li>Finalize para acessar seu Relatório Estratégico personalizado no dashboard.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* RIGHT (questionnaire) */}
      <div className="flex-1 lg:w-3/5 p-8 lg:p-16 flex flex-col justify-between">
        <div className="max-w-2xl w-full mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Mapeamento de Personalidade</h1>
              <p className="text-sm text-neutral-400">Através do Eneagrama, descubra seu Padrão Comportamental Dominante. <span className="font-semibold text-neutral-300">Progresso: {progress}%</span></p>
            </div>

            <div className="text-right">
              <div className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Seu Progresso</div>
              <div className="w-48 h-2.5 bg-neutral-800 rounded-full overflow-hidden mt-2 shadow-inner shadow-black/30">
                <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-500 ease-out" />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl text-sm bg-amber-500/10 border border-amber-600/30 text-amber-100 shadow-md"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-neutral-800/70 p-8 rounded-3xl border border-yellow-700/30 shadow-2xl shadow-black/40 relative"
          >
            <div className="absolute inset-0 rounded-3xl [background:radial-gradient(120%_120%_at_50%_50%,rgba(252,211,77,0.05)_0%,transparent_70%)] animate-pulse-light"></div>

            <div className="mb-8 relative z-10">
              <div className="text-xs text-neutral-400 uppercase tracking-widest mb-3">Questão {currentIndex + 1} de {total}</div>
              <h2 className="text-xl lg:text-2xl font-bold text-white leading-relaxed">{currentQuestion.text}</h2>
            </div>

            <div className="grid grid-cols-5 gap-4 relative z-10">
              {[1,2,3,4,5].map((v) => {
                const selected = answers[currentQuestion.id] === v;
                return (
                  <motion.button
                    key={v}
                    onClick={() => handleSetAnswer(currentQuestion.id, v)}
                    whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(245,158,11,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      py-4 rounded-xl text-base font-bold transition-all duration-200 ease-in-out
                      ${selected ? "bg-gradient-to-b from-yellow-400 to-yellow-600 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 text-neutral-200 hover:bg-white/10 border border-white/10"}
                    `}
                  >
                    {v}
                    <div className="text-xs text-neutral-400 mt-1 font-light whitespace-pre-line leading-tight">
                      {v === 1 ? "Discordo\nTotalmente" : v === 2 ? "Discordo" : v === 3 ? "Neutro" : v === 4 ? "Concordo" : "Concordo\nTotalmente"}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-10 relative z-10">
              <div className="flex gap-4">
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0 || saving}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 font-semibold"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Anterior
                </button>
                {currentIndex < total - 1 ? (
                  <button
                    onClick={goNext}
                    disabled={!answers[currentQuestion.id] || saving}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform duration-200 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Próxima <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={saving || Object.keys(answers).length < total}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 text-black font-bold text-lg shadow-2xl shadow-amber-500/30 hover:scale-[1.02] transition-transform duration-300 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {saving ? "Salvando..." : "Finalizar e Ver Relatório"}
                  </button>
                )}
              </div>

              <div className="text-sm text-neutral-400 font-semibold">
                <span className="text-amber-300">{Object.keys(answers).length}</span> de {total} respondidas
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 p-5 rounded-2xl bg-neutral-800/50 border border-white/10 text-sm shadow-inner shadow-black/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-neutral-400 uppercase tracking-wide">Prévia do Resultado</div>
                <div className="text-base text-white font-semibold mt-1">
                  {result.archetype}
                  {result.type && <span className="text-neutral-500"> ({result.type})</span>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs text-neutral-400 text-right uppercase tracking-wide">Afinidade</div>
                <div className="w-32 h-3 bg-neutral-700 rounded-full overflow-hidden shadow-inner shadow-black/20">
                  <div style={{ width: `${result.score}%` }} className="h-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-700 ease-out" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <footer className="mt-16 text-center text-neutral-600 text-xs border-t border-neutral-800 pt-8">
            <p>&copy; 2025 Faces da Personalidade. Todos os direitos reservados.</p>
        </footer>
      </div>

       <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.1); }
        }
        @keyframes pulse-light {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.005); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite ease-in-out;
        }
        .animate-pulse-light {
          animation: pulse-light 4s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
