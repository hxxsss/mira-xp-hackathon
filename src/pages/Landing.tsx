import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Wallet, DollarSign, PiggyBank, CreditCard, BarChart3, Sparkles, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
const Landing = () => {
  const navigate = useNavigate();
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
            <span className="text-2xl font-logo font-bold text-gray-900 tracking-wider">MIRA</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-700 hover:text-gray-900 font-medium">
              Início
            </a>
            <a href="#recursos" className="text-gray-700 hover:text-gray-900 font-medium">
              Recursos
            </a>
            <a href="#produto" className="text-gray-700 hover:text-gray-900 font-medium">
              Produto
            </a>
            <a href="#precos" className="text-gray-700 hover:text-gray-900 font-medium">
              Preços
            </a>
          </div>

          <Button onClick={() => navigate("/onboarding")} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-colors">
            Começar Agora
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full pt-12 pb-0 px-6 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative">
          {/* Floating Icons - Left Side */}
          <div className="absolute top-24 left-[15%] w-20 h-20 bg-white rounded-3xl shadow-xl animate-float z-20 flex items-center justify-center">
            <DollarSign className="text-indigo-600 w-10 h-10" />
          </div>
          <div className="absolute top-48 left-[12%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float-delayed z-20">
            <PiggyBank className="text-green-600 w-10 h-10" />
          </div>
          <div className="absolute top-72 left-[18%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float z-20">
            <Wallet className="text-purple-600 w-10 h-10" />
          </div>

          {/* Floating Icons - Right Side */}
          <div className="absolute top-20 right-[15%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float-delayed z-20">
            <CreditCard className="text-blue-600 w-10 h-10" />
          </div>
          <div className="absolute top-44 right-[12%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float z-20">
            <BarChart3 className="text-orange-600 w-10 h-10" />
          </div>
          <div className="absolute top-68 right-[18%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float-delayed z-20">
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
              <div className="bg-white p-6 h-full w-full">
                <div className="space-y-4 h-full">
                  {/* Header Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 flex flex-col items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-emerald-600 mb-2" />
                      <div className="h-2 w-12 bg-emerald-300 rounded"></div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-3 flex flex-col items-center justify-center">
                      <Wallet className="w-8 h-8 text-rose-600 mb-2" />
                      <div className="h-2 w-12 bg-rose-300 rounded"></div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 flex flex-col items-center justify-center">
                      <PiggyBank className="w-8 h-8 text-blue-600 mb-2" />
                      <div className="h-2 w-12 bg-blue-300 rounded"></div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    {/* Chart/Graph Area */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 flex items-end justify-between gap-1">
                      <div className="w-full h-16 bg-purple-200 rounded-t"></div>
                      <div className="w-full h-24 bg-purple-300 rounded-t"></div>
                      <div className="w-full h-12 bg-purple-200 rounded-t"></div>
                      <div className="w-full h-20 bg-purple-400 rounded-t"></div>
                    </div>

                    {/* Goals/Targets */}
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 flex flex-col gap-2">
                      <Target className="w-8 h-8 text-amber-600 mb-1" />
                      <div className="h-2 w-full bg-amber-200 rounded"></div>
                      <div className="h-2 w-3/4 bg-amber-300 rounded"></div>
                      <div className="h-2 w-1/2 bg-amber-200 rounded"></div>
                    </div>
                  </div>

                  {/* Transaction List */}
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-cyan-300 rounded-full"></div>
                      <div className="h-2 flex-1 bg-cyan-200 rounded"></div>
                      <div className="h-2 w-12 bg-cyan-300 rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-cyan-400 rounded-full"></div>
                      <div className="h-2 flex-1 bg-cyan-300 rounded"></div>
                      <div className="h-2 w-12 bg-cyan-200 rounded"></div>
                    </div>
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