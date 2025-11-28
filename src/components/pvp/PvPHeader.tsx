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
      
      
    </motion.div>;
};