"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CreateTeamPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let str = "";
    for (let i = 0; i < 6; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str.substring(0, 3) + "-" + str.substring(3);
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) {
      setErrorMsg("Nome da equipe é obrigatório.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.getUser();

      if (!user || sessionError) {
        setErrorMsg("Você precisa estar logado.");
        setLoading(false);
        return;
      }

      const ownerId = user.id;
      const code = generateCode();

      // Criar equipe — o trigger vai inserir o owner automaticamente
      const { data: newTeam, error: createError } = await supabase
        .from("teams")
        .insert({
          name: teamName.trim(),
          owner_id: ownerId,
          code,
        })
        .select()
        .single();

      if (createError) {
        setErrorMsg("Erro ao criar equipe: " + createError.message);
        setLoading(false);
        return;
      }

      // sem inserir nada em team_members — trigger resolve

      // Redirecionar
      router.push(`/teams/${newTeam.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10 max-w-xl mx-auto text-white">

      <h1 className="text-3xl font-bold mb-6">Criar Nova Equipe</h1>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-300">Nome da equipe</span>
          <input
            type="text"
            className="mt-1 w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 outline-none"
            placeholder="Ex: Equipe Comercial"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </label>

        <button
          onClick={handleCreateTeam}
          disabled={loading}
          className="w-full bg-amber-500 text-black font-bold p-3 rounded-lg flex justify-center items-center gap-2 hover:bg-amber-400 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Criando Equipe...
            </>
          ) : (
            "Criar Equipe"
          )}
        </button>
      </div>

    </div>
  );
}
