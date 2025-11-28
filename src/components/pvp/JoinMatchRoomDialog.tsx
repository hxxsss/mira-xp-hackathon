import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Plus, Crown } from "lucide-react";

interface JoinMatchRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  userId: string;
  onJoinSuccess: (groupId: string) => void;
}

interface Group {
  id: string;
  name: string;
  leader_user_id: string;
  member_count: number;
}

export const JoinMatchRoomDialog = ({ 
  open, 
  onOpenChange, 
  matchId, 
  userId,
  onJoinSuccess 
}: JoinMatchRoomDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [match, setMatch] = useState<any>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    if (open) {
      loadMatchAndGroups();
    }
  }, [open, matchId]);

  const loadMatchAndGroups = async () => {
    setLoading(true);

    // Buscar dados da partida
    const { data: matchData } = await supabase
      .from('pvp_matches')
      .select('*')
      .eq('id', matchId)
      .single();

    setMatch(matchData);

    // Buscar grupos existentes
    const { data: groupsData } = await supabase
      .from('pvp_groups')
      .select('*')
      .eq('match_id', matchId);

    if (groupsData) {
      // Buscar contagem de membros de cada grupo
      const groupsWithCount = await Promise.all(
        groupsData.map(async (group) => {
          const { count } = await supabase
            .from('pvp_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            member_count: count || 0
          };
        })
      );

      setGroups(groupsWithCount);
    }

    setLoading(false);
  };

  const handleJoinGroup = async (groupId: string) => {
    setLoading(true);

    try {
      // Verificar XP do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_xp')
        .eq('id', userId)
        .single();

      if (!profile || profile.current_xp < match.xp_bet) {
        toast({
          title: "XP Insuficiente",
          description: `Você precisa de ${match.xp_bet} XP para entrar nesta partida.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Deduzir XP
      const { error: xpError } = await supabase
        .from('profiles')
        .update({ current_xp: profile.current_xp - match.xp_bet })
        .eq('id', userId);

      if (xpError) throw xpError;

      // Adicionar ao grupo
      const { error: memberError } = await supabase
        .from('pvp_group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          is_ready: false
        });

      if (memberError) {
        // Rollback XP
        await supabase
          .from('profiles')
          .update({ current_xp: profile.current_xp })
          .eq('id', userId);
        
        throw memberError;
      }

      toast({
        title: "Sucesso!",
        description: "Você entrou no grupo!",
      });

      onJoinSuccess(groupId);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível entrar no grupo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Nome Inválido",
        description: "Por favor, insira um nome para o grupo.",
        variant: "destructive",
      });
      return;
    }

    setCreatingGroup(true);

    try {
      // Verificar XP do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_xp')
        .eq('id', userId)
        .single();

      if (!profile || profile.current_xp < match.xp_bet) {
        toast({
          title: "XP Insuficiente",
          description: `Você precisa de ${match.xp_bet} XP para criar um grupo.`,
          variant: "destructive",
        });
        setCreatingGroup(false);
        return;
      }

      // Deduzir XP
      const { error: xpError } = await supabase
        .from('profiles')
        .update({ current_xp: profile.current_xp - match.xp_bet })
        .eq('id', userId);

      if (xpError) throw xpError;

      // Criar novo grupo
      const { data: newGroup, error: groupError } = await supabase
        .from('pvp_groups')
        .insert({
          match_id: matchId,
          name: newGroupName,
          leader_user_id: userId,
          invite_code: generateCode(),
          ready_to_start: false
        })
        .select()
        .single();

      if (groupError) {
        // Rollback XP
        await supabase
          .from('profiles')
          .update({ current_xp: profile.current_xp })
          .eq('id', userId);
        
        throw groupError;
      }

      // Adicionar líder ao grupo
      const { error: memberError } = await supabase
        .from('pvp_group_members')
        .insert({
          group_id: newGroup.id,
          user_id: userId,
          is_ready: false
        });

      if (memberError) {
        // Rollback - deletar grupo e restaurar XP
        await supabase.from('pvp_groups').delete().eq('id', newGroup.id);
        await supabase
          .from('profiles')
          .update({ current_xp: profile.current_xp })
          .eq('id', userId);
        
        throw memberError;
      }

      toast({
        title: "Grupo Criado!",
        description: `Grupo "${newGroupName}" criado com sucesso!`,
      });

      onJoinSuccess(newGroup.id);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o grupo.",
        variant: "destructive",
      });
    } finally {
      setCreatingGroup(false);
    }
  };

  const canCreateMoreGroups = match && groups.length < match.max_groups;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center neon-text">
            Entrar na Sala
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações da Partida */}
            {match && (
              <Card className="p-4 bg-white/10 border-cyan-400">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-400">Aposta</p>
                    <p className="text-lg font-bold text-yellow-400">{match.xp_bet} XP</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Dificuldade</p>
                    <p className="text-lg font-bold text-purple-400 capitalize">{match.difficulty_level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Grupos</p>
                    <p className="text-lg font-bold text-cyan-400">{groups.length}/{match.max_groups}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Grupos Existentes */}
            {!showCreateGroup && (
              <>
                <div>
                  <h3 className="text-lg font-bold mb-3 text-white">Grupos Disponíveis</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {groups
                      .sort((a, b) => {
                        if (!match) return 0;
                        const aIsHost = a.leader_user_id === match.host_user_id;
                        const bIsHost = b.leader_user_id === match.host_user_id;
                        if (aIsHost && !bIsHost) return -1;
                        if (!aIsHost && bIsHost) return 1;
                        return 0;
                      })
                      .map((group) => {
                        const isHostGroup = match && group.leader_user_id === match.host_user_id;
                        return (
                          <Card 
                            key={group.id}
                            className="p-4 bg-white/5 border-cyan-400/50 hover:border-cyan-400 transition-all cursor-pointer"
                            onClick={() => handleJoinGroup(group.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-cyan-400" />
                                <div>
                                  <p className="font-bold text-white flex items-center gap-2">
                                    {group.name}
                                    {isHostGroup && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/60">
                                        Grupo do Host
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-400">{group.member_count} membros</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                Entrar
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                  </div>
                </div>

                {/* Botão Criar Novo Grupo */}
                {canCreateMoreGroups && (
                  <Button
                    onClick={() => setShowCreateGroup(true)}
                    className="w-full arcade-button"
                    variant="outline"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Novo Grupo
                  </Button>
                )}
              </>
            )}

            {/* Formulário Criar Grupo */}
            {showCreateGroup && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName" className="text-white">Nome do Grupo</Label>
                  <Input
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Ex: Equipe Rocket"
                    maxLength={30}
                    className="glass-input"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowCreateGroup(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={creatingGroup}
                    className="flex-1 arcade-button"
                  >
                    {creatingGroup ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Crown className="w-5 h-5 mr-2" />
                        Criar Grupo
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};