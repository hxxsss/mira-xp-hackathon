// Tipos de Sessões Interativas

// Sessão: Complete a Frase
export interface CompleteSentenceData {
  sentence: string;       // "Dinheiro não aceita ____ para o futuro."
  options: string[];      // ["Desaforo", "Desculpas", "Atraso"]
  correctIndex: number;   // 0
}

// Sessão: Carrossel Explicativo
export interface CarouselData {
  slides: Array<{
    emoji: string;        // "😢"
    title: string;        // "O Gatilho Emocional"
    text: string;         // "Tudo começa com uma sensação ruim..."
  }>;
}

// Sessão: Quiz ou Pesquisa de Seleção
export interface SelectionSessionData {
  mode: "quiz" | "survey";           // Quiz = tem resposta certa | Survey = coleta opinião
  question: string;                  // "Como foi o pagamento da sua última fatura?"
  options: Array<{
    emoji?: string;                  // "🥷" (opcional)
    text: string;                    // "Ninja: Paguei o valor total"
  }>;
  correctIndex?: number;             // Índice da resposta correta (apenas para modo quiz)
}

// Sessão: Card de Curiosidade
export interface CuriosityCardData {
  icon: string;                      // "🧠" ou "💡"
  title?: string;                    // "CURIOSIDADE" ou "VOCÊ SABIA?" (opcional)
  text: string;                      // Texto do fato interessante
  bgColor?: "yellow" | "blue" | "purple" | "green"; // Cor de fundo suave (default: purple)
}

// Futuros tipos de sessão (placeholder)
export interface MultipleChoiceData {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface DragDropData {
  items: string[];
  correctOrder: number[];
}

// Tipo união de todas as sessões possíveis
export type SessionType = "complete_sentence" | "carousel" | "selection" | "curiosity_card" | "multiple_choice" | "drag_drop" | "slider" | "text_input";

export interface SessionData {
  type: SessionType;
  data: CompleteSentenceData | CarouselData | SelectionSessionData | CuriosityCardData | MultipleChoiceData | DragDropData | any;
}
