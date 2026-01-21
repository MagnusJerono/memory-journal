import { motion } from 'framer-motion';

function CloudShape({ className, isDark = false }: { className?: string; isDark?: boolean }) {
  const fillColor = isDark 
    ? 'oklch(0.22 0.06 270 / 0.85)' 
    : 'oklch(1 0 0 / 0.92)';
  const shadowColor = isDark 
    ? 'oklch(0.15 0.04 265 / 0.6)' 
    : 'oklch(0.92 0.02 225 / 0.5)';
  
  return (
    <svg 
      viewBox="0 0 400 100" 
      fill="none" 
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <ellipse cx="50" cy="70" rx="45" ry="30" fill={shadowColor} />
      <ellipse cx="120" cy="65" rx="55" ry="35" fill={shadowColor} />
      <ellipse cx="200" cy="60" rx="70" ry="40" fill={shadowColor} />
      <ellipse cx="280" cy="65" rx="55" ry="35" fill={shadowColor} />
      <ellipse cx="350" cy="70" rx="45" ry="30" fill={shadowColor} />
      
      <ellipse cx="50" cy="65" rx="45" ry="30" fill={fillColor} />
      <ellipse cx="120" cy="55" rx="55" ry="35" fill={fillColor} />
      <ellipse cx="200" cy="50" rx="70" ry="40" fill={fillColor} />
      <ellipse cx="280" cy="55" rx="55" ry="35" fill={fillColor} />
      <ellipse cx="350" cy="65" rx="45" ry="30" fill={fillColor} />
      
      <ellipse cx="80" cy="40" rx="40" ry="28" fill={fillColor} />
      <ellipse cx="160" cy="32" rx="50" ry="30" fill={fillColor} />
      <ellipse cx="240" cy="30" rx="45" ry="28" fill={fillColor} />
      <ellipse cx="320" cy="38" rx="40" ry="26" fill={fillColor} />
    </svg>
  );
}

interface BrandHeaderProps {
  isDarkMode?: boolean;
}

export function BrandHeader({ isDarkMode = false }: BrandHeaderProps) {
  return (
    <div className="flex flex-col items-start -ml-2">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight select-none pl-4 pr-6"
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontWeight: 600,
            background: isDarkMode
              ? 'linear-gradient(135deg, oklch(0.92 0.08 280) 0%, oklch(0.88 0.12 300) 40%, oklch(0.95 0.06 320) 70%, oklch(0.90 0.10 280) 100%)'
              : 'linear-gradient(135deg, oklch(0.45 0.18 260) 0%, oklch(0.50 0.20 280) 40%, oklch(0.55 0.16 300) 70%, oklch(0.48 0.18 270) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: isDarkMode 
              ? '0 4px 40px oklch(0.75 0.15 280 / 0.4)'
              : '0 4px 40px oklch(0.50 0.18 280 / 0.3)',
            letterSpacing: '-0.02em',
          }}
        >
          Tightly
        </h1>
        <motion.p 
          className="text-[10px] sm:text-xs font-medium tracking-[0.3em] uppercase text-muted-foreground/60 mt-1 pl-5"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Hold them tight
        </motion.p>
      </motion.div>
    </div>
  );
}

interface CloudHeaderProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
  className?: string;
}

export function CloudHeader({ children, isDarkMode = false, className = '' }: CloudHeaderProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 -top-2 -bottom-2">
        <CloudShape 
          className="w-full h-full" 
          isDark={isDarkMode}
        />
      </div>
      <div 
        className="relative z-10 px-6 py-3"
        style={{
          filter: isDarkMode 
            ? 'drop-shadow(0 2px 8px oklch(0 0 0 / 0.3))' 
            : 'drop-shadow(0 2px 8px oklch(0.5 0.1 230 / 0.15))',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function BrandHeaderCompact({ isDarkMode = false }: BrandHeaderProps) {
  return (
    <div className="flex flex-col">
      <h1 
        className="text-3xl sm:text-4xl md:text-5xl tracking-tight select-none"
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontWeight: 600,
          background: isDarkMode
            ? 'linear-gradient(135deg, oklch(0.92 0.08 280) 0%, oklch(0.88 0.12 300) 40%, oklch(0.95 0.06 320) 70%, oklch(0.90 0.10 280) 100%)'
            : 'linear-gradient(135deg, oklch(0.45 0.18 260) 0%, oklch(0.50 0.20 280) 40%, oklch(0.55 0.16 300) 70%, oklch(0.48 0.18 270) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Tightly
      </h1>
      <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-muted-foreground/50 mt-0.5">
        Hold them tight
      </p>
    </div>
  );
}
