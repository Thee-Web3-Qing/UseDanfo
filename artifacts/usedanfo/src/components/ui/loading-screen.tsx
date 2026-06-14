import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="min-h-[100dvh] bg-[#111111] flex flex-col items-center justify-center space-y-6">
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-12 h-12 bg-[#FFC72C] rounded-full"
      />
      <p className="font-['Syne'] text-white text-xl uppercase tracking-widest font-bold">Loading...</p>
    </div>
  );
}
