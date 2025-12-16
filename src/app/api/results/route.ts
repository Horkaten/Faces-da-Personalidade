// /app/api/results/route.ts (Next.js route handler)
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const body = await req.json();
  // expect body: { type, archetype, score, answers, team_id? }
  const { type, archetype, score, answers, team_id } = body;

  // pega sessao do servidor (client lib)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = session.user.id;

  const { error } = await supabase
    .from("eneagrama_results")
    .insert({
      user_id: userId,
      team_id: team_id || null,
      type,
      archetype,
      score,
      answers: answers,
    });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
