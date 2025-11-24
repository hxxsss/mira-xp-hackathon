import { useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { CreditCard, AlertCircle, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import "swiper/css";
import "swiper/css/pagination";

interface CreditIllusionCardProps {
  onSubmit: (reflection: string) => void;
  isSubmitting?: boolean;
}

const educationalCards = [
  {
    id: 1,
    title: "Limite não é Salário",
    text: "Seu limite é uma dívida esperando para acontecer. Usar o cartão como extensão da renda é a armadilha número 1.",
    icon: CreditCard,
    gradient: "from-red-400 to-pink-500"
  },
  {
    id: 2,
    title: "A Bola de Neve",
    text: "Parcelar parece inofensivo, mas compromete sua renda futura. Hoje você gasta o dinheiro do seu 'Eu' do mês que vem.",
    icon: AlertCircle,
    gradient: "from-orange-400 to-red-500"
  },
  {
    id: 3,
    title: "Poder de Compra",
    text: "Ter limite para comprar é fácil. Ter dinheiro para pagar a fatura é o que define sua saúde financeira.",
    icon: TrendingDown,
    gradient: "from-purple-400 to-indigo-500"
  }
];

export const CreditIllusionCard = ({ onSubmit, isSubmitting }: CreditIllusionCardProps) => {
  const [reflection, setReflection] = useState("");
  const maxChars = 500;

  const handleSubmit = () => {
    if (reflection.trim().length >= 5) {
      onSubmit(reflection.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Área de Aprendizado - 60% */}
      <motion.div 
        className="flex-[0.6] flex flex-col justify-center px-6 py-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          💳 A Ilusão do Crédito
        </h2>
        <p className="text-sm text-gray-600 text-center mb-8">
          Deslize para aprender mais
        </p>

        {/* Carrossel de Cards Educacionais */}
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ 
            clickable: true,
            bulletClass: "swiper-pagination-bullet !bg-gray-400",
            bulletActiveClass: "swiper-pagination-bullet-active !bg-indigo-600"
          }}
          className="w-full max-w-md mx-auto"
        >
          {educationalCards.map((card) => (
            <SwiperSlide key={card.id}>
              <motion.div
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${card.gradient} p-8 shadow-2xl min-h-[280px] flex flex-col justify-center`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <card.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">
                    {card.title}
                  </h3>
                  
                  <p className="text-white/90 text-base leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {/* Área de Reflexão - 40% */}
      <motion.div 
        className="flex-[0.4] bg-white rounded-t-[2rem] shadow-2xl px-6 py-8 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📝 Sua vez
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Qual é a realidade da sua fatura hoje?
          </p>

          {/* Text Area */}
          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value.slice(0, maxChars))}
            placeholder="Ex: Pago sempre o total, ou, estou parcelando a fatura porque..."
            className="flex-1 min-h-[120px] bg-gray-50 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400 resize-none text-base"
          />

          {/* Character Counter */}
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${reflection.length >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
              {reflection.length >= 5 ? '✓ Pronto para enviar' : 'Mínimo: 5 caracteres'}
            </span>
            <span className="text-xs text-gray-400">
              {reflection.length}/{maxChars}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={reflection.trim().length < 5 || isSubmitting}
          className="w-full mt-6 h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isSubmitting ? "Salvando..." : "Enviar Análise"}
        </Button>
      </motion.div>
    </div>
  );
};
