import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseStats } from "@/components/documentation/DatabaseStats";
import { ModuleSection } from "@/components/documentation/ModuleSection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const moduleData = {
  "Core User": {
    color: "indigo",
    tables: [
      { name: "profiles", description: "Perfis de usuários com XP, pontos e avatar", columns: 15 },
      { name: "active_sessions", description: "Sessões ativas de autenticação", columns: 9 },
    ],
  },
  "Financial": {
    color: "green",
    tables: [
      { name: "transactions", description: "Transações financeiras (receitas/despesas)", columns: 10 },
      { name: "budget_categories", description: "Categorias de orçamento mensal", columns: 7 },
      { name: "debts", description: "Gerenciamento de dívidas", columns: 11 },
      { name: "goals", description: "Metas financeiras", columns: 10 },
    ],
  },
  "Learning": {
    color: "purple",
    tables: [
      { name: "learning_tracks", description: "Trilhas de aprendizado", columns: 7 },
      { name: "learning_modules", description: "Módulos educacionais", columns: 13 },
      { name: "user_module_progress", description: "Progresso do usuário nos módulos", columns: 10 },
      { name: "user_track_progress", description: "Progresso do usuário nas trilhas", columns: 7 },
    ],
  },
  "Journey": {
    color: "pink",
    tables: [
      { name: "journey_steps", description: "Etapas da jornada gamificada", columns: 8 },
      { name: "user_journey_progress", description: "Progresso do usuário na jornada", columns: 5 },
    ],
  },
  "Shop": {
    color: "orange",
    tables: [
      { name: "shop_items", description: "Itens disponíveis na loja", columns: 6 },
      { name: "user_inventory", description: "Inventário do usuário", columns: 4 },
    ],
  },
  "PvP": {
    color: "blue",
    tables: [
      { name: "pvp_matches", description: "Partidas competitivas", columns: 19 },
      { name: "pvp_groups", description: "Grupos de partidas", columns: 8 },
      { name: "pvp_group_members", description: "Membros dos grupos", columns: 6 },
      { name: "pvp_match_answers", description: "Respostas em partidas", columns: 9 },
      { name: "pvp_questions", description: "Perguntas PvP", columns: 6 },
      { name: "pvp_queue", description: "Fila de matchmaking", columns: 8 },
    ],
  },
  "Chat": {
    color: "indigo",
    tables: [
      { name: "chat_sessions", description: "Sessões de chat com o oráculo", columns: 5 },
    ],
  },
  "Auth": {
    color: "pink",
    tables: [
      { name: "password_reset_codes", description: "Códigos de recuperação de senha", columns: 6 },
    ],
  },
};

export default function Documentation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const exportToPDF = async () => {
    if (!contentRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        windowHeight: contentRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      pdf.setProperties({
        title: "Documentação - Sistema Mira",
        subject: "Documentação do Banco de Dados",
        author: "Sistema Mira",
        creator: "Sistema Mira",
      });

      // Cover page
      pdf.setFontSize(24);
      pdf.setTextColor(99, 102, 241);
      pdf.text("Sistema Mira", 105, 40, { align: "center" });
      
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Documentacao do Banco de Dados", 105, 55, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 105, 70, { align: "center" });

      // Add modules info
      pdf.addPage();
      let yPos = 20;
      
      Object.entries(moduleData).forEach(([moduleName, moduleInfo]) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(99, 102, 241);
        pdf.text(`${moduleName} System`, 20, yPos);
        yPos += 8;
        
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        moduleInfo.tables.forEach(table => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }
          pdf.text(`• ${table.name}`, 25, yPos);
          yPos += 5;
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`  ${table.description}`, 30, yPos);
          if (table.columns) {
            pdf.text(`  (${table.columns} colunas)`, 30, yPos + 4);
            yPos += 4;
          }
          yPos += 6;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        });
        yPos += 5;
      });

      // Add screenshot
      pdf.addPage();
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 20, 20, imgWidth, Math.min(imgHeight, 250));

      const fileName = `documentacao-sistema-mira-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF exportado com sucesso!",
        description: `Arquivo salvo como ${fileName}`,
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const totalTables = Object.values(moduleData).reduce(
    (sum, module) => sum + module.tables.length,
    0
  );
  const totalModules = Object.keys(moduleData).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <FileText className="w-10 h-10 text-indigo-600" />
                Documentação do Sistema
              </h1>
              <p className="text-muted-foreground mt-2">
                Estrutura completa do banco de dados
              </p>
            </div>

            <Button
              onClick={exportToPDF}
              disabled={isExporting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar PDF"}
            </Button>
          </div>
        </motion.div>

        <DatabaseStats totalTables={totalTables} totalModules={totalModules} />

        <div ref={contentRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-indigo-200 shadow-xl mb-8">
              <CardHeader>
                <CardTitle>Módulos do Sistema</CardTitle>
                <CardDescription>
                  Navegue pelas tabelas organizadas por módulo funcional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={Object.keys(moduleData)[0]} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                    {Object.keys(moduleData).map((module) => (
                      <TabsTrigger key={module} value={module} className="text-xs">
                        {module}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(moduleData).map(([moduleName, moduleInfo]) => (
                    <TabsContent key={moduleName} value={moduleName} className="mt-6">
                      <ModuleSection
                        title={`${moduleName} System`}
                        tables={moduleInfo.tables}
                        color={moduleInfo.color}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 border-indigo-200">
              <CardHeader>
                <CardTitle>Segurança e RLS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Todas as tabelas possuem Row Level Security (RLS) habilitado, garantindo que cada usuário
                  tenha acesso apenas aos seus próprios dados. As políticas RLS foram implementadas seguindo
                  as melhores práticas de segurança.
                </p>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-700 mb-2">Principais Políticas:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-indigo-600">
                    <li>Usuários só podem ver e modificar seus próprios dados</li>
                    <li>Dados públicos (módulos, trilhas) são visíveis para todos</li>
                    <li>Partidas PvP visíveis apenas para participantes</li>
                    <li>Sistema de sessões protegido por tokens hash</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
