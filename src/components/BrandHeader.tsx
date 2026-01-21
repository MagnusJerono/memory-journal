import { motion } from 'framer-motion';

function FluffyCloudShape({ className, isDark = false }: { className?: string; isDark?: boolean }) {
  const fillColor = isDark 
    ? 'oklch(0.22 0.06 270 / 0.9)' 
    : 'oklch(1 0 0 / 0.95)';
  const shadowColor = isDark 
    ? 'oklch(0.15 0.04 265 / 0.5)' 
    : 'oklch(0.88 0.02 225 / 0.4)';
  const highlightColor = isDark
    ? 'oklch(0.30 0.06 275 / 0.6)'
    : 'oklch(1 0 0 / 1)';
  
  return (
    <svg 
      viewBox="0 0 500 160" 
      fill="none" 
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <ellipse cx="40" cy="130" rx="55" ry="40" fill={shadowColor} />
      <ellipse cx="120" cy="125" rx="75" ry="50" fill={shadowColor} />
      <ellipse cx="220" cy="115" rx="95" ry="60" fill={shadowColor} />
      <ellipse cx="340" cy="120" rx="85" ry="55" fill={shadowColor} />
      <ellipse cx="440" cy="125" rx="70" ry="45" fill={shadowColor} />
      
      <ellipse cx="40" cy="120" rx="55" ry="42" fill={fillColor} />
      <ellipse cx="120" cy="105" rx="80" ry="55" fill={fillColor} />
      <ellipse cx="220" cy="95" rx="100" ry="65" fill={fillColor} />
      <ellipse cx="340" cy="100" rx="90" ry="58" fill={fillColor} />
      <ellipse cx="450" cy="115" rx="65" ry="48" fill={fillColor} />
      
      <ellipse cx="70" cy="75" rx="55" ry="45" fill={fillColor} />
      <ellipse cx="160" cy="60" rx="70" ry="50" fill={fillColor} />
      <ellipse cx="260" cy="50" rx="80" ry="55" fill={fillColor} />
      <ellipse cx="360" cy="58" rx="65" ry="48" fill={fillColor} />
      <ellipse cx="430" cy="80" rx="50" ry="40" fill={fillColor} />
      
      <ellipse cx="110" cy="35" rx="50" ry="38" fill={fillColor} />
      <ellipse cx="200" cy="25" rx="60" ry="42" fill={fillColor} />
      <ellipse cx="300" cy="28" rx="55" ry="40" fill={fillColor} />
      <ellipse cx="390" cy="42" rx="45" ry="35" fill={fillColor} />
      
      <ellipse cx="150" cy="15" rx="40" ry="30" fill={highlightColor} />
      <ellipse cx="250" cy="10" rx="45" ry="32" fill={highlightColor} />
      <ellipse cx="340" cy="18" rx="38" ry="28" fill={highlightColor} />
    </svg>
  );
}

interface BrandHeaderProps {
  isDarkMode?: boolean;
}

export function BrandHeader({ isDarkMode = false }: BrandHeaderProps) {
  return (
    <div className="flex flex-col items-start">
      <motion.div 
        className="relative"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight select-none"
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontWeight: 700,
            background: isDarkMode
              ? 'linear-gradient(135deg, oklch(0.95 0.06 280) 0%, oklch(0.90 0.12 300) 40%, oklch(0.98 0.04 320) 70%, oklch(0.92 0.08 280) 100%)'
              : 'linear-gradient(135deg, oklch(0.38 0.20 260) 0%, oklch(0.45 0.22 280) 40%, oklch(0.52 0.18 300) 70%, oklch(0.40 0.20 270) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: isDarkMode 
              ? '0 4px 40px oklch(0.75 0.15 280 / 0.5)'
              : '0 4px 40px oklch(0.50 0.18 280 / 0.4)',
            letterSpacing: '-0.02em',
          }}
        >
          Tightly
        </h1>
        <motion.p 
          className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase mt-1"
          style={{
            color: isDarkMode 
              ? 'oklch(0.80 0.08 280)' 
              : 'oklch(0.45 0.12 270)',
            textShadow: isDarkMode
              ? '0 1px 10px oklch(0.7 0.1 280 / 0.3)'
              : '0 1px 8px oklch(0.5 0.15 270 / 0.2)',
          }}
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
      <div className="absolute inset-x-0 -top-8 -bottom-6 -left-4 -right-4">
        <FluffyCloudShape 
          className="w-full h-full" 
          isDark={isDarkMode}
        />
      </div>
      <div 
        className="relative z-10 px-6 py-5"
        style={{
          filter: isDarkMode 
            ? 'drop-shadow(0 2px 12px oklch(0 0 0 / 0.4))' 
            : 'drop-shadow(0 2px 12px oklch(0.5 0.1 230 / 0.2))',
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
          fontWeight: 700,
          background: isDarkMode
            ? 'linear-gradient(135deg, oklch(0.95 0.06 280) 0%, oklch(0.90 0.12 300) 40%, oklch(0.98 0.04 320) 70%, oklch(0.92 0.08 280) 100%)'
            : 'linear-gradient(135deg, oklch(0.38 0.20 260) 0%, oklch(0.45 0.22 280) 40%, oklch(0.52 0.18 300) 70%, oklch(0.40 0.20 270) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Tightly
      </h1>
      <p 
        className="text-[9px] font-semibold tracking-[0.2em] uppercase mt-0.5"
        style={{
          color: isDarkMode 
            ? 'oklch(0.80 0.08 280)' 
            : 'oklch(0.45 0.12 270)',
        }}
      >
        Hold them tight
      </p>
    </div>
  );
}
