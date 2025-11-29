import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { SliderConfig } from "./types";

interface DualSliderSessionProps {
  sliders: [SliderConfig, SliderConfig];
  onComplete: () => void;
}

export const DualSliderSession = ({ sliders, onComplete }: DualSliderSessionProps) => {
  const [values, setValues] = useState<[number, number]>([
    sliders[0].defaultValue,
    sliders[1].defaultValue,
  ]);

  // Função para formatar o valor baseado na unidade
  const formatValue = (value: number, config: SliderConfig) => {
    switch (config.unit) {
      case "percent":
        return `${value}%`;
      case "currency":
        return `${config.prefix || "R$"} ${value}`;
      default:
        return value.toString();
    }
  };

  const handleSliderChange = (index: 0 | 1, newValue: number[]) => {
    setValues(prev => {
      const updated = [...prev] as [number, number];
      updated[index] = newValue[0];
      return updated;
    });
  };

  const handleContinue = () => {
    console.log("Valores coletados:", values);
    onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8 space-y-10">
      {/* Slider 1 */}
      <SliderGroup
        config={sliders[0]}
        value={values[0]}
        onChange={(v) => handleSliderChange(0, v)}
        formatValue={formatValue}
        index={0}
      />

      {/* Separador visual */}
      <div className="w-full max-w-2xl border-t border-border/50" />

      {/* Slider 2 */}
      <SliderGroup
        config={sliders[1]}
        value={values[1]}
        onChange={(v) => handleSliderChange(1, v)}
        formatValue={formatValue}
        index={1}
      />

      {/* Botão Continuar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full px-8 py-6 text-lg font-semibold rounded-2xl"
        >
          Continuar
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};

interface SliderGroupProps {
  config: SliderConfig;
  value: number;
  onChange: (value: number[]) => void;
  formatValue: (value: number, config: SliderConfig) => string;
  index: number;
}

const SliderGroup = ({ config, value, onChange, formatValue, index }: SliderGroupProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="w-full max-w-2xl space-y-6"
    >
      {/* Pergunta */}
      <h3 className="text-xl md:text-2xl font-bold text-foreground text-center px-2">
        {config.question}
      </h3>

      {/* Valor em destaque */}
      <motion.div
        key={value}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className="text-center"
      >
        <span className="text-4xl md:text-5xl font-bold text-primary">
          {formatValue(value, config)}
        </span>
      </motion.div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={[value]}
          onValueChange={onChange}
          min={config.min}
          max={config.max}
          step={config.step}
          className="w-full"
        />
      </div>

      {/* Labels de Extremidade */}
      <div className="flex justify-between text-sm text-muted-foreground px-3">
        <span>{config.minLabel}</span>
        <span>{config.maxLabel}</span>
      </div>
    </motion.div>
  );
};
