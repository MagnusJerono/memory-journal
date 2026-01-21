import { motion } from 'framer-motion';

export function BrandHeader() {
  return (
    <div className="flex items-center gap-2">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight font-serif bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent select-none">
          Tightly
        </h1>
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent rounded-full" />
      </motion.div>
    </div>
  );
}

export function BrandHeaderCompact() {
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-black tracking-tight font-serif bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent select-none">
        Tightly
      </h1>
    </div>
  );
}
