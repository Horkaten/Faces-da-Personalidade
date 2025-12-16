"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  Loader2,
  User,
  Gauge,
  BrainCircuit,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * Página do Resultado Individual
 * Somente gestores podem acessar.
 * Exibe:
 * - Nome do membro
 * - Tipo / arquétipo
 * - Score
 * - Detalhes / respostas
 */

export default function TeamUserResultPage() {
  const params = useParams();
  const router = useRouter();

  const teamId = params.teamId as string;
  const userId = params.userId as string;

  const [result, setResult] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Sessão
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        router.push("/login");
        return;
      }

      const uid = sessionData.session.user.id;

      // Verificar se usuário é gestor da equipe
      const { data: memberData } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", uid)
        .maybeSingle();

      if (!memberData || memberData.role !== "manager") {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // Buscar resultado do membro
      const { data: res } = await supabase
        .from("eneagrama_results")
        .select("*, users(name)")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!res) {
        setResult(null);
        setLoading(false);
        return;
      }

      setResult(res);
      setUserName(res.users?.name || "Membro");
      setLoading(false);
    }

    load();
  }, [router, teamId, userId]);


  // ------ UI ------- //

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-neutral-400">
        <Loader2 className="animate-spin mr-2" /> Carregando resultado...
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-neutral-400">
        <p className="text-lg mb-4">Acesso negado.</p>
        <button
          onClick={() => router.push(`/teams/${teamId}`)}
          className="px-6 py-3 bg-white/10 rounded-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-neutral-500">
        <p className="mb-4">Este usuário ainda não respondeu o questionário.</p>
        <button
          onClick={() => router.push(`/teams/${teamId}`)}
          className="px-6 py-3 bg-white/10 rounded-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12">

      {/* Header */}
      <header className="mb-10 flex items-center justify-between">
        <button
          onClick={() => router.push(`/teams/${teamId}`)}
          className="text-neutral-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Voltar
        </button>
      </header>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto bg-neutral-900 border border-white/10 p-10 rounded-2xl shadow-2xl">

        {/* Nome */}
        <div className="flex items-center gap-4 mb-8">
          <User size={38} className="text-amber-400" />
          <div>
            <h1 className="text-3xl font-bold">{userName}</h1>
            <p className="text-neutral-500 text-sm">Resultado de personalidade</p>
          </div>
        </div>

        {/* Arquétipo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-xs text-neutral-400 uppercase mb-2">Arquétipo</div>
          <h2 className="text-4xl font-bold text-amber-400">{result.archetype}</h2>
          <p className="text-neutral-500 text-lg mt-1">{result.type}</p>
        </motion.div>

        {/* Score */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-neutral-300 mb-2">
            <Gauge size={20} className="text-yellow-400" />
            Afinidade: {result.score}%
          </div>

          <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.score}%` }}
              transition={{ duration: 0.9 }}
              className="h-full bg-gradient-to-r from-yellow-600 to-amber-400"
            />
          </div>
        </div>

        {/* Sessão de respostas (debug / opcional) */}
        <div className="mt-12 p-6 bg-neutral-800/50 border border-white/5 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BrainCircuit size={20} className="text-purple-400" />
            Resumo Geral
          </h3>

          <ul className="space-y-3 text-neutral-300 text-sm">
            <li><strong>Score bruto:</strong> {result.rawScore}</li>
            <li><strong>Pontuação por tipo:</strong></li>

            <ul className="ml-4 space-y-1 text-neutral-400">
              {Object.entries(result.sums || {}).map(([type, value]) => (
             <li key={type}>
             Tipo {type}: {value as number}
             </li>
             ))}

            </ul>
          </ul>
        </div>

      </div>
    </div>
  );
}
