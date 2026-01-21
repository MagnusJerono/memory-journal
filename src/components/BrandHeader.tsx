import { motion } from 'framer-motion';

export function BrandHeader() {
  return (
    <div className="flex flex-col">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl font-light tracking-[-0.06em] font-serif select-none"
          style={{
            background: 'linear-gradient(135deg, oklch(0.50 0.20 280) 0%, oklch(0.60 0.22 300) 40%, oklch(0.65 0.18 330) 70%, oklch(0.55 0.20 280) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 30px oklch(0.55 0.18 280 / 0.3)',
          }}
        >
          Tightly
        </h1>
        <motion.div 
          className="h-[2px] bg-gradient-to-r from-primary/60 via-accent/40 to-transparent rounded-full mt-1"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </motion.div>
      <motion.p 
        className="text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase text-muted-foreground/70 mt-1.5 ml-0.5"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Hold them tight
      </motion.p>
    </div>
  );
}

export function BrandHeaderCompact() {
  return (
    <div className="flex flex-col">
      <h1 
        className="text-3xl sm:text-4xl font-light tracking-[-0.05em] font-serif select-none"
        style={{
          background: 'linear-gradient(135deg, oklch(0.50 0.20 280) 0%, oklch(0.60 0.22 300) 40%, oklch(0.65 0.18 330) 70%, oklch(0.55 0.20 280) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Tightly
      </h1>
      <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-muted-foreground/60 mt-0.5">
        Hold them tight
      </p>
    </div>
  );
}
