import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedInput } from "@/components/AnimatedInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Validation schemas
const emailSchema = z.string().trim().email("Email inválido").max(255, "Email muito longo");
const passwordSchema = z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa");

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string): { isValid: boolean; error?: string } => {
    try {
      switch (field) {
        case 'email':
          emailSchema.parse(value);
          break;
        case 'password':
          passwordSchema.parse(value);
          break;
      }
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0].message };
      }
      return { isValid: false, error: "Valor inválido" };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos antes de enviar
    const invalidFields: Record<string, boolean> = {};
    const errors: Record<string, string> = {};
    
    const emailValidation = validateField('email', email);
    if (!emailValidation.isValid) {
      invalidFields.email = true;
      errors.email = emailValidation.error || '';
    }
    
    const passwordValidation = validateField('password', password);
    if (!passwordValidation.isValid) {
      invalidFields.password = true;
      errors.password = passwordValidation.error || '';
    }
    
    // Se houver erros, mostrar e não prosseguir
    if (Object.keys(errors).length > 0) {
      setShakeFields(invalidFields);
      setValidationErrors(errors);
      
      // Remover shake após animação
      setTimeout(() => {
        setShakeFields({});
      }, 500);
      
      toast.error("Preencha os campos corretamente");
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Bem-vindo de volta!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(
        error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message
      );
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
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white">MIRA</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Bem-vindo de volta</CardTitle>
              <CardDescription>
                Entre com sua conta para continuar sua jornada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  <AnimatedInput
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onValueChange={(value) => {
                      setEmail(value);
                      setValidationErrors(prev => ({ ...prev, email: '' }));
                    }}
                    isValid={validateField('email', email).isValid}
                    showValidation={email.length > 0}
                    errorMessage={validationErrors.email}
                    shouldShake={shakeFields.email}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.18 }}
                >
                  <AnimatedInput
                    id="password"
                    label="Senha"
                    type="password"
                    value={password}
                    onValueChange={(value) => {
                      setPassword(value);
                      setValidationErrors(prev => ({ ...prev, password: '' }));
                    }}
                    isValid={validateField('password', password).isValid}
                    showValidation={password.length > 0}
                    errorMessage={validationErrors.password}
                    shouldShake={shakeFields.password}
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.26 }}
                >
                  <Button
                    type="submit"
                    className="w-full gradient-primary"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-primary hover:underline text-center w-full block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.34 }}
                >
                  Esqueceu sua senha?
                </motion.button>
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
      </motion.div>
    </div>
  );
};

export default Login;
