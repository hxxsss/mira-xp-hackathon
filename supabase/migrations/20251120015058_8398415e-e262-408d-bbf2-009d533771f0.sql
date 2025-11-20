-- Create learning_modules table
CREATE TABLE learning_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  card_color text NOT NULL,
  icon_bg text NOT NULL,
  order_index integer NOT NULL,
  xp_reward integer DEFAULT 50,
  points_reward integer DEFAULT 10,
  content jsonb,
  created_at timestamptz DEFAULT now()
);

-- Populate with current 5 modules
INSERT INTO learning_modules (number, title, description, icon, card_color, icon_bg, order_index, content) VALUES
('01', 'Entendendo Dinheiro', 'Descubra de onde vem seu dinheiro', '💰', 'rgba(124, 58, 237, 0.15)', 'rgba(255, 255, 255, 0.2)', 1, 
'{
  "lessons": [
    {
      "id": 1,
      "title": "O que é dinheiro?",
      "type": "text",
      "content": "Olá! Vamos aprender sobre dinheiro? 💰\\n\\nDinheiro é como uma ferramenta mágica que usamos para trocar coisas. Imagine que você tem um brinquedo e seu amigo tem um livro. Se vocês trocarem, é como usar dinheiro!\\n\\nMas em vez de trocar brinquedos toda hora, usamos dinheiro (moedas e notas) porque é mais fácil.",
      "illustration": "💰"
    },
    {
      "id": 2,
      "title": "De onde vem o dinheiro?",
      "type": "text",
      "content": "As pessoas ganham dinheiro trabalhando! 👨‍💼👩‍⚕️\\n\\n- Seus pais trabalham e recebem salário\\n- Você pode ganhar mesada fazendo tarefas\\n- Às vezes ganhamos presentes em dinheiro\\n\\nÉ importante entender que dinheiro não cai do céu - alguém trabalhou para consegui-lo!",
      "illustration": "💼"
    },
    {
      "id": 3,
      "title": "Quiz: Teste seu conhecimento!",
      "type": "quiz",
      "questions": [
        {
          "question": "O dinheiro serve para:",
          "options": ["Trocar por coisas que queremos", "Só guardar no cofre", "Apenas brincar"],
          "correct": 0
        },
        {
          "question": "Como as pessoas ganham dinheiro?",
          "options": ["Trabalhando", "Esperando chover", "Pedindo sempre"],
          "correct": 0
        }
      ]
    }
  ]
}'::jsonb),
('02', 'O Poder de Poupar', 'Aprenda técnicas para guardar', '🎯', 'rgba(124, 58, 237, 0.15)', 'rgba(255, 255, 255, 0.2)', 2,
'{
  "lessons": [
    {
      "id": 1,
      "title": "Por que poupar?",
      "type": "text",
      "content": "Poupar é guardar dinheiro para o futuro! 🏦\\n\\nQuando você guarda um pouco do seu dinheiro, pode comprar coisas maiores e realizar seus sonhos.\\n\\nÉ como juntar pecinhas de LEGO - uma de cada vez você constrói algo incrível!",
      "illustration": "🎯"
    },
    {
      "id": 2,
      "title": "Como começar a poupar?",
      "type": "text",
      "content": "Dicas para poupar:\\n\\n💰 Guarde 10% de tudo que ganhar\\n🏦 Use um cofrinho ou conta poupança\\n📝 Anote seus objetivos\\n⏰ Seja paciente - poupar leva tempo!\\n\\nLembre-se: cada centavo conta!",
      "illustration": "💡"
    },
    {
      "id": 3,
      "title": "Quiz: Você sabe poupar?",
      "type": "quiz",
      "questions": [
        {
          "question": "Quanto você deve poupar do que ganha?",
          "options": ["Tudo", "Nada", "Uma parte (10% ou mais)"],
          "correct": 2
        },
        {
          "question": "Por que poupar é importante?",
          "options": ["Para realizar sonhos maiores", "Para gastar depois", "Não é importante"],
          "correct": 0
        }
      ]
    }
  ]
}'::jsonb),
('03', 'Compreendendo Seu Dinheiro', 'Descubra de onde vem e para onde vai seu dinheiro', '💰', '#FFFFFF', 'linear-gradient(135deg, #F87171 0%, #FB923C 100%)', 3,
'{
  "lessons": [
    {
      "id": 1,
      "title": "Rastreando seu dinheiro",
      "type": "text",
      "content": "Você sabe para onde vai seu dinheiro? 🔍\\n\\nÉ importante acompanhar:\\n- Quanto você ganha (mesada, presentes)\\n- Quanto você gasta\\n- Quanto você poupa\\n\\nAssim você tem controle total!",
      "illustration": "📊"
    },
    {
      "id": 2,
      "title": "Criando um registro",
      "type": "text",
      "content": "Como registrar seu dinheiro:\\n\\n📝 Use um caderno ou app\\n💵 Anote toda entrada de dinheiro\\n🛍️ Anote toda saída (gastos)\\n📅 Faça isso toda semana\\n\\nNo final do mês, você verá exatamente para onde foi seu dinheiro!",
      "illustration": "📝"
    },
    {
      "id": 3,
      "title": "Quiz: Você compreende seu dinheiro?",
      "type": "quiz",
      "questions": [
        {
          "question": "O que você deve anotar?",
          "options": ["Só os gastos", "Só o que ganha", "Tudo: entradas e saídas"],
          "correct": 2
        },
        {
          "question": "Com que frequência revisar suas anotações?",
          "options": ["Nunca", "Uma vez por ano", "Toda semana ou mês"],
          "correct": 2
        }
      ]
    }
  ]
}'::jsonb),
('04', 'Gastos Inteligentes', 'Diferencie necessidades de desejos', '🧠', 'rgba(124, 58, 237, 0.15)', 'rgba(255, 255, 255, 0.2)', 4,
'{
  "lessons": [
    {
      "id": 1,
      "title": "Necessidade vs Desejo",
      "type": "text",
      "content": "Qual a diferença? 🤔\\n\\n✅ NECESSIDADES: Coisas que você precisa para viver\\n- Comida, água, casa, roupas básicas\\n\\n💭 DESEJOS: Coisas que você quer, mas não precisa\\n- Brinquedos, doces extras, jogos novos\\n\\nNão há problema em ter desejos, mas necessidades vêm primeiro!",
      "illustration": "🧠"
    },
    {
      "id": 2,
      "title": "Decisões inteligentes",
      "type": "text",
      "content": "Antes de gastar, pergunte-se:\\n\\n1. Eu PRECISO disso ou só QUERO?\\n2. Tenho dinheiro suficiente?\\n3. Isso me aproxima dos meus objetivos?\\n4. Posso esperar para comprar?\\n\\nEssas perguntas vão te ajudar a gastar com sabedoria!",
      "illustration": "💭"
    },
    {
      "id": 3,
      "title": "Quiz: Gaste com inteligência!",
      "type": "quiz",
      "questions": [
        {
          "question": "Qual destes é uma NECESSIDADE?",
          "options": ["Videogame novo", "Comida saudável", "Brinquedo caro"],
          "correct": 1
        },
        {
          "question": "Antes de comprar algo caro você deve:",
          "options": ["Comprar na hora", "Esperar e pensar bem", "Pedir dinheiro emprestado"],
          "correct": 1
        }
      ]
    }
  ]
}'::jsonb),
('05', 'Investindo Sonhos', 'Faça seu dinheiro trabalhar', '💎', 'rgba(124, 58, 237, 0.15)', 'rgba(255, 255, 255, 0.2)', 5,
'{
  "lessons": [
    {
      "id": 1,
      "title": "O que é investir?",
      "type": "text",
      "content": "Investir é fazer seu dinheiro crescer! 📈\\n\\nQuando você investe, seu dinheiro trabalha para você. É como plantar uma semente que vira uma árvore com muitos frutos!\\n\\nExemplos:\\n- Guardar na poupança (ganha juros)\\n- Aprender algo novo (investe em você)\\n- Comprar algo que dura muito tempo",
      "illustration": "💎"
    },
    {
      "id": 2,
      "title": "Investindo no futuro",
      "type": "text",
      "content": "Como começar a investir:\\n\\n📚 Invista em educação e aprendizado\\n💰 Coloque dinheiro na poupança\\n🎯 Defina objetivos de longo prazo\\n⏳ Seja paciente - investimentos levam tempo\\n\\nQuanto mais cedo começar, mais seu dinheiro cresce!",
      "illustration": "🌱"
    },
    {
      "id": 3,
      "title": "Quiz Final: Você é um expert!",
      "type": "quiz",
      "questions": [
        {
          "question": "Investir significa:",
          "options": ["Gastar todo dinheiro", "Fazer o dinheiro crescer", "Guardar debaixo do colchão"],
          "correct": 1
        },
        {
          "question": "Qual o melhor investimento para crianças?",
          "options": ["Jogos e brinquedos", "Educação e poupança", "Doces e guloseimas"],
          "correct": 1
        }
      ]
    }
  ]
}'::jsonb);

-- RLS Policies for learning_modules
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view modules" ON learning_modules FOR SELECT TO authenticated USING (true);

-- Create user_module_progress table
CREATE TABLE user_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'locked',
  progress_percent integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  last_accessed_at timestamptz DEFAULT now(),
  quiz_score integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- RLS Policies for user_module_progress
ALTER TABLE user_module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON user_module_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_module_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_module_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger function to unlock next module when one is completed
CREATE OR REPLACE FUNCTION unlock_next_module()
RETURNS TRIGGER AS $$
DECLARE
  next_module_id uuid;
  module_xp integer;
  module_points integer;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get next module in sequence
    SELECT lm.id INTO next_module_id
    FROM learning_modules lm
    WHERE lm.order_index = (
      SELECT order_index + 1 
      FROM learning_modules 
      WHERE id = NEW.module_id
    )
    LIMIT 1;
    
    -- Unlock next module if exists
    IF next_module_id IS NOT NULL THEN
      INSERT INTO user_module_progress (user_id, module_id, status)
      VALUES (NEW.user_id, next_module_id, 'unlocked')
      ON CONFLICT (user_id, module_id) 
      DO UPDATE SET status = 'unlocked', last_accessed_at = now();
    END IF;
    
    -- Grant rewards
    SELECT xp_reward, points_reward INTO module_xp, module_points
    FROM learning_modules 
    WHERE id = NEW.module_id;
    
    UPDATE profiles
    SET 
      current_xp = current_xp + module_xp,
      weekly_xp = weekly_xp + module_xp,
      dream_points = dream_points + module_points
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_module_completed
  AFTER INSERT OR UPDATE ON user_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION unlock_next_module();