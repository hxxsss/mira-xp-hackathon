import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AnimatedInputProps extends React.ComponentProps<"input"> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  isValid?: boolean;
  showValidation?: boolean;
  errorMessage?: string;
  shouldShake?: boolean;
}

export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ 
    label, 
    value, 
    onValueChange, 
    isValid, 
    showValidation = true,
    errorMessage,
    shouldShake = false,
    className,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = value && value.length > 0;
    const shouldFloat = isFocused || hasValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(e.target.value);
    };

    const shakeVariants = {
      shake: {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      },
      idle: {
        x: 0
      }
    };

    return (
      <motion.div 
        className="relative w-full"
        animate={shouldShake ? "shake" : "idle"}
        variants={shakeVariants}
      >
        {/* Floating Label */}
        <motion.label
          animate={{
            top: shouldFloat ? "0px" : "50%",
            y: shouldFloat ? 0 : "-50%",
            scale: shouldFloat ? 0.85 : 1,
            x: 0,
            color: isFocused 
              ? "hsl(220, 15%, 25%)" 
              : shouldFloat 
              ? "hsl(220, 10%, 50%)"
              : "hsl(220, 10%, 50%)"
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute left-3 pointer-events-none origin-top-left font-medium z-10 bg-card px-1"
        >
          {label}
        </motion.label>

        {/* Input Container */}
        <div className="relative">
          <Input
            ref={ref}
            {...props}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "pt-3 pb-3 transition-all duration-300 bg-card border-border",
              shouldFloat && "pt-6 pb-2",
              isFocused && "ring-2 ring-primary/20 border-primary",
              showValidation && isValid && hasValue && "border-success ring-2 ring-success/20",
              showValidation && isValid === false && hasValue && "border-destructive ring-2 ring-destructive/20",
              isFocused && "input-shimmer",
              className
            )}
          />

          {/* Validation Icons */}
          <AnimatePresence>
            {showValidation && hasValue && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0, rotate: 180 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {isValid ? (
                  <Check className="h-5 w-5 text-success" />
                ) : (
                  <X className="h-5 w-5 text-destructive" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Progress Bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-primary origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Typing Indicator */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -bottom-6 left-0 text-xs text-muted-foreground"
              >
                {hasValue ? `${value.length} caracteres` : "Digite algo..."}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && showValidation && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive mt-1.5 ml-1"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";
