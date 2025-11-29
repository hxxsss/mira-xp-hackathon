# Sessões Interativas - Sistema de Conteúdo Modular

## Conceito

Os cards da trilha Mentalidade não possuem conteúdo estático. Cada card é um **container** que renderiza diferentes tipos de sessões interativas em sequência.

## Tipos de Sessões Disponíveis

### 1. Complete Sentence (Termine a Frase)

Usuário completa uma lacuna clicando na opção correta.

**Estrutura de Dados:**
```json
{
  "type": "complete_sentence",
  "data": {
    "sentence": "Dinheiro não aceita ____ para o futuro.",
    "options": ["Desaforo", "Desculpas", "Atraso"],
    "correctIndex": 0
  }
}
```

**Comportamento:**
- Opção incorreta: shake + vermelho
- Opção correta: verde + preenche a lacuna + feedback de sucesso
- Botão "Continuar" só aparece após acerto

### 2. Carousel (Carrossel Explicativo)

Conjunto de cards horizontais deslizáveis para explicar conceitos em etapas (estilo Instagram Stories).

**Estrutura de Dados:**
```json
{
  "type": "carousel",
  "data": {
    "slides": [
      {
        "emoji": "😢",
        "title": "O Gatilho Emocional",
        "text": "Tudo começa com uma sensação ruim: tédio, tristeza ou cansaço após um dia longo."
      },
      {
        "emoji": "🛒",
        "title": "A Ação Impulsiva",
        "text": "Seu cérebro busca alívio rápido. Você abre o app de delivery ou loja online sem pensar."
      },
      {
        "emoji": "😌",
        "title": "A Recompensa Falsa",
        "text": "O prazer da compra dura pouco. Logo depois, vem a culpa da fatura. É um ciclo vicioso."
      }
    ]
  }
}
```

**Comportamento:**
- Scroll horizontal com snap (trava no card mais próximo)
- Indicadores de paginação (dots) abaixo do carrossel
- Botão "Continuar" só habilita quando chegar no último slide
- Largura dos cards: 85-90% da tela para mostrar pontinha do próximo

### 3. Multiple Choice (Em desenvolvimento)
### 4. Slider Input (Em desenvolvimento)
### 5. Text Input (Em desenvolvimento)

## Como Usar

### 1. Estrutura da Lição no Banco

```json
{
  "id": 1,
  "title": "Mentalidade Financeira",
  "type": "interactive_sessions",
  "sessions": [
    {
      "type": "complete_sentence",
      "data": {
        "sentence": "Dinheiro não aceita ____ para o futuro.",
        "options": ["Desaforo", "Desculpas", "Atraso"],
        "correctIndex": 0
      }
    },
    {
      "type": "complete_sentence",
      "data": {
        "sentence": "Investir é ____ o dinheiro trabalhar para você.",
        "options": ["fazer", "deixar", "forçar"],
        "correctIndex": 1
      }
    }
  ]
}
```

### 2. Inserir no Banco de Dados

```sql
-- Atualizar um módulo existente da trilha Mentalidade
UPDATE learning_modules
SET content = jsonb_set(
  content,
  '{lessons}',
  content->'lessons' || '[
    {
      "id": 1,
      "title": "Frases da Mentalidade",
      "type": "interactive_sessions",
      "sessions": [
        {
          "type": "complete_sentence",
          "data": {
            "sentence": "Dinheiro não aceita ____ para o futuro.",
            "options": ["Desaforo", "Desculpas", "Atraso"],
            "correctIndex": 0
          }
        }
      ]
    }
  ]'::jsonb
)
WHERE id = 'SEU_MODULO_ID';
```

## Exemplo Completo de Teste

Aqui está um exemplo completo que você pode usar para testar:

```json
{
  "lessons": [
    {
      "id": 1,
      "title": "Mentalidade Financeira - Parte 1",
      "type": "interactive_sessions",
      "sessions": [
        {
          "type": "complete_sentence",
          "data": {
            "sentence": "Dinheiro não aceita ____ para o futuro.",
            "options": ["Desaforo", "Desculpas", "Atraso"],
            "correctIndex": 0
          }
        },
        {
          "type": "complete_sentence",
          "data": {
            "sentence": "Poupar é criar uma ____ de segurança.",
            "options": ["rede", "ilusão", "dúvida"],
            "correctIndex": 0
          }
        }
      ]
    }
  ]
}
```

## Adicionar Novos Tipos de Sessões

1. Criar componente em `src/components/modules/sessions/NovoTipo.tsx`
2. Adicionar case no switch em `InteractiveSession.tsx`
3. Exportar no `index.ts`
4. Documentar aqui no README

## Design System

Todas as sessões seguem o design system:
- Mobile-first
- Fontes limpas e legíveis
- Botões arredondados (`rounded-xl`)
- Sombras suaves
- Animações com framer-motion
- Cores do tema (HSL do index.css)
