import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Se estiver no step 1, volta para o login
      navigate('/login');
    }
  };
  const handleSubmit = async () => {
    setLoading(true);
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
      toast({
        title: "Bem-vindo ao MIRA! 🎉",
        description: "Sua jornada começa agora."
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Algo deu errado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.age && formData.email;
      case 2:
        return formData.goalName;
      case 3:
        return formData.goalAmount;
      case 4:
        return formData.incomeType;
      case 5:
        return formData.avatarId;
      case 6:
        return formData.password.length >= 6;
      default:
        return false;
    }
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-7xl md:text-8xl font-bold text-white">MIRA</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>Etapa {step} de 6</span>
            <span>{Math.round(step / 6 * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full gradient-primary" initial={{
            width: 0
          }} animate={{
            width: `${step / 6 * 100}%`
          }} transition={{
            duration: 0.3
          }} />
          </div>
        </div>

        {/* Step Content */}
        <Card className="glass-card p-8 rounded-3xl mb-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }} transition={{
            duration: 0.3
          }}>
              {step === 1 && <Step1 formData={formData} updateField={updateField} />}
              {step === 2 && <Step2 formData={formData} updateField={updateField} />}
              {step === 3 && <Step3 formData={formData} updateField={updateField} />}
              {step === 4 && <Step4 formData={formData} updateField={updateField} />}
              {step === 5 && <Step5 formData={formData} updateField={updateField} />}
              {step === 6 && <Step6 formData={formData} updateField={updateField} />}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button variant="outline" size="lg" onClick={handleBack} className="flex-1 rounded-2xl hover:bg-yellow-400 hover:text-black hover:border-yellow-400 transition-colors">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </Button>
          <Button variant="outline" size="lg" onClick={step === 6 ? handleSubmit : handleNext} disabled={!canProceed() || loading} className="flex-1 rounded-2xl !hover:bg-yellow-400 !hover:text-black !hover:border-yellow-400 transition-colors disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:hover:border-border">
            {loading ? "Carregando..." : step === 6 ? "Começar Jornada 🚀" : <>
                Próximo
                <ChevronRight className="w-5 h-5 ml-1" />
              </>}
          </Button>
        </div>
      </motion.div>
    </div>;
};
const Step1 = ({
  formData,
  updateField
}: any) => <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Vamos te conhecer!</h2>
    <p className="text-muted-foreground mb-6">Conte um pouco sobre você</p>
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Qual é o seu nome?</Label>
        <Input id="name" value={formData.name} onChange={e => updateField("name", e.target.value)} placeholder="Digite seu nome" className="rounded-2xl mt-2" />
      </div>
      <div>
        <Label htmlFor="age">Quantos anos você tem?</Label>
        <Input id="age" type="number" min="1" value={formData.age} onChange={e => {
          const value = e.target.value;
          if (value === "" || parseInt(value) > 0) {
            updateField("age", value);
          }
        }} placeholder="Sua idade" className="rounded-2xl mt-2" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)} placeholder="seu.email@exemplo.com" className="rounded-2xl mt-2" />
      </div>
    </div>
  </div>;
const Step2 = ({
  formData,
  updateField
}: any) => <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Qual é a sua meta?</h2>
    <p className="text-muted-foreground mb-6">
      Para o que você está economizando? Seja específico!
    </p>
    <Input value={formData.goalName} onChange={e => updateField("goalName", e.target.value)} placeholder="ex: PlayStation 5, Notebook Novo, Ingresso de Show" className="rounded-2xl text-lg p-6" />
  </div>;
const Step3 = ({
  formData,
  updateField
}: any) => <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Quanto custa?</h2>
    <p className="text-muted-foreground mb-6">
      Digite o valor total que você precisa economizar
    </p>
    <div className="relative">
      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
        R$
      </span>
      <Input type="number" value={formData.goalAmount} onChange={e => updateField("goalAmount", e.target.value)} placeholder="0,00" className="rounded-2xl text-2xl p-6 pl-12" step="0.01" />
    </div>
  </div>;
const Step4 = ({
  formData,
  updateField
}: any) => <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">De onde vem seu dinheiro?</h2>
    <p className="text-muted-foreground mb-6">
      Isso nos ajuda a dar melhores conselhos
    </p>
    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => updateField("incomeType", "mesada")} className={`p-6 rounded-2xl border-2 transition-all hover-lift ${formData.incomeType === "mesada" ? "border-primary bg-primary/10" : "border-border glass-card"}`}>
        <div className="text-4xl mb-2">💸</div>
        <div className="font-semibold">Mesada</div>
        <div className="text-sm text-muted-foreground">Dos pais/família</div>
      </button>
      <button onClick={() => updateField("incomeType", "trabalho")} className={`p-6 rounded-2xl border-2 transition-all hover-lift ${formData.incomeType === "trabalho" ? "border-primary bg-primary/10" : "border-border glass-card"}`}>
        <div className="text-4xl mb-2">💼</div>
        <div className="font-semibold">Renda Própria</div>
        <div className="text-sm text-muted-foreground">De trabalho/freela</div>
      </button>
    </div>
  </div>;
const Step5 = ({
  formData,
  updateField
}: any) => <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Escolha seu mascote!</h2>
    <p className="text-muted-foreground mb-6">
      Escolha um companheiro para sua jornada
    </p>
    <div className="grid grid-cols-5 gap-3">
      {avatars.map(avatar => <button key={avatar.id} onClick={() => updateField("avatarId", avatar.id)} className={`aspect-square rounded-2xl p-4 transition-all hover-lift ${formData.avatarId === avatar.id ? "border-4 border-primary bg-primary/10 scale-105" : "border-2 border-border glass-card"}`}>
          <div className="text-5xl">{avatar.emoji}</div>
          <div className="text-xs mt-2 font-medium">{avatar.name}</div>
        </button>)}
    </div>
  </div>;
const Step6 = ({
  formData,
  updateField
}: any) => <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Quase lá!</h2>
    <p className="text-muted-foreground mb-6">
      Crie uma senha para proteger sua conta
    </p>
    <div>
      <Label htmlFor="password">Senha</Label>
      <Input id="password" type="password" value={formData.password} onChange={e => updateField("password", e.target.value)} placeholder="Pelo menos 6 caracteres" className="rounded-2xl mt-2" />
      <p className="text-xs text-muted-foreground mt-2">Mínimo de 6 digitos</p>
    </div>
  </div>;
export default Onboarding;