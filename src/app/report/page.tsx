"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Gauge,
  BrainCircuit,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * Report Premium (corrigido)
 * - Busca o resultado INDIVIDUAL mais recente (team_id IS NULL)
 * - Ordena por created_at DESC para garantir pegar o mais novo
 * - Mantém UI premium / animações
 */

export default function IndividualReportPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = (sessionData as any)?.session;

    if (!session) {
      router.push("/login");
      return;
    }

    const userId = session.user.id;

    // Buscar nome do usuário (se existir)
    const { data: profile } = await supabase
      .from("users")
      .select("name")
      .eq("id", userId)
      .maybeSingle();

    setUserName(profile?.name || session.user.email.split("@")[0]);

    // Buscar o resultado MAIS RECENTE sem team_id (ordenar DESC)
    const { data: res, error } = await supabase
      .from("eneagrama_results")
      .select("*")
      .eq("user_id", userId)
      .is("team_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar resultado:", error);
      // fallback: redirecionar ao questionário
      router.push("/questionnaire");
      return;
    }

    if (!res) {
      // nenhum resultado individual -> redireciona para questionário
      router.push("/questionnaire");
      return;
    }

    setResult(res);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-neutral-400">
        <Loader2 className="animate-spin mr-2" /> Carregando relatório...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">
      {/* Header */}
      <button
        onClick={() => router.push("/dashboard")}
        className="text-neutral-400 hover:text-white flex items-center gap-2 mb-8"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <h1 className="text-4xl font-bold mb-2">Seu Relatório</h1>
      <p className="text-neutral-400 mb-10">
        Análise completa do seu questionário individual.
      </p>

      <div className="max-w-4xl mx-auto bg-neutral-900 p-10 rounded-2xl border border-white/10 shadow-2xl">
        {/* Tipo e arquétipo */}
        <div className="mb-10">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
            Tipo Dominante
          </span>

          <h2 className="text-5xl font-bold mt-5 mb-4">{result.archetype}</h2>

          <p className="text-lg text-neutral-400">
            {result.type} — Afinidade{" "}
            <span className="text-amber-400 font-bold">{result.score}%</span>
          </p>

          {/* Barra de score */}
          <div className="w-full h-3 bg-neutral-800 rounded-full mt-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.score}%` }}
              transition={{ duration: 1.4 }}
              className="h-full bg-gradient-to-r from-amber-700 via-amber-500 to-white"
            />
          </div>
        </div>

        {/* Strengths */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Zap size={22} className="text-emerald-400" /> Seus Superpoderes
          </h3>

          {!result.strengths ? (
            <p className="text-neutral-500">Nenhum dado disponível.</p>
          ) : (
            <ul className="space-y-2">
              {result.strengths.map((s: string, i: number) => (
                <li key={i} className="text-neutral-300">
                  • {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Weaknesses */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={22} className="text-rose-400" /> Pontos de Atenção
          </h3>

          {!result.weaknesses ? (
            <p className="text-neutral-500">Nenhum dado disponível.</p>
          ) : (
            <ul className="space-y-2">
              {result.weaknesses.map((w: string, i: number) => (
                <li key={i} className="text-neutral-300">
                  • {w}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Wings */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BrainCircuit size={22} className="text-purple-400" /> Asas
          </h3>

          {!result.wings ? (
            <p className="text-neutral-500">Nenhuma asa identificada.</p>
          ) : (
            <div className="space-y-4">
              {result.wings.map((wing: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm text-neutral-400 mb-1">
                    <span>{wing.type}</span>
                    <span>{wing.score}%</span>
                  </div>

                  <div className="w-full h-2 bg-neutral-800 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${wing.score}%` }}
                      className="h-full bg-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug / Raw Data */}
        <div className="mt-16 p-6 bg-neutral-800/50 border border-white/5 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Resumo Técnico</h3>

          <p className="text-neutral-300 text-sm mb-3">Score bruto: {result.rawScore}</p>

          <p className="text-neutral-300 text-sm mb-2">Pontuação por tipo:</p>

          <ul className="ml-4 space-y-1 text-neutral-400 text-sm">
            {(Object.entries(result.sums || {}) as [string, number][]).map(
              ([type, value]) => (
                <li key={type}>
                  Tipo {type}: {value}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
