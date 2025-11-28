import { motion } from "framer-motion";
import logoMira from "@/assets/logo-mira.png";
export const PvPHeader = () => {
  return <motion.div initial={{
    opacity: 0,
    y: -20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="fixed top-6 left-6 z-50 flex items-center gap-3">
      
      <span className="text-3xl font-black text-white tracking-tight" style={{
      textShadow: '0 0 20px rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.4)'
    }}>
        Mira
      </span>
    </motion.div>;
};