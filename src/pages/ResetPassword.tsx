import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("verify-reset-code", {
        body: { email, code, newPassword },
      });

      if (error) throw error;

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso. Faça login com sua nova senha.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Código inválido ou expirado.",
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
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-center">
              Digite o código de 4 dígitos enviado para seu email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!emailFromState && (
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
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Código de Recuperação</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={4}
                    value={code}
                    onChange={setCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || code.length !== 4}>
                {loading ? "Alterando..." : "Alterar Senha"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}