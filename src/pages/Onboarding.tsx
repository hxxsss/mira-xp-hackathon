import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
const avatars = [{
  id: 1,
  emoji: "🦄",
  name: "Unicórnio"
}, {
  id: 2,
  emoji: "🚀",
  name: "Foguete"
}, {
  id: 3,
  emoji: "🎯",
  name: "Alvo"
}, {
  id: 4,
  emoji: "⭐",
  name: "Estrela"
}, {
  id: 5,
  emoji: "🌈",
  name: "Arco-íris"
}];
const steps = [
  { id: "personal", title: "Pessoal" },
  { id: "goal", title: "Meta" },
  { id: "amount", title: "Valor" },
  { id: "income", title: "Renda" },
  { id: "avatar", title: "Avatar" },
  { id: "password", title: "Senha" },
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    goalName: "",
    goalAmount: "",
    incomeType: "",
    avatarId: 1,
    password: ""
  });
  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
    } else {
      navigate('/login');
    }
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Criar conta do usuário
      const {
        data: authData,
        error: authError
      } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: formData.name
          }
        }
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não foi criado");

      // Aguardar um pouco para garantir que o trigger criou o perfil
      await new Promise(resolve => setTimeout(resolve, 500));

      // Atualizar perfil com dados do onboarding (usando upsert para garantir)
      const {
        error: profileError
      } = await supabase.from("profiles").upsert({
        id: authData.user.id,
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        income_type: formData.incomeType,
        avatar_id: formData.avatarId
      }, {
        onConflict: 'id'
      });
      if (profileError) throw profileError;

      // Criar a meta inicial
      const {
        error: goalError
      } = await supabase.from("goals").insert({
        user_id: authData.user.id,
        title: formData.goalName,
        total_amount: parseFloat(formData.goalAmount)
      });
      if (goalError) throw goalError;
      
      toast.success("Bem-vindo ao MIRA! 🎉", {
        description: "Sua jornada começa agora."
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro no cadastro", {
        description: error.message || "Algo deu errado. Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "" && formData.age !== "" && formData.email.trim() !== "";
      case 1:
        return formData.goalName.trim() !== "";
      case 2:
        return formData.goalAmount !== "";
      case 3:
        return formData.incomeType !== "";
      case 4:
        return true; // Avatar always has default
      case 5:
        return formData.password.length >= 6;
      default:
        return false;
    }
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto py-8">
        {/* Progress indicator */}
        <motion.div
          className="mb-8"
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
                      ? "bg-primary"
                      : index === currentStep
                        ? "bg-primary ring-4 ring-primary/20"
                        : "bg-muted",
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
                      ? "text-primary font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </motion.span>
              </motion.div>
            ))}
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-primary"
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
          <Card className="border shadow-md rounded-3xl overflow-hidden">
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={contentVariants}
                >
                  {/* Step 1: Personal Info */}
                  {currentStep === 0 && (
                    <>
                      <CardHeader>
                        <CardTitle>Vamos te conhecer!</CardTitle>
                        <CardDescription>
                          Conte um pouco sobre você
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="name">Qual é o seu nome?</Label>
                          <Input
                            id="name"
                            placeholder="Digite seu nome"
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="age">Quantos anos você tem?</Label>
                          <Input
                            id="age"
                            type="number"
                            min="1"
                            placeholder="Sua idade"
                            value={formData.age}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || parseInt(value) > 0) {
                                updateField("age", value);
                              }
                            }}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu.email@exemplo.com"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 2: Goal Name */}
                  {currentStep === 1 && (
                    <>
                      <CardHeader>
                        <CardTitle>Qual é a sua meta?</CardTitle>
                        <CardDescription>
                          Para o que você está economizando? Seja específico!
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="goalName">Sua meta</Label>
                          <Input
                            id="goalName"
                            placeholder="ex: PlayStation 5, Notebook Novo, Ingresso de Show"
                            value={formData.goalName}
                            onChange={(e) => updateField("goalName", e.target.value)}
                            className="text-lg transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 3: Goal Amount */}
                  {currentStep === 2 && (
                    <>
                      <CardHeader>
                        <CardTitle>Quanto custa?</CardTitle>
                        <CardDescription>
                          Digite o valor total que você precisa economizar
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="goalAmount">Valor da meta (R$)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                              R$
                            </span>
                            <Input
                              id="goalAmount"
                              type="number"
                              placeholder="0,00"
                              value={formData.goalAmount}
                              onChange={(e) => updateField("goalAmount", e.target.value)}
                              className="text-xl pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              step="0.01"
                            />
                          </div>
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 4: Income Type */}
                  {currentStep === 3 && (
                    <>
                      <CardHeader>
                        <CardTitle>De onde vem seu dinheiro?</CardTitle>
                        <CardDescription>
                          Isso nos ajuda a dar melhores conselhos
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <div className="grid grid-cols-2 gap-4">
                            <motion.button
                              type="button"
                              onClick={() => updateField("incomeType", "mesada")}
                              className={cn(
                                "p-6 rounded-2xl border-2 transition-all",
                                formData.incomeType === "mesada"
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:bg-accent"
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="text-4xl mb-2">💸</div>
                              <div className="font-semibold">Mesada</div>
                              <div className="text-sm text-muted-foreground">Dos pais/família</div>
                            </motion.button>
                            <motion.button
                              type="button"
                              onClick={() => updateField("incomeType", "trabalho")}
                              className={cn(
                                "p-6 rounded-2xl border-2 transition-all",
                                formData.incomeType === "trabalho"
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:bg-accent"
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="text-4xl mb-2">💼</div>
                              <div className="font-semibold">Renda Própria</div>
                              <div className="text-sm text-muted-foreground">De trabalho/freela</div>
                            </motion.button>
                          </div>
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 5: Avatar Selection */}
                  {currentStep === 4 && (
                    <>
                      <CardHeader>
                        <CardTitle>Escolha seu mascote!</CardTitle>
                        <CardDescription>
                          Escolha um companheiro para sua jornada
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <div className="grid grid-cols-5 gap-3">
                            {avatars.map((avatar, index) => (
                              <motion.button
                                key={avatar.id}
                                type="button"
                                onClick={() => updateField("avatarId", avatar.id)}
                                className={cn(
                                  "aspect-square rounded-2xl p-4 transition-all",
                                  formData.avatarId === avatar.id
                                    ? "border-4 border-primary bg-primary/10 scale-105"
                                    : "border-2 border-border hover:bg-accent"
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
                                <div className="text-5xl">{avatar.emoji}</div>
                                <div className="text-xs mt-2 font-medium">{avatar.name}</div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      </CardContent>
                    </>
                  )}

                  {/* Step 6: Password */}
                  {currentStep === 5 && (
                    <>
                      <CardHeader>
                        <CardTitle>Quase lá!</CardTitle>
                        <CardDescription>
                          Crie uma senha para proteger sua conta
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div variants={fadeInUp} className="space-y-2">
                          <Label htmlFor="password">Senha</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Pelo menos 6 caracteres"
                            value={formData.password}
                            onChange={(e) => updateField("password", e.target.value)}
                            className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <p className="text-xs text-muted-foreground">Mínimo de 6 dígitos</p>
                        </motion.div>
                      </CardContent>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <CardFooter className="flex justify-between pt-6 pb-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0 && isSubmitting}
                    className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
                  >
                    <ChevronLeft className="h-4 w-4" /> Voltar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                    disabled={!isStepValid() || isSubmitting}
                    className={cn(
                      "flex items-center gap-1 transition-all duration-300 rounded-2xl",
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
                      </>
                    ) : (
                      <>
                        {currentStep === steps.length - 1 ? "Começar Jornada" : "Próximo"}
                        {currentStep === steps.length - 1 ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </div>
          </Card>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          className="mt-4 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Etapa {currentStep + 1} de {steps.length}: {steps[currentStep].title}
        </motion.div>
      </div>
    </div>
  );
};
export default Onboarding;