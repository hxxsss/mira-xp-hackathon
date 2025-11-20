import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, ListChecks, Rocket, Trophy, Wallet, User, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

interface LearningTrack {
  id: string;
  name: string;
  icon: string;
  background_color: string;
  description: string;
  order_index: number;
}

interface DashboardSidebarProps {
  tracks: LearningTrack[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
}

const trackIcons = {
  "🧠": Brain,
  "📋": ListChecks,
  "🚀": Rocket,
};

export function DashboardSidebar({ tracks, currentTrackIndex, onTrackChange }: DashboardSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10">
      <SidebarHeader className="p-4">
        <h1 className="text-2xl font-black tracking-wider">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D4EDD] via-[#FF06B7] to-[#3D5AFE]">
            MIRA
          </span>
        </h1>
      </SidebarHeader>

      <SidebarContent>
        {/* Trilhas de Aprendizado */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-white/70">
            Trilhas de Aprendizado
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tracks.map((track, index) => {
                const IconComponent = trackIcons[track.icon as keyof typeof trackIcons] || Brain;
                const isActive = index === currentTrackIndex;
                
                return (
                  <SidebarMenuItem key={track.id}>
                    <SidebarMenuButton
                      onClick={() => onTrackChange(index)}
                      className={`${
                        isActive 
                          ? "bg-white/20 text-white font-semibold" 
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{track.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separador com texto */}
        <div className="px-4 py-2">
          <SidebarSeparator className="bg-white/20" />
          <p className="text-xs text-center text-white/50 my-2 font-medium">
            Acesse também:
          </p>
          <SidebarSeparator className="bg-white/20" />
        </div>

        {/* Links extras */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/ranking")}
                  className="text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Ranking</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/financas")}
                  className="text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Finanças</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => navigate("/profile")}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <User className="w-4 h-4" />
              <span>Perfil</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
