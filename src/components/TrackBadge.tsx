import { Lock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TrackBadgeProps {
  name: string;
  icon: string;
  status: 'locked' | 'unlocked' | 'completed';
  isActive: boolean;
  onClick: () => void;
}

export const TrackBadge = ({ name, icon, status, isActive, onClick }: TrackBadgeProps) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      className={cn(
        "relative group transition-all duration-300",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Badge Container */}
      <div className="relative w-48 h-32">
        {/* Top Badge Part */}
        <div className={cn(
          "absolute inset-x-0 top-0 h-20 rounded-t-2xl border-4 flex flex-col items-center justify-center transition-all duration-300",
          isActive 
            ? "bg-white border-white shadow-[0_0_30px_rgba(255,255,255,0.8)]" 
            : "bg-white/95 border-purple-400 shadow-lg",
          !isLocked && !isActive && "group-hover:border-purple-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        )}>
          {/* Icon and Name */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "text-3xl transition-transform duration-300",
              !isLocked && "group-hover:scale-110"
            )}>
              {icon}
            </div>
            <span className={cn(
              "font-black text-lg tracking-tight",
              isActive ? "text-gray-900" : "text-gray-800"
            )}>
              {name}
            </span>
          </div>

          {/* Completion Check */}
          {isCompleted && (
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Bottom Shield Part */}
        <div className={cn(
          "absolute inset-x-0 top-16 h-16 rounded-b-3xl border-4 border-t-0 flex items-center justify-center transition-all duration-300",
          isActive
            ? "bg-gradient-to-b from-purple-600 to-purple-800 border-purple-600 shadow-[0_0_30px_rgba(168,85,247,0.6)]"
            : "bg-gradient-to-b from-purple-500 to-purple-700 border-purple-400 shadow-lg",
          !isLocked && !isActive && "group-hover:from-purple-400 group-hover:to-purple-600 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
        )}>
          {/* Lock Icon */}
          {isLocked && (
            <div className="w-10 h-10 bg-purple-900/80 rounded-full flex items-center justify-center border-2 border-purple-400/50 shadow-inner">
              <Lock className="w-5 h-5 text-purple-200" strokeWidth={2.5} />
            </div>
          )}

          {/* Unlock Indicator */}
          {!isLocked && (
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          )}
        </div>

        {/* Active Glow Effect */}
        {isActive && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-xl animate-pulse -z-10" />
        )}
      </div>

      {/* Hover Glow */}
      {!isLocked && !isActive && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 blur-lg transition-all duration-300 -z-10" />
      )}
    </motion.button>
  );
};
