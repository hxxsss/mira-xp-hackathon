import { Play } from "lucide-react";
import { motion } from "framer-motion";

interface VideoPlaceholderProps {
  subtitle?: string;
}

export const VideoPlaceholder = ({ subtitle }: VideoPlaceholderProps) => {
  return (
    <motion.div 
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="relative aspect-[9/16] bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl overflow-hidden shadow-2xl">
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-all hover:bg-white/30">
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </div>
        </motion.div>
        
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>
      
      {subtitle && (
        <motion.p 
          className="text-center text-lg text-foreground mt-6 font-medium px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
};
