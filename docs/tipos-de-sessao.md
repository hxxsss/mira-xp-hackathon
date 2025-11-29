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

## 4. `multiple_choice` - Múltipla Escolha (Futuro)

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

## 5. `drag_drop` - Arrastar e Soltar (Futuro)

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
