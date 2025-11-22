import { useNavigate, useLocation } from "react-router-dom";
import { Trophy, Wallet } from "lucide-react";
import { avatars } from "@/components/ui/avatar-picker";
import { motion } from "framer-motion";

interface NavigationDockProps {
  avatarId?: number;
}

export function NavigationDock({ avatarId = 1 }: NavigationDockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const selectedAvatar = avatars.find(a => a.id === avatarId) || avatars[0];
  
  const navItems = [
    {
      title: "Perfil",
      icon: (
        <motion.div 
          className="w-8 h-8 flex items-center justify-center"
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {selectedAvatar.svg}
        </motion.div>
      ),
      href: "/profile",
    },
    {
      title: "Ranking",
      icon: <Trophy className="w-6 h-6" />,
      href: "/ranking",
    },
    {
      title: "Finanças",
      icon: <Wallet className="w-6 h-6" />,
      href: "/financas",
    },
  ];

  return (
    <div className="flex items-center gap-3">
      {navItems.map((item, idx) => {
        const active = isActive(item.href);
        return (
          <button
            key={idx}
            onClick={() => navigate(item.href)}
            className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              active 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-2 ring-indigo-300 scale-105' 
                : 'bg-indigo-100 hover:bg-indigo-200 hover:scale-105'
            }`}
            title={item.title}
          >
            <div className={active ? 'text-white' : 'text-indigo-600'}>
              {item.icon}
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {item.title}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
