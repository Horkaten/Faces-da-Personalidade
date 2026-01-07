// ===============================
// Detalhes de cada Tipo do Eneagrama
// ===============================

export const TYPE_DETAILS: Record<string, any> = {
  "1": {
    archetype: "O Perfeccionista",
    mission: "Melhorar as coisas, ser íntegro e evitar erros.",
    positive_points: ["Integridade inabalável", "Organização extrema", "Senso de justiça"],
    negative_points: ["Crítica excessiva", "Rigidez mental", "Raiva reprimida"],
    blocks: ["Medo de cometer erros", "Paralisia por análise"],
    guidelines: ["Aceite que o 'bom' é inimigo do 'perfeito'.", "Permita-se cometer erros.", "Pratique a autocompaixão."]
  },
  "2": {
    archetype: "O Ajudante",
    mission: "Amar os outros e ser amado.",
    positive_points: ["Empatia", "Generosidade", "Calor humano"],
    negative_points: ["Esquecer de si", "Manipulação emocional", "Orgulho"],
    blocks: ["Dificuldade em dizer não", "Medo de ser indesejado"],
    guidelines: ["Aprenda a cuidar de si mesmo.", "Não espere retribuição.", "Defina limites saudáveis."]
  },
  "3": {
    archetype: "O Realizador",
    mission: "Ser competente e admirado.",
    positive_points: ["Eficiência", "Otimismo", "Foco em resultados"],
    negative_points: ["Competitividade", "Workaholic", "Camaleão social"],
    blocks: ["Medo do fracasso", "Dependência de validação"],
    guidelines: ["Seu valor vai além das conquistas.", "Desacelere conscientemente.", "Seja honesto sobre inseguranças."]
  },
  "4": {
    archetype: "O Individualista",
    mission: "Encontrar identidade e significado.",
    positive_points: ["Criatividade", "Sensibilidade emocional"],
    negative_points: ["Melancolia", "Comparação constante"],
    blocks: ["Sentimento de inadequação"],
    guidelines: ["Valorize o que é comum.", "Pratique gratidão.", "Expresse-se com equilíbrio."]
  },
  "5": {
    archetype: "O Investigador",
    mission: "Compreender o mundo.",
    positive_points: ["Análise profunda", "Autonomia intelectual"],
    negative_points: ["Isolamento", "Desapego emocional"],
    blocks: ["Medo de invasão"],
    guidelines: ["Compartilhe conhecimento.", "Conecte-se emocionalmente."]
  },
  "6": {
    archetype: "O Leal",
    mission: "Buscar segurança.",
    positive_points: ["Lealdade", "Planejamento"],
    negative_points: ["Ansiedade", "Desconfiança"],
    blocks: ["Medo do futuro"],
    guidelines: ["Confie mais em si.", "Reduza a antecipação negativa."]
  },
  "7": {
    archetype: "O Entusiasta",
    mission: "Viver experiências.",
    positive_points: ["Otimismo", "Versatilidade"],
    negative_points: ["Dispersão", "Evitar dor"],
    blocks: ["Medo de sofrimento"],
    guidelines: ["Sustente o presente.", "Aceite limites."]
  },
  "8": {
    archetype: "O Desafiador",
    mission: "Ser forte e independente.",
    positive_points: ["Coragem", "Liderança"],
    negative_points: ["Controle", "Intensidade excessiva"],
    blocks: ["Medo de vulnerabilidade"],
    guidelines: ["Confie nos outros.", "Use força com consciência."]
  },
  "9": {
    archetype: "O Pacificador",
    mission: "Manter harmonia.",
    positive_points: ["Equilíbrio", "Mediação"],
    negative_points: ["Inércia", "Evitação"],
    blocks: ["Medo de conflito"],
    guidelines: ["Assuma posição.", "Valorize sua voz."]
  }
};

// ===============================
// Eneagrama — Estrutura Técnica (Backend)
// ===============================

export const eneagrama: Record<number, any> = {
  1: {
    nome: "O Perfeccionista",
    forcas: TYPE_DETAILS["1"].positive_points,
    fraquezas: TYPE_DETAILS["1"].negative_points,
    asas: ["9", "2"],
    superpoderes: [
      {
        titulo: "Excelência",
        frente: "Busca constante por melhoria e qualidade",
        alta: "Entrega padrões elevados com ética",
        desequilibrio: "Rigidez e autocrítica excessiva",
        evolucao: "Aceita o imperfeito como parte do progresso"
      }
    ]
  },

  2: {
    nome: "O Ajudante",
    forcas: TYPE_DETAILS["2"].positive_points,
    fraquezas: TYPE_DETAILS["2"].negative_points,
    asas: ["1", "3"],
    superpoderes: [
      {
        titulo: "Conexão Humana",
        frente: "Cria vínculos e cuida das pessoas",
        alta: "Empatia genuína e presença acolhedora",
        desequilibrio: "Autoanulação",
        evolucao: "Cuida sem se abandonar"
      }
    ]
  },

  3: {
    nome: "O Realizador",
    forcas: TYPE_DETAILS["3"].positive_points,
    fraquezas: TYPE_DETAILS["3"].negative_points,
    asas: ["2", "4"],
    superpoderes: [
      {
        titulo: "Execução",
        frente: "Transforma metas em resultados",
        alta: "Alta performance",
        desequilibrio: "Validação externa",
        evolucao: "Executa com autenticidade"
      }
    ]
  },

  4: {
    nome: "O Individualista",
    forcas: TYPE_DETAILS["4"].positive_points,
    fraquezas: TYPE_DETAILS["4"].negative_points,
    asas: ["3", "5"],
    superpoderes: [
      {
        titulo: "Profundidade Emocional",
        frente: "Leitura profunda de emoções",
        alta: "Criatividade",
        desequilibrio: "Melancolia",
        evolucao: "Equilíbrio emocional"
      }
    ]
  },

  5: {
    nome: "O Investigador",
    forcas: TYPE_DETAILS["5"].positive_points,
    fraquezas: TYPE_DETAILS["5"].negative_points,
    asas: ["4", "6"],
    superpoderes: [
      {
        titulo: "Clareza Mental",
        frente: "Análise estratégica",
        alta: "Precisão intelectual",
        desequilibrio: "Isolamento",
        evolucao: "Compartilhar conhecimento"
      }
    ]
  },

  6: {
    nome: "O Leal",
    forcas: TYPE_DETAILS["6"].positive_points,
    fraquezas: TYPE_DETAILS["6"].negative_points,
    asas: ["5", "7"],
    superpoderes: [
      {
        titulo: "Antecipação",
        frente: "Prevenção de riscos",
        alta: "Responsabilidade",
        desequilibrio: "Ansiedade",
        evolucao: "Autoconfiança"
      }
    ]
  },

  7: {
    nome: "O Entusiasta",
    forcas: TYPE_DETAILS["7"].positive_points,
    fraquezas: TYPE_DETAILS["7"].negative_points,
    asas: ["6", "8"],
    superpoderes: [
      {
        titulo: "Visão de Possibilidades",
        frente: "Criatividade expansiva",
        alta: "Otimismo",
        desequilibrio: "Dispersão",
        evolucao: "Presença"
      }
    ]
  },

  8: {
    nome: "O Desafiador",
    forcas: TYPE_DETAILS["8"].positive_points,
    fraquezas: TYPE_DETAILS["8"].negative_points,
    asas: ["7", "9"],
    superpoderes: [
      {
        titulo: "Força",
        frente: "Liderança firme",
        alta: "Coragem",
        desequilibrio: "Controle excessivo",
        evolucao: "Poder consciente"
      }
    ]
  },

  9: {
    nome: "O Pacificador",
    forcas: TYPE_DETAILS["9"].positive_points,
    fraquezas: TYPE_DETAILS["9"].negative_points,
    asas: ["8", "1"],
    superpoderes: [
      {
        titulo: "Harmonia",
        frente: "Equilíbrio relacional",
        alta: "Estabilidade",
        desequilibrio: "Inércia",
        evolucao: "Ação consciente"
      }
    ]
  }
};
