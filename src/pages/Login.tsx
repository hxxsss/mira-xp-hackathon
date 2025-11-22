import { useState } from "react";
import { Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border relative">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent opacity-40 blur-3xl -mt-20"></div>
        
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-card p-4 rounded-2xl shadow-lg mb-6">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Target className="w-7 h-7 text-primary-foreground" />
              </div>
            </div>
            <div className="p-0">
              <h2 className="text-2xl font-bold text-foreground text-center">
                Bem-vindo de volta
              </h2>
              <p className="text-center text-muted-foreground mt-2">
                Entre com sua conta para continuar sua jornada
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-primary/50 focus:border-primary w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border"
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-border text-foreground pr-12 h-12 rounded-lg focus-visible:ring-2 focus-visible:ring-primary/50 focus:border-primary w-full px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 border"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-muted inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-primary text-primary-foreground font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="p-0 mt-6">
            <p className="text-sm text-center text-muted-foreground w-full">
              Não tem uma conta?{" "}
              <button
                onClick={() => navigate("/onboarding")}
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
