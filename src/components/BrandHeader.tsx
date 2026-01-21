import { motion } from 'framer-motion';

export function BrandHeader() {
  return (
    <div className="flex items-center gap-2">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tight font-serif bg-gradient-to-br from-primary via-[oklch(0.80_0.14_300)] to-accent bg-clip-text text-transparent select-none drop-shadow-sm">
          Tightly
        </h1>
        <motion.div 
          className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent/60 to-transparent rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </motion.div>
    </div>
  );
}

export function BrandHeaderCompact() {
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight font-serif bg-gradient-to-br from-primary via-[oklch(0.80_0.14_300)] to-accent bg-clip-text text-transparent select-none">
        Tightly
      </h1>
    </div>
  );
}
