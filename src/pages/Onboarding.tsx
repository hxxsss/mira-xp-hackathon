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

const avatars = [
  { id: 1, emoji: "🦄", name: "Unicorn" },
  { id: 2, emoji: "🚀", name: "Rocket" },
  { id: 3, emoji: "🎯", name: "Target" },
  { id: 4, emoji: "⭐", name: "Star" },
  { id: 5, emoji: "🌈", name: "Rainbow" },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    goalName: "",
    goalAmount: "",
    incomeType: "",
    avatarId: 1,
    password: "",
  });

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned");

      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          age: parseInt(formData.age),
          income_type: formData.incomeType,
          avatar_id: formData.avatarId,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // Create the initial goal
      const { error: goalError } = await supabase.from("goals").insert({
        user_id: authData.user.id,
        title: formData.goalName,
        total_amount: parseFloat(formData.goalAmount),
      });

      if (goalError) throw goalError;

      toast({
        title: "Welcome to DreamUp! 🎉",
        description: "Your journey begins now.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-gradient">DreamUp</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm text-muted-foreground">
            <span>Step {step} of 6</span>
            <span>{Math.round((step / 6) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="glass-card p-8 rounded-3xl mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
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
          {step > 1 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="rounded-2xl"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          <Button
            size="lg"
            onClick={step === 6 ? handleSubmit : handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 rounded-2xl gradient-primary hover:opacity-90 transition-opacity"
          >
            {loading ? (
              "Loading..."
            ) : step === 6 ? (
              "Start Journey"
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const Step1 = ({ formData, updateField }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Let's get to know you!</h2>
    <p className="text-muted-foreground mb-6">Tell us a bit about yourself</p>
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">What's your name?</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Enter your name"
          className="rounded-2xl mt-2"
        />
      </div>
      <div>
        <Label htmlFor="age">How old are you?</Label>
        <Input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) => updateField("age", e.target.value)}
          placeholder="Your age"
          className="rounded-2xl mt-2"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="your.email@example.com"
          className="rounded-2xl mt-2"
        />
      </div>
    </div>
  </div>
);

const Step2 = ({ formData, updateField }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">What's your dream?</h2>
    <p className="text-muted-foreground mb-6">
      What are you saving for? Be specific!
    </p>
    <Input
      value={formData.goalName}
      onChange={(e) => updateField("goalName", e.target.value)}
      placeholder="e.g., PlayStation 5, New Laptop, Concert Tickets"
      className="rounded-2xl text-lg p-6"
    />
  </div>
);

const Step3 = ({ formData, updateField }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">How much does it cost?</h2>
    <p className="text-muted-foreground mb-6">
      Enter the total amount you need to save
    </p>
    <div className="relative">
      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">
        $
      </span>
      <Input
        type="number"
        value={formData.goalAmount}
        onChange={(e) => updateField("goalAmount", e.target.value)}
        placeholder="0.00"
        className="rounded-2xl text-2xl p-6 pl-12"
        step="0.01"
      />
    </div>
  </div>
);

const Step4 = ({ formData, updateField }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Where does your money come from?</h2>
    <p className="text-muted-foreground mb-6">
      This helps us give you better advice
    </p>
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => updateField("incomeType", "allowance")}
        className={`p-6 rounded-2xl border-2 transition-all hover-lift ${
          formData.incomeType === "allowance"
            ? "border-primary bg-primary/10"
            : "border-border glass-card"
        }`}
      >
        <div className="text-4xl mb-2">💸</div>
        <div className="font-semibold">Allowance</div>
        <div className="text-sm text-muted-foreground">From parents/family</div>
      </button>
      <button
        onClick={() => updateField("incomeType", "work")}
        className={`p-6 rounded-2xl border-2 transition-all hover-lift ${
          formData.incomeType === "work"
            ? "border-primary bg-primary/10"
            : "border-border glass-card"
        }`}
      >
        <div className="text-4xl mb-2">💼</div>
        <div className="font-semibold">Own Income</div>
        <div className="text-sm text-muted-foreground">From work/job</div>
      </button>
    </div>
  </div>
);

const Step5 = ({ formData, updateField }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Choose your mascot!</h2>
    <p className="text-muted-foreground mb-6">
      Pick a buddy to accompany you on your journey
    </p>
    <div className="grid grid-cols-5 gap-3">
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => updateField("avatarId", avatar.id)}
          className={`aspect-square rounded-2xl p-4 transition-all hover-lift ${
            formData.avatarId === avatar.id
              ? "border-4 border-primary bg-primary/10 scale-105"
              : "border-2 border-border glass-card"
          }`}
        >
          <div className="text-5xl">{avatar.emoji}</div>
          <div className="text-xs mt-2 font-medium">{avatar.name}</div>
        </button>
      ))}
    </div>
  </div>
);

const Step6 = ({ formData, updateField }: any) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold mb-2">Almost there!</h2>
    <p className="text-muted-foreground mb-6">
      Create a password to secure your account
    </p>
    <div>
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        value={formData.password}
        onChange={(e) => updateField("password", e.target.value)}
        placeholder="At least 6 characters"
        className="rounded-2xl mt-2"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Make it memorable but secure!
      </p>
    </div>
  </div>
);

export default Onboarding;
