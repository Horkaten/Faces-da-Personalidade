import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Pegar team_id do user
  const { data: profile } = await supabase
    .from("users")
    .select("team_id, role")
    .eq("id", session.user.id)
    .single();

  if (!profile?.team_id) return NextResponse.json({ data: [] });

  // A policy RLS garante que apenas managers/admins do mesmo team consigam ver
  const { data, error } = await supabase
    .from("eneagrama_results")
    .select("id, user_id, type, archetype, score, created_at, answers")
    .eq("team_id", profile.team_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ data });
}
