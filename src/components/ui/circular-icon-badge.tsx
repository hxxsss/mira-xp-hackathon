import React from "react";
import { cn } from "@/lib/utils";

interface CircularIconBadgeProps {
  icon: React.ReactNode;
  gradientColors: string;
  size?: 'sm' | 'md' | 'lg';
  badge?: {
    content: string | number;
    color: string;
  };
  className?: string;
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

const iconSizeMap = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export const CircularIconBadge: React.FC<CircularIconBadgeProps> = ({
  icon,
  gradientColors,
  size = 'md',
  badge,
  className,
}) => {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-2xl opacity-60 animate-pulse bg-gradient-to-br",
          gradientColors
        )}
      />
      
      {/* Icon container */}
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          "ring-4 ring-white/50 shadow-2xl bg-gradient-to-br",
          sizeMap[size],
          gradientColors
        )}
      >
        <div className={cn("text-white", iconSizeMap[size])}>
          {icon}
        </div>
      </div>

      {/* Floating badge */}
      {badge && (
        <div
          className={cn(
            "absolute -top-2 -right-2 rounded-full px-2 py-0.5",
            "text-xs font-bold text-white shadow-lg ring-2 ring-white",
            badge.color
          )}
        >
          {badge.content}
        </div>
      )}
    </div>
  );
};
