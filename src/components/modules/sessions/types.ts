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
  cards: Array<{
    icon: string;                    // "🧠" ou "💡"
    title?: string;                  // "CURIOSIDADE" ou "VOCÊ SABIA?" (opcional)
    text: string;                    // Texto do fato interessante
    bgColor?: "yellow" | "blue" | "purple" | "green"; // Cor de fundo suave
  }>;
}

// Sessão: Player de Áudio
export interface AudioPlayerData {
  title: string;                     // "Poder de Compra vs. Capacidade"
  subtitle?: string;                 // "Com Mira" ou "Áudio-Aula"
  audioUrl: string;                  // URL do arquivo de áudio
  transcript: string;                // Texto completo da transcrição
  duration?: number;                 // Duração em segundos (opcional, será detectada)
}

// Sessão: Texto Progressivo (Tap to Reveal)
export interface ProgressiveTextData {
  blocks: string[];                  // Array de blocos de texto (parágrafos)
  title?: string;                    // Título opcional acima do texto
}

// Sessão: Swipe Game (Compra ou Passa)
export interface SwipeGameData {
  cards: Array<{
    id: string;
    title: string;
    price: number;
    emoji: string;
    isImpulsive: boolean;  // true = gasto supérfluo
    description?: string;
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
export type SessionType = "complete_sentence" | "carousel" | "selection" | "curiosity_card" | "audio_player" | "progressive_text" | "swipe_game" | "multiple_choice" | "drag_drop" | "slider" | "text_input";

export interface SessionData {
  type: SessionType;
  data: CompleteSentenceData | CarouselData | SelectionSessionData | CuriosityCardData | AudioPlayerData | ProgressiveTextData | SwipeGameData | MultipleChoiceData | DragDropData | any;
}
