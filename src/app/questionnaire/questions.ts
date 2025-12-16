// src/app/questionnaire/questions.ts
export type QItem = {
  id: number;
  text: string;
  type: number; // 1..9 (enchê o score do tipo correspondente)
};

const questions: QItem[] = [
  { id: 1, text: "Sou movido por fazer a coisa certa e evitar erros.", type: 1 },
  { id: 2, text: "Procuro ser bem-sucedido e ser visto como competente.", type: 3 },
  { id: 3, text: "Sou empático e procuro ajudar os outros antes de mim.", type: 2 },
  { id: 4, text: "Procuro autenticidade e expressar minha individualidade.", type: 4 },
  { id: 5, text: "Valorizo o conhecimento e reflexão independente.", type: 5 },
  { id: 6, text: "Busco segurança e às vezes me preocupo com riscos.", type: 6 },
  { id: 7, text: "Gosto de planejar experiências positivas e evitar dor.", type: 7 },
  { id: 8, text: "Tenho uma postura assertiva e gosto de controle.", type: 8 },
  { id: 9, text: "Busco paz e evito conflitos para manter harmonia.", type: 9 },

  // Repetimos variações para ter 18 perguntas (duas por tipo — melhora estabilidade)
  { id: 10, text: "Sua integridade e padrões morais guiam minhas decisões.", type: 1 },
  { id: 11, text: "Sou competitivo e gosto de metas claras para dirigir meu esforço.", type: 3 },
  { id: 12, text: "Sou cuidadoso com os sentimentos dos outros e busco conexão.", type: 2 },
  { id: 13, text: "Tenho tendência a introspecção e valorizo o belo.", type: 4 },
  { id: 14, text: "Gosto de entender como as coisas funcionam antes de agir.", type: 5 },
  { id: 15, text: "Tomo precauções e busco respaldo em regras e planos.", type: 6 },
  { id: 16, text: "Tenho energia para criar possibilidades e manter o ânimo.", type: 7 },
  { id: 17, text: "Sinto que posso liderar e proteger meu círculo quando preciso.", type: 8 },
  { id: 18, text: "Sinto-me confortável seguindo o fluxo para evitar desgaste.", type: 9 },
];

export default questions;
