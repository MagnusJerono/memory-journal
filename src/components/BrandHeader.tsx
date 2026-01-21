import { motion } from 'framer-motion';

function FluffyCloudShape({ className, isDark = false }: { className?: string; isDark?: boolean }) {
  const baseColor = isDark 
    ? 'oklch(0.22 0.06 270)' 
    : 'oklch(1 0 0)';
  const shadowColor = isDark 
    ? 'oklch(0.12 0.04 265)' 
    : 'oklch(0.75 0.04 225)';
  const highlightColor = isDark
    ? 'oklch(0.32 0.07 275)'
    : 'oklch(1 0.01 220)';
  const innerShadowColor = isDark
    ? 'oklch(0.08 0.03 260)'
    : 'oklch(0.85 0.03 230)';
  
  return (
    <svg 
      viewBox="0 0 500 160" 
      fill="none" 
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id={`cloudInnerShadow-${isDark ? 'dark' : 'light'}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur" />
          <feOffset in="blur" dx="0" dy="6" result="offsetBlur" />
          <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
        </filter>
        <linearGradient id={`cloudGradient-${isDark ? 'dark' : 'light'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={highlightColor} stopOpacity="1" />
          <stop offset="40%" stopColor={baseColor} stopOpacity={isDark ? '0.95' : '0.98'} />
          <stop offset="100%" stopColor={innerShadowColor} stopOpacity={isDark ? '0.9' : '0.95'} />
        </linearGradient>
        <radialGradient id={`cloudHighlight-${isDark ? 'dark' : 'light'}`} cx="30%" cy="20%" r="60%">
          <stop offset="0%" stopColor={highlightColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={baseColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      <ellipse cx="40" cy="135" rx="55" ry="40" fill={shadowColor} opacity="0.5" />
      <ellipse cx="120" cy="130" rx="75" ry="50" fill={shadowColor} opacity="0.5" />
      <ellipse cx="220" cy="125" rx="95" ry="60" fill={shadowColor} opacity="0.5" />
      <ellipse cx="340" cy="128" rx="85" ry="55" fill={shadowColor} opacity="0.5" />
      <ellipse cx="440" cy="132" rx="70" ry="45" fill={shadowColor} opacity="0.5" />
      
      <ellipse cx="40" cy="120" rx="55" ry="42" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="120" cy="105" rx="80" ry="55" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="220" cy="95" rx="100" ry="65" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="340" cy="100" rx="90" ry="58" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="450" cy="115" rx="65" ry="48" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      
      <ellipse cx="70" cy="75" rx="55" ry="45" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="160" cy="60" rx="70" ry="50" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="260" cy="50" rx="80" ry="55" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="360" cy="58" rx="65" ry="48" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="430" cy="80" rx="50" ry="40" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      
      <ellipse cx="110" cy="35" rx="50" ry="38" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="200" cy="25" rx="60" ry="42" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="300" cy="28" rx="55" ry="40" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="390" cy="42" rx="45" ry="35" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      
      <ellipse cx="150" cy="15" rx="40" ry="30" fill={highlightColor} opacity="0.9" />
      <ellipse cx="250" cy="10" rx="45" ry="32" fill={highlightColor} opacity="0.9" />
      <ellipse cx="340" cy="18" rx="38" ry="28" fill={highlightColor} opacity="0.9" />
      
      <ellipse cx="100" cy="85" rx="30" ry="22" fill={innerShadowColor} opacity="0.3" />
      <ellipse cx="200" cy="80" rx="40" ry="25" fill={innerShadowColor} opacity="0.25" />
      <ellipse cx="320" cy="85" rx="35" ry="22" fill={innerShadowColor} opacity="0.25" />
      <ellipse cx="400" cy="95" rx="28" ry="18" fill={innerShadowColor} opacity="0.2" />
      
      <ellipse cx="180" cy="40" rx="25" ry="18" fill={`url(#cloudHighlight-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="280" cy="35" rx="30" ry="20" fill={`url(#cloudHighlight-${isDark ? 'dark' : 'light'})`} />
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
            color: 'transparent',
            background: isDarkMode
              ? 'linear-gradient(135deg, oklch(0.95 0.06 280) 0%, oklch(0.90 0.12 300) 40%, oklch(0.98 0.04 320) 70%, oklch(0.92 0.08 280) 100%)'
              : 'linear-gradient(135deg, oklch(0.38 0.20 260) 0%, oklch(0.45 0.22 280) 40%, oklch(0.52 0.18 300) 70%, oklch(0.40 0.20 270) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            filter: isDarkMode 
              ? 'drop-shadow(0 4px 30px oklch(0.75 0.15 280 / 0.4))'
              : 'drop-shadow(0 4px 30px oklch(0.50 0.18 280 / 0.3))',
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
    <motion.div 
      className={`relative ${className}`}
      animate={{
        y: [0, -6, 0, -3, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
    >
      <motion.div 
        className="absolute inset-x-0 -top-8 -bottom-6 -left-4 -right-4"
        style={{
          filter: isDarkMode
            ? 'drop-shadow(0 8px 24px oklch(0 0 0 / 0.5)) drop-shadow(0 2px 8px oklch(0.15 0.05 270 / 0.4))'
            : 'drop-shadow(0 8px 24px oklch(0.7 0.04 230 / 0.35)) drop-shadow(0 2px 8px oklch(0.8 0.03 225 / 0.25))',
        }}
      >
        <FluffyCloudShape 
          className="w-full h-full" 
          isDark={isDarkMode}
        />
      </motion.div>
      <div 
        className="relative z-10 px-6 py-5"
      >
        {children}
      </div>
    </motion.div>
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
          color: 'transparent',
          background: isDarkMode
            ? 'linear-gradient(135deg, oklch(0.95 0.06 280) 0%, oklch(0.90 0.12 300) 40%, oklch(0.98 0.04 320) 70%, oklch(0.92 0.08 280) 100%)'
            : 'linear-gradient(135deg, oklch(0.38 0.20 260) 0%, oklch(0.45 0.22 280) 40%, oklch(0.52 0.18 300) 70%, oklch(0.40 0.20 270) 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
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
