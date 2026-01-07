import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    const scores: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    };

    answers.forEach((a: { type: number; value: number }) => {
      scores[a.type] += a.value;
    });

    const dominantType = Number(
      Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
    );

    return NextResponse.json({ dominantType, scores });
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar análise" },
      { status: 500 }
    );
  }
}
