import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

Gere uma análise no formato JSON:

{
  "resumo": "",
  "conflito_central": "",
  "estado_atual": "",
  "observacao": ""
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é um analista de Eneagrama." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
    });

    const text = completion.choices[0].message.content;

    return NextResponse.json({
      analysis: JSON.parse(text || "{}"),
    });
  } catch (err) {
    console.error("Erro IA:", err);
    return NextResponse.json(
      { error: "Erro ao gerar análise" },
      { status: 500 }
    );
  }
}
