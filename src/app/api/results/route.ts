import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* =========================
   GET — mantém funcionando
========================= */
export async function GET() {
  const { data, error } = await supabase
    .from("eneagrama_results")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { data: null, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}


/* =========================
   POST — IA (manual)
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = `
Você é um analista especialista em Eneagrama.

Regras:
- NÃO altere o tipo dominante
- NÃO use linguagem mística
- NÃO dê conselhos clínicos
- Linguagem clara, humana e madura

Dados do usuário:
Tipo dominante: ${body.tipo_dominante}
Ranking: ${JSON.stringify(body.ranking)}
Diferença entre os dois primeiros tipos: ${body.diferenca_principal}

Retorne APENAS JSON no formato:

{
  "resumo": "",
  "conflito_central": "",
  "estado_atual": "",
  "observacao": ""
}
`;

    const completion = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const text = completion.output_text;
    const analysis = JSON.parse(text || "{}");

    const { error: updateError } = await supabase
      .from("eneagrama_results")
      .update({ ai_analysis: analysis })
      .eq("id", body.result_id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      ai_analysis: analysis,
    });
  } catch (err) {
    console.error("Erro IA:", err);
    return NextResponse.json(
      { error: "Erro ao gerar análise IA" },
      { status: 500 }
    );
  }
}
