import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Wallet, DollarSign, PiggyBank, CreditCard, BarChart3, Sparkles, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
            <a href="#home" className="text-gray-700 hover:text-gray-900 font-medium">Início</a>
            <a href="#recursos" className="text-gray-700 hover:text-gray-900 font-medium">Recursos</a>
            <a href="#produto" className="text-gray-700 hover:text-gray-900 font-medium">Produto</a>
            <a href="#precos" className="text-gray-700 hover:text-gray-900 font-medium">Preços</a>
          </div>

          <Button onClick={() => navigate("/onboarding")} className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-colors">
            Começar Agora
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-0 px-6 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto relative">
          
          {/* Floating Icons - Left Side */}
          <div className="absolute top-24 left-[15%] w-20 h-20 bg-white rounded-3xl shadow-xl animate-float z-20 flex-row flex items-center justify-center">
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

          {/* Bottom Floating Icons */}
          <div className="absolute bottom-[420px] left-[20%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float z-20">
            <Target className="text-pink-600 w-10 h-10" />
          </div>
          <div className="absolute bottom-[380px] left-[10%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float-delayed z-20">
            <Sparkles className="text-purple-600 w-10 h-10" />
          </div>
          <div className="absolute bottom-[420px] right-[20%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float-delayed z-20">
            <DollarSign className="text-red-500 w-10 h-10" />
          </div>
          <div className="absolute bottom-[380px] right-[10%] w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center animate-float z-20">
            <BarChart3 className="text-green-600 w-10 h-10" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6 text-center md:text-6xl">
              Onde suas metas se tornam
realidade em menos tempo                   <span className="text-indigo-600">metas</span> se tornam
              <br />
              <span className="text-indigo-600">realidade</span> com um clique
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Transforme suas metas financeiras em conquistas reais. Alcance seus objetivos em menos t                        
            </p>

            <button onClick={() => navigate("/login")} className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
              <PlayCircle className="w-6 h-6" />
              <span>Ver Demo</span>
              <span className="text-gray-400">2min</span>
            </button>
          </div>

          {/* Gradient Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 mt-16 w-screen h-80 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 blur-3xl opacity-50 z-0"></div>

          {/* Dashboard Mockup */}
          <div className="relative z-10 mt-32 max-w-5xl mx-auto pb-32">
            <div className="relative bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-3xl overflow-hidden">
                {/* Browser Bar */}
                <div className="bg-gray-100 px-6 py-4 flex items-center gap-2 border-b border-gray-200">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                
                {/* Dashboard Preview */}
                <div className="bg-white p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Target className="text-gray-600 w-5 h-5" />
                    </div>
                    <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Suas Metas Financeiras</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                      <PiggyBank className="w-12 h-12 text-blue-600" />
                    </div>
                    <div className="h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-purple-600" />
                    </div>
                    <div className="h-32 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-cyan-600" />
                    </div>
                  </div>
                </div>
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