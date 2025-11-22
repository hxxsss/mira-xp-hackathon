import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Target, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const avatars = [
  { id: 1, emoji: "🦄", name: "Unicórnio" },
  { id: 2, emoji: "🚀", name: "Foguete" },
  { id: 3, emoji: "🎯", name: "Alvo" },
  { id: 4, emoji: "⭐", name: "Estrela" },
  { id: 5, emoji: "🌈", name: "Arco-íris" },
];

const steps = [
  { id: "personal", title: "Informações" },
  { id: "goal", title: "Meta" },
  { id: "amount", title: "Valor" },
  { id: "timeline", title: "Prazo" },
  { id: "income", title: "Renda" },
  { id: "avatar", title: "Mascote" },
];

const timelineOptions = [
  { value: "1-3", label: "1-3 meses", emoji: "⚡", description: "Metas rápidas e urgentes" },
  { value: "3-6", label: "3-6 meses", emoji: "📅", description: "Médio prazo" },
  { value: "6-12", label: "6-12 meses", emoji: "📆", description: "Metas ambiciosas" },
  { value: "12+", label: "Mais de 1 ano", emoji: "🎯", description: "Grandes conquistas" },
  { value: "unsure", label: "Não sei ainda", emoji: "❓", description: "Vou decidir depois" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const formatted = new Intl.NumberFormat('pt-BR').format(parseInt(numbers));
    return formatted;
  };

  const parseCurrency = (formatted: string): string => {
    return formatted.replace(/\./g, '');
  };

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    goalName: "",
    goalAmount: "",
    goalTimeline: "",
    incomeType: "",
    avatarId: 1,
    password: "",
  });

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não foi criado");

      await new Promise((resolve) => setTimeout(resolve, 500));

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age),
          income_type: formData.incomeType,
          avatar_id: formData.avatarId,
        },
        {
          onConflict: "id",
        }
      );

      if (profileError) throw profileError;

      const { error: goalError } = await supabase.from("goals").insert({
        user_id: authData.user.id,
        title: formData.goalName,
        total_amount: parseFloat(formData.goalAmount),
        estimated_timeline: formData.goalTimeline,
      });

      if (goalError) throw goalError;

      toast({
        title: "Bem-vindo ao MIRA! 🎉",
        description: "Sua jornada começa agora.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.age && formData.email && formData.password.length >= 6;
      case 1:
        return formData.goalName;
      case 2:
        return formData.goalAmount;
      case 3:
        return formData.goalTimeline;
      case 4:
        return formData.incomeType;
      case 5:
        return formData.avatarId;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium">Voltar para início</span>
      </button>

      {/* Blur colorido de fundo */}
      <div className="fixed bottom-0 left-0 right-0 h-64 z-0 pointer-events-none">
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 h-full transition-all duration-700",
            currentStep === 0 && "track-blur-mentalidade",
            currentStep === 1 && "track-blur-organizacao",
            currentStep === 2 && "track-blur-aceleracao",
            currentStep === 3 && "track-blur-mentalidade",
            currentStep === 4 && "track-blur-organizacao",
            currentStep === 5 && "track-blur-aceleracao"
          )}
        />
      </div>

      <div className="w-full max-w-lg mx-auto py-2 sm:py-4 relative z-10">
        {/* Logo */}
        <motion.div
          className="text-center mb-3 sm:mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Target className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-wider font-sans">mira</span>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className="mb-4 sm:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className={cn(
                    "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                    index < currentStep
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                      : index === currentStep
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 ring-4 ring-indigo-600/20"
                        : "bg-gray-300",
                  )}
                  onClick={() => {
                    if (index <= currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                />
                <motion.span
                  className={cn(
                    "text-xs mt-1.5 hidden sm:block",
                    index === currentStep
                      ? "text-indigo-600 font-medium"
                      : "text-gray-500",
                  )}
                >
                  {step.title}
                </motion.span>
              </motion.div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border shadow-md rounded-3xl overflow-hidden bg-white max-h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={contentVariants}
                  className="flex-1 overflow-y-auto px-1 sm:px-2"
                >
                  {currentStep === 0 && (
                    <>
                      <CardHeader className="pb-3">
                        <CardTitle>Vamos te conhecer!</CardTitle>
                        <CardDescription>
                          Conte um pouco sobre você
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label htmlFor="name">Qual é o seu nome?</Label>
                          <Input
                            id="name"
                            placeholder="Digite seu nome"
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label htmlFor="age">Quantos anos você tem?</Label>
                          <Input
                            id="age"
                            type="number"
                            placeholder="Sua idade"
                            value={formData.age}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || parseInt(value) > 0) {
                                updateField("age", value);
                              }
                            }}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu.email@exemplo.com"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-1.5">
                          <Label htmlFor="password">Senha</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Pelo menos 6 caracteres"
                            value={formData.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                          />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {currentStep === 1 && (
                    <>
                      <CardHeader className="pb-3">
                        <CardTitle>Qual é a sua meta?</CardTitle>
                        <CardDescription>
                          Para o que você está economizando? Seja específico!
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Input
                            value={formData.goalName}
                            onChange={(e) => updateField("goalName", e.target.value)}
                            placeholder="ex: PlayStation 5, Notebook Novo, Ingresso de Show"
                            className="text-lg p-5 transition-all duration-300 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                          />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <CardHeader className="pb-3">
                        <CardTitle>Quanto custa?</CardTitle>
                        <CardDescription>
                          Digite o valor total que você precisa economizar
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">
                              R$
                            </span>
                            <Input
                              type="text"
                              value={formatCurrency(formData.goalAmount)}
                              onChange={(e) => {
                                const formatted = e.target.value;
                                const rawValue = parseCurrency(formatted);
                                updateField("goalAmount", rawValue);
                              }}
                              placeholder="0"
                              className="text-xl p-5 pl-11 transition-all duration-300 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            Ex: R$ 3.500
                          </p>
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <CardHeader className="pb-3">
                        <CardTitle>Você tem uma ideia de quanto tempo?</CardTitle>
                        <CardDescription>
                          Quanto tempo você acha que vai levar para alcançar sua meta?
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp} className="space-y-2.5">
                          {timelineOptions.map((option) => (
                            <motion.button
                              key={option.value}
                              onClick={() => updateField("goalTimeline", option.value)}
                              className={cn(
                                "w-full p-3 rounded-xl border-2 transition-all text-left",
                                formData.goalTimeline === option.value
                                  ? "border-purple-600 bg-purple-50"
                                  : "border-gray-200 hover:bg-gray-50"
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{option.emoji}</div>
                                <div>
                                  <div className="font-semibold">{option.label}</div>
                                  <div className="text-sm text-muted-foreground">{option.description}</div>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {currentStep === 4 && (
                    <>
                      <CardHeader className="pb-3">
                        <CardTitle>De onde vem seu dinheiro?</CardTitle>
                        <CardDescription>
                          Isso nos ajuda a dar melhores conselhos
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3">
                          <motion.button
                            onClick={() => updateField("incomeType", "mesada")}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all",
                              formData.incomeType === "mesada"
                                ? "border-purple-600 bg-purple-50"
                                : "border-gray-200 hover:bg-gray-50"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-4xl mb-2">💸</div>
                            <div className="font-semibold">Mesada</div>
                            <div className="text-sm text-muted-foreground">Dos pais/família</div>
                          </motion.button>
                          <motion.button
                            onClick={() => updateField("incomeType", "trabalho")}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all",
                              formData.incomeType === "trabalho"
                                ? "border-purple-600 bg-purple-50"
                                : "border-gray-200 hover:bg-gray-50"
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-4xl mb-2">💼</div>
                            <div className="font-semibold">Renda Própria</div>
                            <div className="text-sm text-muted-foreground">De trabalho/freela</div>
                          </motion.button>
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {currentStep === 5 && (
                    <>
                      <CardHeader className="pb-3">
                        <CardTitle>Escolha seu mascote!</CardTitle>
                        <CardDescription>
                          Escolha um companheiro para sua jornada
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <motion.div variants={fadeInUp} className="grid grid-cols-5 gap-2.5">
                          {avatars.map((avatar, index) => (
                            <motion.button
                              key={avatar.id}
                              onClick={() => updateField("avatarId", avatar.id)}
                              className={cn(
                                "aspect-square rounded-2xl p-2.5 transition-all",
                                formData.avatarId === avatar.id
                                  ? "border-3 border-purple-600 bg-purple-50 scale-105"
                                  : "border-2 border-gray-200 hover:bg-gray-50"
                              )}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                  delay: 0.1 * index,
                                  duration: 0.3,
                                },
                              }}
                            >
                              <div className="text-3xl sm:text-4xl">{avatar.emoji}</div>
                              <div className="text-[10px] mt-1 font-medium">{avatar.name}</div>
                            </motion.button>
                          ))}
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                </motion.div>
              </AnimatePresence>

              <CardFooter className="flex justify-between pt-4 pb-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={loading || currentStep === 0}
                    className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                  >
                    <ChevronLeft className="h-4 w-4" /> Voltar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                    disabled={!isStepValid() || loading}
                    className="flex items-center gap-2 transition-all duration-300 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-indigo-200 active:scale-[0.98] px-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                      </>
                    ) : (
                      <>
                        {currentStep === steps.length - 1 ? "Começar Jornada 🚀" : "Próximo"}
                        {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;
