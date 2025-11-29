# 📚 Tipos de Sessão Interativa

Este documento define todos os tipos de sessões interativas disponíveis para os módulos de aprendizagem.

---

## 1. `complete_sentence` - Complete a Frase

**Objetivo:** Usuário completa uma lacuna na frase clicando na opção correta.

### Comportamento
- Exibe uma frase com lacuna (`____`)
- Mostra opções clicáveis
- Feedback imediato (correto = verde ✓, errado = vermelho + shake)
- Ao acertar, chama `onComplete()` automaticamente
- SessionNavigator controla o botão "Continuar"

### Estrutura de Dados
```typescript
{
  type: "complete_sentence",
  data: {
    sentence: "Para sobrar dinheiro, eu preciso gastar ____ do que ganho.",
    options: ["Mais", "Igual", "Menos"],
    correctIndex: 2  // índice da resposta correta (começa em 0)
  }
}
```

### Exemplo Visual
```
┌────────────────────────────────────────────┐
│  "Para sobrar dinheiro, eu preciso         │
│   gastar ____ do que ganho."               │
│                                            │
│  [Mais]  [Igual]  [Menos]                  │
│                                            │
│  ✓ Perfeito! 🎉                            │
└────────────────────────────────────────────┘
```

---

## 2. `carousel` - Carrossel Explicativo

**Objetivo:** Explicar um conceito em etapas através de slides deslizáveis.

### Comportamento
- Slides horizontais com scroll suave
- Cada slide tem emoji, título e texto explicativo
- Indicadores de paginação (dots)
- Ao chegar no último slide, chama `onComplete()` automaticamente
- Mostra feedback "✓ Pronto para continuar!"

### Estrutura de Dados
```typescript
{
  type: "carousel",
  data: {
    slides: [
      {
        emoji: "😢",
        title: "O Gatilho Emocional",
        text: "Tudo começa com uma sensação ruim: tédio, ansiedade, tristeza..."
      },
      {
        emoji: "🛒",
        title: "A Ação Impulsiva",
        text: "Você busca uma solução rápida: comprar algo para se sentir melhor."
      },
      {
        emoji: "💸",
        title: "A Consequência",
        text: "O prazer passa rápido, mas a dívida fica."
      }
    ]
  }
}
```

### Exemplo Visual
```
┌────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   😢     │  │   🛒     │  │   💸     │  │
│  │ Gatilho  │  │  Ação    │  │Consequên │  │
│  │          │  │          │  │   cia     │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│                                            │
│  ● ○ ○         (indicadores)               │
│  Deslize para o lado 👉                    │
└────────────────────────────────────────────┘
```

---

## 3. `selection` - Quiz e Seleção

**Objetivo:** Lista vertical de seleção que suporta dois modos: Quiz (com resposta correta) e Pesquisa (coleta de opinião).

### Comportamento

#### Modo Quiz:
- Exibe pergunta e opções verticais
- Usuário clica em uma opção
- Valida instantaneamente (verde ✓ = acerto, vermelho X = erro)
- Se errar: permite nova tentativa após shake animation
- Se acertar: chama `onComplete()` e mostra feedback de sucesso

#### Modo Pesquisa (Survey):
- Exibe pergunta e opções verticais
- Usuário clica em uma opção
- Não há certo ou errado
- Qualquer seleção é válida e chama `onComplete()` imediatamente
- Mostra checkmark em brand color

### Estrutura de Dados

#### Modo Quiz (Teste de Conhecimento)
```typescript
{
  type: "selection",
  data: {
    mode: "quiz",
    question: "Qual é a primeira regra do dinheiro?",
    options: [
      { emoji: "💸", text: "Gastar menos do que ganha" },
      { emoji: "💰", text: "Ganhar mais dinheiro" },
      { emoji: "🎰", text: "Investir tudo em risco" }
    ],
    correctIndex: 0  // "Gastar menos do que ganha" é a resposta correta
  }
}
```

#### Modo Pesquisa (Coleta de Dados)
```typescript
{
  type: "selection",
  data: {
    mode: "survey",
    question: "Sejamos sinceros: Como foi o pagamento da sua última fatura?",
    options: [
      { emoji: "🥷", text: "Ninja: Paguei o valor total." },
      { emoji: "🐢", text: "Parcelador: Paguei uma parte ou parcelei." },
      { emoji: "🆘", text: "Deu Ruim: Paguei o mínimo ou atrasei." }
    ]
    // Não tem correctIndex no modo survey
  }
}
```

### Exemplo Visual (Modo Pesquisa)
```
┌────────────────────────────────────────────┐
│  Sejamos sinceros: Como foi o pagamento    │
│  da sua última fatura?                     │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ 🥷  Ninja: Paguei o valor total.    ✓│  │ ← Selecionado
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ 🐢  Parcelador: Paguei uma parte... │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ 🆘  Deu Ruim: Paguei o mínimo...    │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

### Estados Visuais

- **Normal**: Borda cinza clara (`border`), fundo branco (`bg-card`)
- **Selecionado (Survey)**: Borda brand color (`border-primary`), fundo levemente colorido (`bg-primary/10`), checkmark azul
- **Sucesso (Quiz - Acertou)**: Borda verde (`border-success`), fundo verde claro (`bg-success/10`), checkmark verde
- **Erro (Quiz - Errou)**: Borda vermelha (`border-destructive`), fundo vermelho claro (`bg-destructive/10`), X vermelho, shake animation

---

## 4. `curiosity_card` - Card de Curiosidade

**Objetivo:** Exibir fatos interessantes em um formato visual de destaque, quebrando o ritmo da navegação com um "Post-it" ou "Card de Insight".

### Comportamento
- Exibe um card visualmente destacado com cor de fundo suave
- Animação de entrada suave (fade + slide + scale)
- Ícone decorativo grande no canto superior
- Título opcional em uppercase para categorizar
- Barra de progresso na parte inferior indica tempo de leitura
- Auto-complete após 3 segundos (tempo para ler o conteúdo)

### Estrutura de Dados
```typescript
{
  type: "curiosity_card",
  data: {
    cards: [
      {
        icon: "🧠",                    // Emoji que representa o tema
        title: "CURIOSIDADE",          // Título opcional em uppercase
        text: "O cérebro humano processa a dor de perder dinheiro na mesma região que processa a dor física (como um soco!). Por isso evitamos olhar a fatura do cartão.",
        bgColor: "purple"              // "yellow" | "blue" | "purple" | "green"
      },
      {
        icon: "💡",
        title: "VOCÊ SABIA?",
        text: "Estudos mostram que apenas visualizar seus gastos em categorias pode reduzir compras impulsivas em até 30%. O primeiro passo é ter consciência!",
        bgColor: "yellow"
      }
    ]
  }
}
```

**Nota:** Você pode colocar 1 ou mais cards no array. Eles serão exibidos empilhados visualmente, aparecendo um após o outro com animação suave.

### Exemplo Visual
```
┌────────────────────────────────────────────┐
│  🧠  ← Ícone flutuante                     │
│                                        💡  │
│  CURIOSIDADE                               │
│                                            │
│  O cérebro humano processa a dor de       │
│  perder dinheiro na mesma região que      │
│  processa a dor física (como um soco!).   │
│  Por isso evitamos olhar a fatura do      │
│  cartão.                                   │
│                                            │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░ (barra de progresso)  │
└────────────────────────────────────────────┘
```

### Variações de Cor
- **Yellow** (`bg-yellow-50`): Atenção, alerta suave
- **Blue** (`bg-blue-50`): Informação, conhecimento
- **Purple** (`bg-purple-50`): Insight, descoberta (brand color)
- **Green** (`bg-green-50`): Dica positiva, ação recomendada

### Estados Visuais
- Animação de entrada com spring physics
- Ícone com rotação e scale animado
- Barra de progresso animada (0-100% em 3s)
- Hover sutil aumenta a sombra do card

---

## 5. `audio_player` - Player de Áudio

**Objetivo:** Reproduzir conteúdo educativo em formato de áudio (mini-podcast) com transcrição disponível.

### Comportamento
- Player de áudio HTML5 com controles customizados
- Botão Play/Pause grande e proeminente
- Barra de progresso interativa (slider)
- Timestamps mostrando tempo atual e duração total
- Visualização animada (waveform) que se move com o áudio
- Botão "Ver Transcrição" que expande/colapsa o texto
- Auto-complete quando o áudio terminar

### Estrutura de Dados
```typescript
{
  type: "audio_player",
  data: {
    title: "Poder de Compra vs. Capacidade",
    subtitle: "Com Mira • Áudio-Aula",     // Opcional
    audioUrl: "https://example.com/audio.mp3",  // URL do arquivo de áudio
    transcript: "Sabe aquela sensação poderosa de passar o cartão? Isso é o poder de compra. Mas o problema é que poder de compra não é igual a capacidade financeira..."
  }
}
```

### Exemplo Visual
```
┌────────────────────────────────────────────┐
│  Poder de Compra vs. Capacidade           │
│  Com Mira • Áudio-Aula                     │
│                                            │
│  |||│|││||│││|││││|│││││││││|│││|│││││    │ ← Waveform animado
│                                            │
│  ▶  ━━━━━━━━━━━━━●━━━━━━━━━━━━           │
│     0:15                    1:45           │
│                                            │
│  [📄 Ver Transcrição]                      │
└────────────────────────────────────────────┘
```

### Controles
- **Play/Pause**: Botão circular grande com brand color
- **Barra de Progresso**: Slider interativo que permite pular para qualquer parte do áudio
- **Timestamps**: Formato MM:SS para tempo atual e total
- **Transcrição**: Collapsible/Accordion que expande suavemente abaixo do player

### Estados Visuais
- **Pausado**: Ícone de Play, waveform estático em cinza
- **Tocando**: Ícone de Pause, waveform animado em brand color
- **Completado**: Checkmark verde com mensagem "Áudio completado!"

### Formatos Suportados
O player usa HTML5 Audio, que suporta:
- MP3 (recomendado)
- WAV
- OGG
- AAC/M4A

---

## 6. `multiple_choice` - Múltipla Escolha (Futuro)

**Objetivo:** Pergunta com múltiplas opções e apenas uma correta.

### Estrutura de Dados (Planejada)
```typescript
{
  type: "multiple_choice",
  data: {
    question: "Qual é a melhor estratégia para economizar?",
    options: [
      "Guardar o que sobra no fim do mês",
      "Guardar uma porcentagem assim que receber",
      "Guardar apenas em meses que sobra muito",
      "Não guardar, investir direto"
    ],
    correctIndex: 1
  }
}
```

---

## 7. `drag_drop` - Arrastar e Soltar (Futuro)

**Objetivo:** Organizar itens na ordem correta.

### Estrutura de Dados (Planejada)
```typescript
{
  type: "drag_drop",
  data: {
    instruction: "Organize os passos para criar um orçamento:",
    items: [
      "Registrar todas as despesas",
      "Calcular a renda mensal",
      "Definir limite por categoria",
      "Acompanhar gastos diariamente"
    ],
    correctOrder: [1, 0, 2, 3]  // índices da ordem correta
  }
}
```

---

## Como Usar

### No `learning_modules.content` do banco de dados:

```json
{
  "lessons": [
    {
      "title": "Entendendo o Cérebro Comprador",
      "type": "interactive_sessions",
      "sessions": [
        {
          "type": "complete_sentence",
          "data": {
            "sentence": "Dinheiro não aceita ____ para o futuro.",
            "options": ["Desaforo", "Desculpas", "Atraso"],
            "correctIndex": 1
          }
        },
        {
          "type": "carousel",
          "data": {
            "slides": [
              { "emoji": "😢", "title": "Gatilho", "text": "..." },
              { "emoji": "🛒", "title": "Ação", "text": "..." }
            ]
          }
        }
      ]
    }
  ]
}
```

---

## Fluxo de Funcionamento

```
Usuário abre Card/Módulo
    ↓
SessionNavigator carrega primeira sessão
    ↓
Sessão renderiza (CompleteSentence ou Carousel)
    ↓
Usuário completa ação (acerta ou chega no fim)
    ↓
Sessão chama onComplete()
    ↓
SessionNavigator habilita botão "Continuar"
    ↓
Usuário clica "Continuar"
    ↓
Próxima sessão OU finaliza lição
```

---

## Regras de Design

1. **Consistência Visual**: Todas as sessões usam o mesmo sistema de feedback (verde = sucesso, vermelho = erro)
2. **Animações Suaves**: Transições com `framer-motion` para melhor UX
3. **Feedback Imediato**: Usuário sempre sabe se acertou/completou
4. **Navegação Clara**: SessionNavigator controla TODA a navegação
5. **Sem Botões Duplicados**: Sessões não têm botões próprios de "Continuar"

---

## Adicionar Novo Tipo de Sessão

1. **Criar componente**: `src/components/modules/sessions/NovoTipoSession.tsx`
2. **Adicionar tipo**: em `types.ts` adicionar interface e tipo
3. **Registrar no switch**: em `InteractiveSession.tsx` adicionar case
4. **Documentar aqui**: adicionar seção explicativa
5. **Testar**: criar exemplo no banco de dados
