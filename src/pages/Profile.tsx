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
import { avatars } from "@/components/ui/avatar-picker";

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Target className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-600 font-medium text-lg">Carregando perfil...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header with Stats */}
      <div className="border-b border-indigo-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-indigo-600 hover:bg-indigo-50"
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
              className="relative bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-[40px] p-8 shadow-2xl aspect-square flex items-center justify-center"
            >
              {/* Mascot Display */}
              <div className="text-center">
                <motion.div 
                  className="w-40 h-40 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl border-4 border-white"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="scale-[4]">
                    {avatars.find(a => a.id === profile?.avatar_id)?.svg || avatars[0].svg}
                  </div>
                </motion.div>
                <p className="text-sm text-gray-600 font-medium">Seu Mascote</p>
                <p className="text-xs text-gray-500 mt-1">Avatar #{profile?.avatar_id}</p>
              </div>

              {/* Edit Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="absolute top-6 right-6 w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center hover:bg-indigo-200 transition-all shadow-lg"
              >
                <Pencil className="w-6 h-6 text-indigo-600" />
              </motion.button>
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-2"
            >
              <h1 className="text-4xl font-bold text-gray-900">{profile?.name}</h1>
              <p className="text-gray-600">@{profile?.email.split('@')[0]}</p>
              <p className="text-sm text-gray-500">
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
              <Card className="border-2 border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 transition-shadow bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Trophy className="w-5 h-5 text-indigo-600" />
                    Estatísticas
                  </CardTitle>
                  <CardDescription>Seu progresso na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-gray-600">XP Total</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profile?.current_xp || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💎</span>
                        <span className="text-sm text-gray-600">Diamantes</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{profile?.dream_points || 0}</p>
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
              <Card className="border-2 border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 transition-shadow bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Award className="w-5 h-5 text-indigo-600" />
                    Informações da Conta
                  </CardTitle>
                  <CardDescription>Seus dados cadastrais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-600">Email</Label>
                    <div className="px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-200">
                      <p className="text-gray-900">{profile?.email}</p>
                    </div>
                  </div>
                  {profile?.age && (
                    <div className="space-y-2">
                      <Label className="text-gray-600">Idade</Label>
                      <div className="px-4 py-3 bg-indigo-50 rounded-xl border border-indigo-200">
                        <p className="text-gray-900">{profile.age} anos</p>
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
              <Card className="border-2 border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 transition-shadow bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Lock className="w-5 h-5 text-indigo-600" />
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Alterar Senha
                    </Button>
                  ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-gray-900">Senha Atual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="bg-white border-indigo-200 text-gray-900"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-gray-900">Nova Senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="bg-white border-indigo-200 text-gray-900"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-900">Confirmar Nova Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="bg-white border-indigo-200 text-gray-900"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={changingPassword}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                          className="border-indigo-200 text-gray-900 hover:bg-indigo-50"
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
              <Card className="border-2 border-indigo-200 hover:shadow-lg hover:shadow-indigo-100 transition-shadow bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <LogOut className="w-5 h-5 text-indigo-600" />
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
                    className="border-indigo-200 text-gray-900 hover:bg-indigo-50"
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
