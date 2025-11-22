import { useNavigate, useLocation } from "react-router-dom";
import { User, Trophy, Wallet, Swords, BookOpen, MessageSquare } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

interface NavigationDockProps {
  avatarEmoji?: string;
}

export function NavigationDock({ avatarEmoji = "🦄" }: NavigationDockProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    {
      title: "Perfil",
      icon: <div className="text-2xl">{avatarEmoji}</div>,
      href: "/profile",
    },
    {
      title: "Ranking",
      icon: <Trophy className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/ranking",
    },
    {
      title: "Finanças",
      icon: <Wallet className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/financas",
    },
    {
      title: "PvP Arena",
      icon: <Swords className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/pvp",
    },
    {
      title: "Mentalidade",
      icon: <BookOpen className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/dashboard",
    },
    {
      title: "Oráculo",
      icon: <MessageSquare className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/oracle",
    },
  ];

  return (
    <Dock 
      className="bg-white/80 backdrop-blur-md border border-indigo-200 shadow-xl"
      magnification={70}
      distance={120}
      panelHeight={56}
    >
      {navItems.map((item, idx) => {
        const active = isActive(item.href);
        return (
          <DockItem
            key={idx}
            onClick={() => navigate(item.href)}
            className={`aspect-square rounded-2xl transition-all ${
              active 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg ring-2 ring-indigo-300' 
                : 'bg-indigo-50 hover:bg-indigo-100'
            }`}
          >
            <DockLabel>{item.title}</DockLabel>
            <DockIcon>
              <div className={active ? 'text-white' : ''}>
                {item.icon}
              </div>
            </DockIcon>
          </DockItem>
        );
      })}
    </Dock>
  );
}
