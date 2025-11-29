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
export type SessionType = "complete_sentence" | "carousel" | "multiple_choice" | "drag_drop" | "slider" | "text_input";

export interface SessionData {
  type: SessionType;
  data: CompleteSentenceData | CarouselData | MultipleChoiceData | DragDropData | any;
}
