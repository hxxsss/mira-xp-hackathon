import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Lock, Trash2, LogOut, Pencil, Award, Trophy, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface Profile {
  name: string;
  email: string;
  age: number | null;
  avatar_id: number;
  current_xp: number;
  dream_points: number;
  created_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Change password form
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
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

    setChangingPassword(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Senha atual incorreta");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      setShowChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Conta deletada",
        description: "Sua conta foi deletada com sucesso.",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao deletar conta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('pt-BR', { month: 'long' });
    const year = date.getFullYear();
    return `${month} de ${year}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Stats */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Avatar + User Info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Avatar Card - Estilo Duolingo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-card rounded-[40px] p-8 shadow-2xl aspect-square flex items-center justify-center"
            >
              {/* Empty space for mascot */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                  <span className="text-6xl opacity-20">👤</span>
                </div>
                <p className="text-sm text-muted-foreground">Seu mascote aparecerá aqui</p>
                <p className="text-xs text-muted-foreground mt-1 opacity-60">Em breve você poderá personalizar!</p>
              </div>

              {/* Edit Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-6 right-6 w-14 h-14 bg-[hsl(var(--yellow-soft))] rounded-2xl flex items-center justify-center hover:bg-yellow-100 transition-all shadow-lg"
              >
                <Pencil className="w-6 h-6 text-primary" />
              </motion.button>
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-2"
            >
              <h1 className="text-4xl font-bold text-foreground">{profile?.name}</h1>
              <p className="text-muted-foreground">@{profile?.email.split('@')[0]}</p>
              <p className="text-sm text-muted-foreground/70">
                Por aqui desde {profile?.created_at && formatDate(profile.created_at)}
              </p>
            </motion.div>

          </div>

          {/* Right Column - Settings & Info */}
          <div className="lg:col-span-7 space-y-6">

            {/* Statistics Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Trophy className="w-5 h-5 text-primary" />
                    Estatísticas
                  </CardTitle>
                  <CardDescription>Seu progresso na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        <span className="text-sm text-muted-foreground">XP Total</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{profile?.current_xp || 0}</p>
                    </div>
                    <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💎</span>
                        <span className="text-sm text-muted-foreground">Diamantes</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">{profile?.dream_points || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Award className="w-5 h-5 text-primary" />
                    Informações da Conta
                  </CardTitle>
                  <CardDescription>Seus dados cadastrais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Email</Label>
                    <div className="px-4 py-3 bg-muted/20 rounded-xl border border-border">
                      <p className="text-foreground">{profile?.email}</p>
                    </div>
                  </div>
                  {profile?.age && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Idade</Label>
                      <div className="px-4 py-3 bg-muted/20 rounded-xl border border-border">
                        <p className="text-foreground">{profile.age} anos</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Change Password */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Lock className="w-5 h-5 text-primary" />
                    Segurança
                  </CardTitle>
                  <CardDescription>
                    Mantenha sua conta protegida
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showChangePassword ? (
                    <Button 
                      onClick={() => setShowChangePassword(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Alterar Senha
                    </Button>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-foreground">Senha Atual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="bg-background border-border text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-foreground">Nova Senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="bg-background border-border text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Nova Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="bg-background border-border text-foreground"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={changingPassword}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {changingPassword ? "Alterando..." : "Salvar Nova Senha"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowChangePassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                          className="border-border text-foreground hover:bg-muted"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Logout */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <LogOut className="w-5 h-5 text-primary" />
                    Sessão
                  </CardTitle>
                  <CardDescription>
                    Encerre sua sessão atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate("/");
                    }}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Sair da Conta
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Delete Account - Danger Zone */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2 border-destructive/50 hover:shadow-lg hover:shadow-destructive/20 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5" />
                    Zona de Perigo
                  </CardTitle>
                  <CardDescription>
                    Ações irreversíveis para sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Deletar Conta Permanentemente
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Deletar Conta"
        description="Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita e todos os seus dados serão permanentemente removidos."
        confirmText="Sim, deletar minha conta"
        onConfirm={handleDeleteAccount}
        variant="danger"
      />
    </div>
  );
}
