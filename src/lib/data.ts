// Detalhes de cada Tipo do Eneagrama
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
    guidelines: ["O seu valor existe além das conquistas.", "Tire tempo para não fazer nada.", "Seja honesto sobre inseguranças."]
  },
  // ... Adicione os outros tipos (4 a 9) aqui ...
  "default": {
    archetype: "Em Análise",
    mission: "Descobrir o seu potencial.",
    positive_points: ["Potencial latente", "Curiosidade"],
    negative_points: ["Dúvida", "Incerteza"],
    blocks: ["Falta de clareza"],
    guidelines: ["Continue a jornada de autoconhecimento."]
  }
};

// Perguntas do Questionário
export const QUESTIONS = [
  { id: 1, type: "1", text: "Sinto forte necessidade de corrigir erros e garantir perfeição." },
  { id: 2, type: "2", text: "É natural para mim colocar as necessidades dos outros antes das minhas." },
  { id: 3, type: "3", text: "Sinto-me valorizado quando sou reconhecido pelas minhas conquistas." },
  { id: 4, type: "4", text: "Muitas vezes sinto que sou diferente e ninguém me compreende." },
  { id: 5, type: "5", text: "Prefiro observar e analisar situações de longe antes de me envolver." },
  { id: 6, type: "6", text: "Tenho tendência a preocupar-me com o que pode dar errado." },
  { id: 7, type: "7", text: "Evito sentimentos negativos mantendo-me ocupado com planos futuros." },
  { id: 8, type: "8", text: "Tenho facilidade em assumir o controlo e não gosto de demonstrar fraqueza." },
  { id: 9, type: "9", text: "Evito conflitos a todo custo e prefiro concordar para manter a paz." },
];

// Dados Simulados da Equipa
export const MOCK_TEAM = [
  { id: 1, name: "Ana Silva", role: "Marketing", type: "3", score: 88, avatar: "AS" },
  { id: 2, name: "Carlos Mendes", role: "Vendas", type: "8", score: 92, avatar: "CM" },
  { id: 3, name: "Beatriz Costa", role: "RH", type: "2", score: 75, avatar: "BC" },
  { id: 4, name: "João Paulo", role: "Dev", type: "5", score: 95, avatar: "JP" },
  { id: 5, name: "Mariana Luz", role: "Design", type: "4", score: 80, avatar: "ML" },
];