import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
const Landing = () => {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);
  return <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <motion.div initial={{
          scale: 0.8,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          delay: 0.2,
          duration: 0.5
        }} className="inline-flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-gradient text-slate-50">MIRA</h1>
          </motion.div>

          {/* Hero Heading */}
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3,
          duration: 0.6
        }} className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Transforme Seus Sonhos
            <br />
            <span className="text-gradient">Em Realidade</span>
          </motion.h2>

          {/* Value Prop */}
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4,
          duration: 0.6
        }} className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Organização financeira que acelera seus sonhos.
            Planeje suas metas, acompanhe seu progresso e conquiste o que mais importa.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.5,
          duration: 0.5
        }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="text-lg px-8 py-6 rounded-3xl hover-lift">
              Entrar
            </Button>
            <Button size="lg" onClick={() => navigate("/onboarding")} className="text-lg px-8 py-6 rounded-3xl gradient-primary hover:opacity-90 transition-opacity shadow-lg hover-lift">
              <Sparkles className="w-5 h-5 mr-2" />
              Começar Jornada
            </Button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6,
          duration: 0.6
        }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <FeatureCard icon={<Target className="w-8 h-8" />} title="Defina Sua Meta" description="Defina o que você está economizando e veja seus sonhos se tornarem metas alcançáveis" delay={0.7} />
            <FeatureCard icon={<TrendingUp className="w-8 h-8" />} title="Acompanhe o Progresso" description="Veja suas economias crescerem com barras de progresso visuais e marcos gamificados" delay={0.8} />
            <FeatureCard icon={<Sparkles className="w-8 h-8" />} title="Fique Mais Inteligente" description="Insights com IA ajudam você a tomar melhores decisões financeiras" delay={0.9} />
          </motion.div>
        </motion.div>
      </div>
    </div>;
};
const FeatureCard = ({
  icon,
  title,
  description,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) => {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay,
    duration: 0.5
  }} className="glass-card p-8 rounded-3xl hover-lift">
      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 mx-auto">
        <div className="text-primary-foreground">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>;
};
export default Landing;