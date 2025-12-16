import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const supabase = supabaseServer();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      return NextResponse.json(
        { data: null, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { data, error } = await supabase
      .from("eneagrama_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json(
      { data: null, error: e.message },
      { status: 500 }
    );
  }
}
