import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { eneagrama } from "@/lib/data";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, sums } = body;

    if (!user_id || !sums) {
      return NextResponse.json(
        { error: "Payload inválido" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1️⃣ Determinar tipo dominante
    let bestType = "1";
    let bestScore = -Infinity;

    for (const [type, score] of Object.entries(sums)) {
      if ((score as number) > bestScore) {
        bestScore = score as number;
        bestType = type;
      }
    }

    const profile = eneagrama[Number(bestType)];

    if (!profile) {
      throw new Error("Perfil de eneagrama não encontrado");
    }

    // 2️⃣ Superpoderes
    const superpoderes =
  Array.isArray(profile.superpoderes) && profile.superpoderes.length
    ? profile.superpoderes
    : [
        {
          titulo: "Execução Estratégica",
          frente: "Capacidade de transformar metas em resultados concretos.",
          alta: "Alta performance, foco e disciplina para entregar.",
          desequilibrio: "Excesso de validação externa e pressão por imagem.",
          evolucao: "Executar com propósito, não apenas por reconhecimento."
        }
      ];


    // 3️⃣ IA DESATIVADA (fallback fixo)
    const ai_analysis = {
      resumo: "Análise avançada por IA temporariamente indisponível.",
      conflito_central: "A análise por IA será liberada em breve."
    };

    // 4️⃣ INSERT NO SUPABASE
    const { error } = await supabase.from("eneagrama_results").insert({
      user_id,
      team_id: null,
      sums,
      type: `Tipo ${bestType}`,
      archetype: profile.nome,
      score: Math.round((bestScore / 25) * 100),
      rawscore: bestScore, // nome correto da coluna
      strengths: profile.forcas,
      weaknesses: profile.fraquezas,
      superpoderes,
      ai_analysis,
    });

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("QUESTIONNAIRE API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao processar questionário" },
      { status: 500 }
    );
  }
}
