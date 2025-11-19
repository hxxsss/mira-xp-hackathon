import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionTracking } from "@/hooks/useSessionTracking";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  useSessionTracking();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-gradient">DreamUp</h1>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Bem-vindo de volta</CardTitle>
            <CardDescription>
              Entre com sua conta para continuar sua jornada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-primary hover:underline text-center w-full block mt-2"
              >
                Esqueceu sua senha?
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <button
                onClick={() => navigate("/onboarding")}
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
