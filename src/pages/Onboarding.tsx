import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedInput } from "@/components/AnimatedInput";
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
import { z } from "zod";

// Validation schemas
const nameSchema = z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo");
const ageSchema = z.string().refine((val) => {
  const num = Number(val);
  return !isNaN(num) && num >= 1 && num <= 120;
}, "Idade deve estar entre 1 e 120 anos");
const emailSchema = z.string().trim().email("Email inválido").max(255, "Email muito longo");
const goalNameSchema = z.string().trim().min(3, "Meta deve ter pelo menos 3 caracteres").max(200, "Meta muito longa");
const goalAmountSchema = z.string().refine((val) => {
  const num = Number(val);
  return !isNaN(num) && num > 0;
}, "Valor deve ser maior que zero");
const passwordSchema = z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa");
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

const contentVariants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    filter: "blur(10px)",
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.43, 0.13, 0.23, 0.96],
      opacity: { duration: 0.3 },
      filter: { duration: 0.35 }
    }
  },
  exit: { 
    opacity: 0, 
    x: -100,
    filter: "blur(10px)",
    scale: 0.95,
    transition: { 
      duration: 0.3,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.5,
      delay: 0.05,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: "blur(8px)",
    transition: { duration: 0.35 }
  }
};

const fieldVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(5px)" },
  visible: (custom: number) => ({ 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: { 
      duration: 0.35,
      delay: 0.1 + (custom * 0.08),
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  })
};

const cardWrapperVariants = {
  initial: { 
    rotateY: 0,
    scale: 1,
  },
  changing: { 
    rotateY: 2,
    scale: 0.98,
    transition: { duration: 0.2 }
  },
  changed: { 
    rotateY: 0,
    scale: 1,
    transition: { 
      duration: 0.3,
      type: "spring",
      stiffness: 120,
      damping: 15
    }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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

  const validateField = (field: string, value: string): { isValid: boolean; error?: string } => {
    try {
      switch (field) {
        case 'name':
          nameSchema.parse(value);
          break;
        case 'age':
          ageSchema.parse(value);
          break;
        case 'email':
          emailSchema.parse(value);
          break;
        case 'goalName':
          goalNameSchema.parse(value);
          break;
        case 'goalAmount':
          goalAmountSchema.parse(value);
          break;
        case 'password':
          passwordSchema.parse(value);
          break;
      }
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0].message };
      }
      return { isValid: false, error: "Valor inválido" };
    }
  };

  const nextStep = () => {
    const invalidFields: Record<string, boolean> = {};
    const errors: Record<string, string> = {};
    
    if (currentStep === 0) {
      const nameValidation = validateField('name', formData.name);
      if (!nameValidation.isValid) {
        invalidFields.name = true;
        errors.name = nameValidation.error || '';
      }
      
      const ageValidation = validateField('age', formData.age);
      if (!ageValidation.isValid) {
        invalidFields.age = true;
        errors.age = ageValidation.error || '';
      }
      
      const emailValidation = validateField('email', formData.email);
      if (!emailValidation.isValid) {
        invalidFields.email = true;
        errors.email = emailValidation.error || '';
      }
    } else if (currentStep === 1) {
      const goalNameValidation = validateField('goalName', formData.goalName);
      if (!goalNameValidation.isValid) {
        invalidFields.goalName = true;
        errors.goalName = goalNameValidation.error || '';
      }
    } else if (currentStep === 2) {
      const goalAmountValidation = validateField('goalAmount', formData.goalAmount);
      if (!goalAmountValidation.isValid) {
        invalidFields.goalAmount = true;
        errors.goalAmount = goalAmountValidation.error || '';
      }
    } else if (currentStep === 5) {
      const passwordValidation = validateField('password', formData.password);
      if (!passwordValidation.isValid) {
        invalidFields.password = true;
        errors.password = passwordValidation.error || '';
      }
    }
    
    if (Object.keys(invalidFields).length > 0) {
      setShakeFields(invalidFields);
      setValidationErrors(errors);
      setTimeout(() => setShakeFields({}), 500);
      toast.error("Preencha todos os campos corretamente", {
        description: Object.values(errors)[0]
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsChanging(false);
      }, 200);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsChanging(false);
      }, 200);
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
            transition={{ 
              duration: 0.6,
              type: "spring",
              stiffness: 80,
              damping: 20
            }}
          />
        </div>
        </motion.div>

        {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        <motion.div
          variants={cardWrapperVariants as any}
          initial="initial"
          animate={isChanging ? "changing" : "changed"}
        >
          <Card className="border shadow-md rounded-3xl overflow-hidden backdrop-blur-sm bg-card/95">
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={contentVariants as any}
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
                        <motion.div custom={0} variants={fieldVariants as any}>
                          <AnimatedInput
                            id="name"
                            label="Qual é o seu nome?"
                            value={formData.name}
                            onValueChange={(value) => {
                              updateField("name", value);
                              setValidationErrors(prev => ({ ...prev, name: '' }));
                            }}
                            placeholder="Digite seu nome"
                            isValid={validateField('name', formData.name).isValid}
                            showValidation={formData.name.length > 0}
                            errorMessage={validationErrors.name}
                            shouldShake={shakeFields.name}
                            required
                          />
                        </motion.div>
                        <motion.div custom={1} variants={fieldVariants as any}>
                          <AnimatedInput
                            id="age"
                            label="Quantos anos você tem?"
                            type="number"
                            value={formData.age}
                            onValueChange={(value) => {
                              updateField("age", value);
                              setValidationErrors(prev => ({ ...prev, age: '' }));
                            }}
                            placeholder="Sua idade"
                            isValid={validateField('age', formData.age).isValid}
                            showValidation={formData.age.length > 0}
                            errorMessage={validationErrors.age}
                            shouldShake={shakeFields.age}
                            required
                          />
                        </motion.div>
                        <motion.div custom={2} variants={fieldVariants as any}>
                          <AnimatedInput
                            id="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onValueChange={(value) => {
                              updateField("email", value);
                              setValidationErrors(prev => ({ ...prev, email: '' }));
                            }}
                            placeholder="seu.email@exemplo.com"
                            isValid={validateField('email', formData.email).isValid}
                            showValidation={formData.email.length > 0}
                            errorMessage={validationErrors.email}
                            shouldShake={shakeFields.email}
                            required
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
                        <motion.div custom={0} variants={fieldVariants as any}>
                          <AnimatedInput
                            id="goalName"
                            label="Sua meta"
                            value={formData.goalName}
                            onValueChange={(value) => {
                              updateField("goalName", value);
                              setValidationErrors(prev => ({ ...prev, goalName: '' }));
                            }}
                            placeholder="ex: PlayStation 5, Notebook Novo, Ingresso de Show"
                            isValid={validateField('goalName', formData.goalName).isValid}
                            showValidation={formData.goalName.length > 0}
                            errorMessage={validationErrors.goalName}
                            shouldShake={shakeFields.goalName}
                            required
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
                        <motion.div custom={0} variants={fieldVariants as any}>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground z-10 pointer-events-none">
                              R$
                            </span>
                            <AnimatedInput
                              id="goalAmount"
                              label="Valor da meta (R$)"
                              type="number"
                              value={formData.goalAmount}
                              onValueChange={(value) => {
                                updateField("goalAmount", value);
                                setValidationErrors(prev => ({ ...prev, goalAmount: '' }));
                              }}
                              placeholder="0,00"
                              isValid={validateField('goalAmount', formData.goalAmount).isValid}
                              showValidation={formData.goalAmount.length > 0}
                              errorMessage={validationErrors.goalAmount}
                              shouldShake={shakeFields.goalAmount}
                              className="pl-10"
                              required
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
                        <motion.div variants={fieldVariants as any} custom={0} initial="hidden" animate="visible" className="space-y-2">
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
                        <motion.div variants={fieldVariants as any} custom={0} initial="hidden" animate="visible" className="space-y-2">
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
                        <motion.div custom={0} variants={fieldVariants as any}>
                          <AnimatedInput
                            id="password"
                            label="Senha"
                            type="password"
                            value={formData.password}
                            onValueChange={(value) => {
                              updateField("password", value);
                              setValidationErrors(prev => ({ ...prev, password: '' }));
                            }}
                            placeholder="Pelo menos 6 caracteres"
                            isValid={validateField('password', formData.password).isValid}
                            showValidation={formData.password.length > 0}
                            errorMessage={validationErrors.password}
                            shouldShake={shakeFields.password}
                            required
                          />
                        </motion.div>
                      </CardContent>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <CardFooter className="flex justify-between pt-6 pb-4">
                <motion.div variants={buttonVariants as any} whileHover="hover" whileTap="tap">
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
                <motion.div variants={buttonVariants as any} whileHover="hover" whileTap="tap">
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