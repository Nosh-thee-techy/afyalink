import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Stethoscope, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Splash() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoaded } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoaded) {
        if (isAuthenticated) {
          setLocation("/queue");
        } else {
          setLocation("/login");
        }
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isLoaded, isAuthenticated, setLocation]);

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#00A651] via-white to-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#E30613]" />

        <motion.div 
          className="relative z-10 flex flex-col items-center text-center px-4"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4 text-white">
            <Heart className="w-12 h-12 fill-white" />
            <Stethoscope className="w-12 h-12" />
          </div>
          <h1 className="text-[48px] font-display font-extrabold text-white leading-tight mb-2 drop-shadow-md">
            AfyaLink
          </h1>
          <h2 className="text-[24px] font-bold text-white mb-2 drop-shadow">
            Huduma ya Afya Bila Mtandao
          </h2>
          <p className="text-[18px] text-white/90 font-medium">
            For CHPs & Refugee Camps
          </p>
        </motion.div>

        {/* Kenya Map Placeholder SVG */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 z-0 pt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <svg viewBox="0 0 100 100" className="w-64 h-64 fill-white stroke-white stroke-2">
            <path d="M40,10 L60,15 L70,30 L80,50 L75,70 L60,85 L40,90 L20,70 L15,50 L25,30 Z" />
          </svg>
        </motion.div>

        <motion.div 
          className="absolute bottom-16 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Loader2 className="w-10 h-10 text-[#00A651] animate-spin" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
