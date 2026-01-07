import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* =========================
   GET — último resultado
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
   POST — sem IA (estável)
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const analysis = {
      resumo: "Análise automática ainda não gerada.",
      conflito_central: "",
      estado_atual: "",
      observacao: "",
    };

    const { error } = await supabase
      .from("eneagrama_results")
      .update({ ai_analysis: analysis })
      .eq("id", body.result_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      ai_analysis: analysis,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao salvar resultado" },
      { status: 500 }
    );
  }
}
