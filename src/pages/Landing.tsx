import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Wallet, DollarSign, PiggyBank, CreditCard, BarChart3, Sparkles, PlayCircle, Trophy, Brain, LineChart, Swords, Users, User, Gift, Clock, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import charactersGroup from "@/assets/characters-group.png";
const Landing = () => {
  const navigate = useNavigate();
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);
  return <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-wider font-sans">mira</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('inicio')} className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Início
            </button>
            <button onClick={() => scrollToSection('gamificacao')} className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Gamificação
            </button>
            <button onClick={() => scrollToSection('oraculo')} className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Oráculo
            </button>
            <button onClick={() => scrollToSection('financas')} className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Finanças
            </button>
            <button onClick={() => scrollToSection('arena-pvp')} className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Arena PvP
            </button>
            <button onClick={() => scrollToSection('mascotes')} className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Mascotes
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/login")} variant="ghost" className="text-gray-700 hover:text-gray-900 px-5 py-2.5 rounded-full font-medium hover:bg-gray-100 transition-colors">
              Login
            </Button>
            <Button onClick={() => navigate("/onboarding")} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-200 transition-all duration-300">
              Criar conta
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative w-full pt-12 pb-0 px-6 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative">
          {/* Floating Icons - Left Side */}
          <div className="absolute top-24 left-[15%] w-20 h-20 bg-white rounded-3xl shadow-xl animate-float z-20 hidden lg:flex items-center justify-center">
            <DollarSign className="text-indigo-600 w-10 h-10" />
          </div>
          <div className="absolute top-48 left-[12%] w-20 h-20 bg-white rounded-3xl shadow-xl hidden lg:flex items-center justify-center animate-float-delayed z-20">
            <PiggyBank className="text-green-600 w-10 h-10" />
          </div>
          <div className="absolute top-72 left-[18%] w-20 h-20 bg-white rounded-3xl shadow-xl hidden lg:flex items-center justify-center animate-float z-20">
            <Wallet className="text-purple-600 w-10 h-10" />
          </div>

          {/* Floating Icons - Right Side */}
          <div className="absolute top-20 right-[15%] w-20 h-20 bg-white rounded-3xl shadow-xl hidden lg:flex items-center justify-center animate-float-delayed z-20">
            <CreditCard className="text-blue-600 w-10 h-10" />
          </div>
          <div className="absolute top-44 right-[12%] w-20 h-20 bg-white rounded-3xl shadow-xl hidden lg:flex items-center justify-center animate-float z-20">
            <BarChart3 className="text-orange-600 w-10 h-10" />
          </div>
          <div className="absolute top-68 right-[18%] w-20 h-20 bg-white rounded-3xl shadow-xl hidden lg:flex items-center justify-center animate-float-delayed z-20">
            <TrendingUp className="text-emerald-600 w-10 h-10" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center max-w-2xl mx-auto pt-32">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3 md:text-5xl">
              Onde suas <span className="text-indigo-600">metas</span> se tornam{" "}
              <span className="text-indigo-600">realidade</span> com um clique
            </h1>

            <p className="text-sm md:text-base text-gray-500 mb-6 max-w-xl mx-auto font-normal">
              Alcance seus objetivos financeiros em menos tempo com gamificação e educação financeira.
            </p>

            <button onClick={() => navigate("/login")} className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
              <PlayCircle className="w-6 h-6" />
              <span>Ver Demo</span>
              <span className="text-gray-400">2min</span>
            </button>
          </div>

          {/* Gradient Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-8 w-screen h-96 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 blur-3xl opacity-60 z-0"></div>

          {/* Scroll Animation Container */}
          <div className="relative z-10 w-full -mt-56">
            <ContainerScroll titleComponent={<></>}>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 h-full w-full rounded-2xl">
                <div className="grid grid-cols-3 gap-6 h-full max-w-5xl mx-auto">
                  {/* Card 1 - Azul claro */}
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center">
                    <PiggyBank className="w-20 h-20 text-blue-600" />
                  </div>
                  
                  {/* Card 2 - Roxo claro */}
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center">
                    <TrendingUp className="w-20 h-20 text-purple-600" />
                  </div>
                  
                  {/* Card 3 - Cyan claro */}
                  <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-3xl flex items-center justify-center">
                    <Sparkles className="w-20 h-20 text-cyan-600" />
                  </div>
                </div>
              </div>
            </ContainerScroll>
          </div>

          {/* Text Below Tablet */}
          <div className="relative z-10 text-center max-w-2xl mx-auto mt-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Onde suas metas se tornam
            </h2>
            <span className="text-6xl md:text-8xl font-bold text-gray-900">
              realidade
            </span>
          </div>

        </div>
      </section>

      {/* Gamificação Section */}
      <section id="gamificacao" className="py-24 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Trophy className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Gamificação</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Aprenda educação financeira de forma divertida com nosso sistema de pontos, níveis e recompensas
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Target className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sistema de XP</h3>
              <p className="text-gray-600">Ganhe experiência completando módulos e desafios financeiros</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Trophy className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Conquistas</h3>
              <p className="text-gray-600">Desbloqueie conquistas especiais ao atingir marcos importantes</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Sparkles className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recompensas</h3>
              <p className="text-gray-600">Troque seus pontos por itens exclusivos na loja</p>
            </div>
          </div>
        </div>
      </section>

      {/* Oráculo Section */}
      <section id="oraculo" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Oráculo Financeiro</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Seu assistente financeiro com IA que te ajuda a tomar decisões inteligentes sobre suas compras e metas
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-12 rounded-3xl max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Análise Inteligente</h3>
                <p className="text-gray-700">O Oráculo analisa seu perfil financeiro e suas metas para te dar conselhos personalizados sobre cada compra</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Decisões Conscientes</h3>
                <p className="text-gray-700">Receba aprovações, alertas ou recomendações baseadas no impacto de cada decisão em suas metas financeiras</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Finanças Section */}
      <section id="financas" className="py-24 px-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <LineChart className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Gestão Financeira</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Controle completo das suas finanças pessoais em um só lugar
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <Wallet className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Transações</h3>
              <p className="text-gray-600">Registre e acompanhe todas as suas receitas e despesas</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <BarChart3 className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Orçamento</h3>
              <p className="text-gray-600">Crie orçamentos por categoria e monitore seus gastos</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <CreditCard className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dívidas</h3>
              <p className="text-gray-600">Gerencie e acompanhe o pagamento das suas dívidas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Arena PvP Section */}
      <section id="arena-pvp" className="py-24 px-6 bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-purple-800/40 via-pink-800/40 to-orange-800/40 backdrop-blur-sm rounded-[3rem] p-8 md:p-16 shadow-2xl border border-purple-500/30">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold shadow-lg">
                  <Swords className="w-5 h-5" />
                  <span>PvP</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight neon-text">Arena de Batalha</h2>
                <p className="text-lg text-purple-100 leading-relaxed">
                  Desafie amigos em duelos épicos de conhecimento financeiro. Teste suas habilidades, ganhe recompensas e suba no ranking global.
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-6 rounded-2xl shadow-md border-2 border-purple-400/50 hover:border-pink-400 transition-all hover:scale-105 cursor-pointer group">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <User className="text-2xl text-purple-300 group-hover:scale-110 transition-transform" />
                      <span className="text-xl font-bold text-white">vs</span>
                      <User className="text-2xl text-pink-300 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-center font-semibold text-purple-100">Duelo 1 vs 1</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 backdrop-blur-sm p-6 rounded-2xl shadow-md border-2 border-pink-400/50 hover:border-orange-400 transition-all hover:scale-105 cursor-pointer group">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="text-3xl text-orange-300 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-center font-semibold text-purple-100">Batalha em Grupo</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-purple-500/30 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-purple-400/50">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-purple-100">Ranking Global</span>
                  </div>
                  <div className="flex items-center gap-2 bg-pink-500/30 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-pink-400/50">
                    <Gift className="w-5 h-5 text-purple-300" />
                    <span className="text-sm font-semibold text-purple-100">Recompensas</span>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-500/30 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-orange-400/50">
                    <Clock className="w-5 h-5 text-orange-300" />
                    <span className="text-sm font-semibold text-purple-100">Tempo Real</span>
                  </div>
                </div>
                
                <button onClick={() => navigate("/onboarding")} className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3 whitespace-nowrap cursor-pointer arcade-button">
                  <span>Entrar na Arena</span>
                  <Swords className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 w-full">
                <div className="relative h-80 lg:h-96 w-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm"></div>
                  <div className="relative z-10 flex items-center justify-center gap-8">
                    <div className="flex flex-col items-center gap-3 animate-pulse">
                      <div className="w-20 h-20 bg-white/90 rounded-full shadow-xl flex items-center justify-center border-4 border-purple-400">
                        <User className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg">
                        <span className="font-bold text-purple-600">Você</span>
                      </div>
                    </div>
                    <div className="text-white font-bold text-6xl drop-shadow-lg animate-bounce neon-text">VS</div>
                    <div className="flex flex-col items-center gap-3 animate-pulse" style={{
                    animationDelay: '0.5s'
                  }}>
                      <div className="w-20 h-20 bg-white/90 rounded-full shadow-xl flex items-center justify-center border-4 border-pink-400">
                        <User className="w-8 h-8 text-pink-600" />
                      </div>
                      <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg">
                        <span className="font-bold text-pink-600">Rival</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-orange-600 shadow-lg">
                    <Flame className="w-4 h-4 inline mr-1" /> Em Andamento
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mascotes Section */}
      <section id="mascotes" className="py-24 px-6 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Users className="w-16 h-16 text-cyan-600 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Conheça os Mascotes</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha seu companheiro de jornada e personalize sua experiência
            </p>
          </div>
          <div className="p-8 md:p-12 rounded-3xl max-w-6xl mx-auto bg-[#91f0ff]">
            <div className="flex flex-col items-center gap-8">
              <img src={charactersGroup} alt="Ricky, Mila, Ale e Trix - Os mascotes do MIRA" className="w-full max-w-4xl h-auto" />
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold bg-transparent text-[#008abc]">Ricky, Mila, Ale e Trix</h3>
                <p className="text-lg text-gray-700 max-w-2xl">
                  Cada mascote tem sua própria personalidade e vai te acompanhar em toda sua jornada de educação financeira
                </p>
                <Button onClick={() => navigate("/onboarding")} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg rounded-full font-bold shadow-lg hover:shadow-xl transition-all">
                  Escolher Meu Mascote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg text-gray-600">
            Educação financeira com <span className="font-semibold text-indigo-600">gamificação</span>
          </p>
        </div>
      </section>
    </div>;
};
export default Landing;