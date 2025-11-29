import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { avatars } from "@/components/ui/avatar-picker";

interface GroupMember {
  id: string;
  user_id: string;
  score: number;
  profiles?: {
    name: string;
    avatar_id: number;
  };
}

interface GroupData {
  id: string;
  name: string;
  total_score: number;
  pvp_group_members: GroupMember[];
}

interface GroupResultsModalProps {
  open: boolean;
  groups: GroupData[];
  userGroupId: string;
  xpGained: number;
  onClose: () => void;
}

export const GroupResultsModal = ({ open, groups, userGroupId, xpGained, onClose }: GroupResultsModalProps) => {
  // Ordenar grupos por pontuação total
  const sortedGroups = [...groups].sort((a, b) => b.total_score - a.total_score);
  const userGroup = groups.find(g => g.id === userGroupId);
  const userPosition = sortedGroups.findIndex(g => g.id === userGroupId) + 1;

  // Ordenar membros de cada grupo por pontuação individual
  const groupsWithSortedMembers = sortedGroups.map(group => ({
    ...group,
    pvp_group_members: [...(group.pvp_group_members || [])].sort((a, b) => b.score - a.score)
  }));

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500";
      case 2:
        return "from-gray-400/20 to-gray-500/20 border-gray-400";
      case 3:
        return "from-amber-600/20 to-amber-700/20 border-amber-600";
      default:
        return "from-purple-500/20 to-purple-600/20 border-purple-500";
    }
  };

  const getXpChange = () => {
    if (xpGained > 0) return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (xpGained < 0) return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-purple-900/98 to-indigo-900/98 border-purple-500 p-0">
        <div className="p-6 space-y-6">
          {/* Header com resultado do usuário */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="flex justify-center"
            >
              {getMedalIcon(userPosition)}
            </motion.div>

            <h2 className="text-4xl font-black text-white">
              {userPosition === 1 ? "🎉 VITÓRIA!" : userPosition === 2 ? "🥈 2º Lugar" : userPosition === 3 ? "🥉 3º Lugar" : `${userPosition}º Lugar`}
            </h2>

            <div className="bg-white/10 rounded-xl p-4 inline-block">
              <p className="text-purple-200 text-sm mb-1">XP Conquistado</p>
              <div className="flex items-center gap-2 justify-center">
                {getXpChange()}
                <span className={`text-3xl font-bold ${xpGained > 0 ? 'text-green-400' : xpGained < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {xpGained > 0 ? '+' : ''}{xpGained}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Pódio dos Grupos */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center text-purple-200">
              🏆 Classificação dos Grupos
            </h3>

            {groupsWithSortedMembers.map((group, index) => {
              const position = index + 1;
              const isUserGroup = group.id === userGroupId;

              return (
                <motion.div
                  key={group.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-r ${getPositionColor(position)} border-2 rounded-2xl p-4 ${
                    isUserGroup ? 'ring-2 ring-cyan-400' : ''
                  }`}
                >
                  {/* Cabeçalho do Grupo */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
                        <span className="text-2xl font-black text-white">{position}</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          {group.name}
                          {isUserGroup && <span className="text-xs bg-cyan-500 px-2 py-1 rounded-full">Seu Grupo</span>}
                        </h4>
                        <p className="text-purple-200 text-sm">
                          {group.pvp_group_members?.length || 0} jogadores
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-purple-200 text-sm">Pontuação Total</p>
                      <p className="text-3xl font-black text-white">{group.total_score}</p>
                    </div>
                  </div>

                  {/* Membros do Grupo */}
                  <div className="space-y-2 bg-black/20 rounded-xl p-3">
                    <p className="text-xs font-medium text-purple-300 mb-2">Desempenho Individual:</p>
                    {group.pvp_group_members?.map((member, memberIndex) => {
                      const avatar = avatars.find(a => a.id === (member.profiles?.avatar_id || 1)) || avatars[0];
                      
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center">
                              <img 
                                src={avatar.img} 
                                alt={avatar.alt}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {member.profiles?.name || 'Jogador'}
                                {memberIndex === 0 && <span className="ml-2 text-xs text-yellow-400">⭐ MVP</span>}
                              </p>
                              <p className="text-xs text-purple-300">
                                {memberIndex + 1}º no grupo
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-white">{member.score}</p>
                            <p className="text-xs text-purple-300">pontos</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Botão Voltar para Arena */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg py-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para Arena
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
