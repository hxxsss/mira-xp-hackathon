import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Monitor, Smartphone, Tablet, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface Session {
  id: string;
  device_info: string | null;
  ip_address: string | null;
  last_activity: string;
  created_at: string;
  revoked: boolean;
}

export default function Sessions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokeSessionId, setRevokeSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("active_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("revoked", false)
        .order("last_activity", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar sessões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("active_sessions")
        .update({ revoked: true })
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Sessão encerrada",
        description: "A sessão foi encerrada com sucesso.",
      });

      loadSessions();
    } catch (error: any) {
      toast({
        title: "Erro ao encerrar sessão",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRevokeSessionId(null);
    }
  };

  const getDeviceIcon = (deviceInfo: string | null) => {
    if (!deviceInfo) return <Monitor className="w-5 h-5" />;
    
    const lower = deviceInfo.toLowerCase();
    if (lower.includes("mobile") || lower.includes("iphone") || lower.includes("android")) {
      return <Smartphone className="w-5 h-5" />;
    }
    if (lower.includes("tablet") || lower.includes("ipad")) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Carregando sessões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sessões Ativas</CardTitle>
              <CardDescription>
                Gerencie os dispositivos conectados à sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma sessão ativa encontrada
                </p>
              ) : (
                sessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          {getDeviceIcon(session.device_info)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {session.device_info || "Dispositivo desconhecido"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            IP: {session.ip_address || "Desconhecido"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Última atividade: {formatDate(session.last_activity)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setRevokeSessionId(session.id)}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Encerrar
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        <ConfirmDialog
          open={!!revokeSessionId}
          onOpenChange={(open) => !open && setRevokeSessionId(null)}
          title="Encerrar Sessão"
          description="Tem certeza que deseja encerrar esta sessão? O dispositivo será desconectado imediatamente."
          confirmText="Encerrar Sessão"
          onConfirm={() => revokeSessionId && handleRevokeSession(revokeSessionId)}
          variant="warning"
        />
      </div>
    </div>
  );
}