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
export interface SelectionData {
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
    description?: string;
    price: number;
    emoji: string;
    isImpulsive: boolean;
  }>;
}

// Sessão: Drag & Drop (Classificação)
export interface DragDropData {
  title?: string;
  zones: Array<{
    id: number;
    label: string;
    color: string;
  }>;
  items: Array<{
    id: string;
    label: string;
    correctZone: number;
  }>;
}

// Sessão: Dual Slider (Coleta de Dados Quantitativos)
export interface DualSliderData {
  sliders: [SliderConfig, SliderConfig]; // Exatamente 2 sliders
}

export interface SliderConfig {
  question: string;          // "De 0 a 10, qual seu nível de estresse?"
  min: number;               // 0
  max: number;               // 10 ou 100
  step: number;              // 1 ou 5
  defaultValue: number;      // 5 ou 20
  minLabel: string;          // "Zen (0)" ou "0%"
  maxLabel: string;          // "Pânico (10)" ou "100%"
  unit?: "number" | "percent" | "currency"; // Para formatação do valor
  prefix?: string;           // "R$" (para currency)
}

// Sessão: Reflexão (Completa a Frase - Sem Resposta Certa)
export interface ReflectionSentenceData {
  sentence: string;          // "Para mim, guardar dinheiro é ____."
  options: string[];         // ["Difícil", "Moleza", "Normal"]
  category?: string;         // "perfil_financeiro" para agrupar respostas
}

// Tipo união de todas as sessões possíveis
export type SessionType =
  | "complete_sentence"
  | "carousel"
  | "selection"
  | "curiosity_card"
  | "audio_player"
  | "progressive_text"
  | "swipe_game"
  | "drag_drop"
  | "dual_slider"
  | "reflection_sentence";

export type SessionData =
  | { type: "complete_sentence"; data: CompleteSentenceData }
  | { type: "carousel"; data: CarouselData }
  | { type: "selection"; data: SelectionData }
  | { type: "curiosity_card"; data: CuriosityCardData }
  | { type: "audio_player"; data: AudioPlayerData }
  | { type: "progressive_text"; data: ProgressiveTextData }
  | { type: "swipe_game"; data: SwipeGameData }
  | { type: "drag_drop"; data: DragDropData }
  | { type: "dual_slider"; data: DualSliderData }
  | { type: "reflection_sentence"; data: ReflectionSentenceData };
