import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Sparkles, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { avatars } from "@/components/ui/avatar-picker";
import { Progress } from "@/components/ui/progress";

type Category = "head" | "body" | "background";
type FilterType = "all" | "unlocked" | "shop";

interface ShopItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  unlocked: boolean;
  equipped: boolean;
  preview: React.ReactNode;
}

// Mock items - você pode expandir isso conforme necessário
const mockItems: ShopItem[] = [
  { id: "head-1", name: "Chapéu Mágico", category: "head", price: 100, unlocked: true, equipped: false, preview: "🎩" },
  { id: "head-2", name: "Coroa Dourada", category: "head", price: 250, unlocked: false, equipped: false, preview: "👑" },
  { id: "head-3", name: "Óculos Cool", category: "head", price: 150, unlocked: true, equipped: false, preview: "🕶️" },
  { id: "body-1", name: "Capa Heroica", category: "body", price: 300, unlocked: false, equipped: false, preview: "🦸" },
  { id: "body-2", name: "Armadura", category: "body", price: 500, unlocked: false, equipped: false, preview: "🛡️" },
  { id: "background-1", name: "Floresta Encantada", category: "background", price: 200, unlocked: true, equipped: false, preview: "🌲" },
  { id: "background-2", name: "Espaço Sideral", category: "background", price: 350, unlocked: false, equipped: false, preview: "🌌" },
];

export default function AvatarCustomization() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [avatarId, setAvatarId] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [dreamPoints, setDreamPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category>("head");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [items, setItems] = useState<ShopItem[]>(mockItems);
  const [equippedItems, setEquippedItems] = useState<Set<string>>(new Set());

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
        .select("avatar_id, current_xp, dream_points")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      setAvatarId(data.avatar_id);
      setCurrentXP(data.current_xp);
      setDreamPoints(data.dream_points);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: ShopItem) => {
    if (!item.unlocked) {
      // Lógica de compra
      if (dreamPoints >= item.price) {
        toast({
          title: "Item comprado!",
          description: `Você comprou ${item.name}`,
        });
        // Aqui você implementaria a lógica de compra real
      } else {
        toast({
          title: "Diamantes insuficientes",
          description: `Você precisa de ${item.price} diamantes`,
          variant: "destructive",
        });
      }
      return;
    }

    // Toggle equipped
    const newEquipped = new Set(equippedItems);
    if (newEquipped.has(item.id)) {
      newEquipped.delete(item.id);
    } else {
      // Remove outros itens da mesma categoria
      items.filter(i => i.category === item.category).forEach(i => newEquipped.delete(i.id));
      newEquipped.add(item.id);
    }
    setEquippedItems(newEquipped);
  };

  const handleSaveStyle = async () => {
    toast({
      title: "Estilo salvo!",
      description: "Sua personalização foi salva com sucesso",
    });
    navigate("/profile");
  };

  const filteredItems = items.filter(item => {
    if (item.category !== selectedCategory) return false;
    if (selectedFilter === "unlocked") return item.unlocked;
    if (selectedFilter === "shop") return !item.unlocked;
    return true;
  });

  const categories: { id: Category; label: string; icon: string }[] = [
    { id: "head", label: "Cabeça", icon: "🎭" },
    { id: "body", label: "Corpo", icon: "👕" },
    { id: "background", label: "Fundo", icon: "🖼️" },
  ];

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "unlocked", label: "Desbloqueados" },
    { id: "shop", label: "Loja" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 overflow-hidden pb-24 md:pb-0">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="text-white hover:bg-white/10 px-2 md:px-4"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Voltar ao Perfil</span>
            </Button>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 md:px-4 py-1.5 md:py-2 rounded-full">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                <span className="text-white font-bold text-sm md:text-base">{currentXP}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 md:px-4 py-1.5 md:py-2 rounded-full">
                <span className="text-lg md:text-2xl">💎</span>
                <span className="text-white font-bold text-sm md:text-base">{dreamPoints}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 md:py-8 min-h-[calc(100vh-80px)]">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 h-full">
          
          {/* Categories - Horizontal on mobile, vertical on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <h3 className="text-white font-bold text-base md:text-lg mb-3 lg:mb-4 hidden lg:block">Categorias</h3>
            <div className="flex lg:flex-col gap-2 lg:gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 snap-x snap-mandatory lg:snap-none">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 lg:w-full p-3 lg:p-4 rounded-xl lg:rounded-2xl backdrop-blur-md transition-all snap-center ${
                    selectedCategory === category.id
                      ? "bg-cyan-400/30 border-2 border-cyan-400 shadow-lg shadow-cyan-400/50"
                      : "bg-white/10 border-2 border-white/20 hover:bg-white/20"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl lg:text-4xl mb-1 lg:mb-2">{category.icon}</div>
                  <div className="text-white font-medium text-xs lg:text-sm whitespace-nowrap">{category.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Avatar Stage */}
          <div className="order-1 lg:order-2 lg:col-span-4 flex flex-col items-center justify-center py-6 lg:py-0">
            <div className="relative">
              {/* Spotlight Effect - Smaller on mobile */}
              <div className="absolute -top-10 lg:-top-20 left-1/2 -translate-x-1/2 w-40 h-40 lg:w-64 lg:h-64 bg-yellow-300/10 lg:bg-yellow-300/20 rounded-full blur-3xl" />
              
              {/* Avatar Display - Responsive sizing */}
              <motion.div 
                className="relative z-10 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border-2 lg:border-4 border-white/30 flex items-center justify-center shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="scale-[3] md:scale-[4] lg:scale-[5]">
                  {avatars.find(a => a.id === avatarId)?.svg || avatars[0].svg}
                </div>
              </motion.div>

              {/* Pedestal */}
              <div className="absolute -bottom-2 lg:-bottom-4 left-1/2 -translate-x-1/2 w-32 lg:w-48 h-6 lg:h-8 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full blur-sm" />

              {/* Thought Bubble - Equipped Items - Repositioned for mobile */}
              <motion.div 
                className="absolute -top-8 lg:-top-16 -right-4 lg:-right-8 bg-white/90 backdrop-blur-md rounded-2xl lg:rounded-3xl p-2 lg:p-3 shadow-xl border border-white lg:border-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="flex gap-1 lg:gap-2">
                  {Array.from(equippedItems).slice(0, 3).map((itemId) => {
                    const item = items.find(i => i.id === itemId);
                    return item ? (
                      <div key={itemId} className="text-lg lg:text-2xl">{item.preview}</div>
                    ) : null;
                  })}
                  {equippedItems.size === 0 && (
                    <div className="text-gray-400 text-xs">Sem itens</div>
                  )}
                </div>
                {/* Speech bubble triangle */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 lg:border-l-8 border-r-4 lg:border-r-8 border-t-4 lg:border-t-8 border-l-transparent border-r-transparent border-t-white/90" />
              </motion.div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-6 lg:mt-12 w-48 md:w-56 lg:w-64 bg-white/20 backdrop-blur-md rounded-full p-2 lg:p-3">
              <div className="flex justify-between text-white text-xs lg:text-sm mb-1 lg:mb-2 px-2">
                <span>Nível 5</span>
                <span className="font-bold">{currentXP}/500</span>
              </div>
              <Progress 
                value={(currentXP / 500) * 100} 
                className="h-2 lg:h-3 bg-white/30"
              />
            </div>
          </div>

          {/* Wardrobe */}
          <div className="order-3 lg:col-span-6 flex flex-col min-h-[400px] lg:min-h-0">
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl lg:rounded-3xl border-2 border-white/30 p-4 lg:p-6 h-full flex flex-col shadow-2xl">
              
              {/* Filter Tabs */}
              <div className="flex gap-2 mb-4 lg:mb-6 overflow-x-auto">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-medium text-sm lg:text-base transition-all whitespace-nowrap ${
                      selectedFilter === filter.id
                        ? "bg-white text-purple-600 shadow-lg"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Items Grid - Responsive columns */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                      <motion.button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`aspect-square rounded-xl lg:rounded-2xl p-3 lg:p-4 transition-all relative ${
                          equippedItems.has(item.id)
                            ? "bg-green-400/30 border-2 lg:border-4 border-green-400 shadow-lg shadow-green-400/50"
                            : item.unlocked
                            ? "bg-white/30 border-2 border-white/40 hover:bg-white/40"
                            : "bg-white/10 border-2 border-white/20 hover:bg-white/15"
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Item Preview */}
                        <div className={`text-4xl lg:text-6xl mb-1 lg:mb-2 ${!item.unlocked && "opacity-40"}`}>
                          {item.preview}
                        </div>

                        {/* Item Name */}
                        <div className="text-white text-[10px] lg:text-xs font-medium line-clamp-2">
                          {item.name}
                        </div>

                        {/* Lock & Price */}
                        {!item.unlocked && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl lg:rounded-2xl backdrop-blur-sm">
                            <Lock className="w-6 lg:w-8 h-6 lg:h-8 text-white mb-1 lg:mb-2" />
                            <div className="flex items-center gap-1 bg-purple-600 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full">
                              <span className="text-white text-xs lg:text-sm font-bold">{item.price}</span>
                              <span className="text-sm lg:text-lg">💎</span>
                            </div>
                          </div>
                        )}

                        {/* Equipped Check */}
                        {equippedItems.has(item.id) && (
                          <div className="absolute top-1 lg:top-2 right-1 lg:right-2 bg-green-400 rounded-full p-1">
                            <Check className="w-3 lg:w-4 h-3 lg:h-4 text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Button - Hidden on mobile (shown in fixed bottom) */}
              <div className="hidden lg:block mt-6 pt-6 border-t border-white/20">
                <Button
                  onClick={handleSaveStyle}
                  className="w-full h-16 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                  size="lg"
                >
                  <Check className="w-6 h-6 mr-2" />
                  Salvar Estilo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-purple-900 to-transparent backdrop-blur-sm z-50 pb-safe">
        <Button
          onClick={handleSaveStyle}
          className="w-full h-14 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold text-base rounded-xl shadow-xl"
        >
          <Check className="w-5 h-5 mr-2" />
          Salvar Estilo
        </Button>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
