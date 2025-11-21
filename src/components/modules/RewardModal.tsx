import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface RewardModalProps {
  open: boolean;
  onClose: () => void;
  xpReward: number;
  pointsReward: number;
  moduleTitle: string;
}

export const RewardModal = ({ open, onClose, xpReward, pointsReward, moduleTitle }: RewardModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center py-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-8xl mb-4"
          >
            🎉
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-2 text-foreground">
            Parabéns!
          </h2>
          
          <p className="text-xl font-semibold mb-2">{moduleTitle}</p>
          <p className="text-gray-600 mb-6">Módulo Completo</p>

          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Você ganhou:</p>
            
            <div className="flex justify-center gap-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-[#7C3AED] mb-1">
                  +{xpReward}
                </div>
                <div className="text-sm text-gray-600">XP</div>
              </motion.div>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-[#F5A623] mb-1">
                  +{pointsReward}
                </div>
                <div className="text-sm text-gray-600">Pontos</div>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              onClick={onClose} 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg"
            >
              Continue Sua Jornada! 🚀
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
