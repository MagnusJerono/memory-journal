import { motion } from 'framer-motion';

function FluffyCloudShape({ className, isDark = false }: { className?: string; isDark?: boolean }) {
  const baseColor = isDark 
    ? 'oklch(0.22 0.06 270)' 
    : 'oklch(0.98 0.01 220)';
  const shadowColor = isDark 
    ? 'oklch(0.12 0.04 265)' 
    : 'oklch(0.85 0.04 225)';
  const highlightColor = isDark
    ? 'oklch(0.32 0.07 275)'
    : 'oklch(1 0.005 220)';
  const innerShadowColor = isDark
    ? 'oklch(0.08 0.03 260)'
    : 'oklch(0.92 0.02 230)';
  
  return (
    <svg 
      viewBox="0 0 500 220" 
      fill="none" 
      className={className}
      preserveAspectRatio="none"
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
      
      <ellipse cx="40" cy="195" rx="55" ry="40" fill={shadowColor} opacity="0.5" />
      <ellipse cx="120" cy="190" rx="75" ry="50" fill={shadowColor} opacity="0.5" />
      <ellipse cx="220" cy="185" rx="95" ry="60" fill={shadowColor} opacity="0.5" />
      <ellipse cx="340" cy="188" rx="85" ry="55" fill={shadowColor} opacity="0.5" />
      <ellipse cx="440" cy="192" rx="70" ry="45" fill={shadowColor} opacity="0.5" />
      
      <ellipse cx="40" cy="180" rx="55" ry="42" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="120" cy="165" rx="80" ry="55" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="220" cy="155" rx="100" ry="65" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="340" cy="160" rx="90" ry="58" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="450" cy="175" rx="65" ry="48" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      
      <ellipse cx="70" cy="125" rx="55" ry="45" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="160" cy="110" rx="70" ry="50" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="260" cy="100" rx="80" ry="55" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="360" cy="108" rx="65" ry="48" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="430" cy="130" rx="50" ry="40" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      
      <ellipse cx="110" cy="65" rx="50" ry="38" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="200" cy="55" rx="60" ry="42" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="300" cy="58" rx="55" ry="40" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="390" cy="72" rx="45" ry="35" fill={`url(#cloudGradient-${isDark ? 'dark' : 'light'})`} />
      
      <ellipse cx="150" cy="35" rx="40" ry="30" fill={highlightColor} opacity="0.9" />
      <ellipse cx="250" cy="30" rx="45" ry="32" fill={highlightColor} opacity="0.9" />
      <ellipse cx="340" cy="38" rx="38" ry="28" fill={highlightColor} opacity="0.9" />
      
      <ellipse cx="100" cy="135" rx="30" ry="22" fill={innerShadowColor} opacity="0.3" />
      <ellipse cx="200" cy="130" rx="40" ry="25" fill={innerShadowColor} opacity="0.25" />
      <ellipse cx="320" cy="135" rx="35" ry="22" fill={innerShadowColor} opacity="0.25" />
      <ellipse cx="400" cy="145" rx="28" ry="18" fill={innerShadowColor} opacity="0.2" />
      
      <ellipse cx="180" cy="70" rx="25" ry="18" fill={`url(#cloudHighlight-${isDark ? 'dark' : 'light'})`} />
      <ellipse cx="280" cy="65" rx="30" ry="20" fill={`url(#cloudHighlight-${isDark ? 'dark' : 'light'})`} />
    </svg>
  );
}

interface BrandHeaderProps {
  isDarkMode?: boolean;
}

export function BrandHeader({ isDarkMode = false }: BrandHeaderProps) {
  const gradientId = isDarkMode ? 'brand-gradient-dark' : 'brand-gradient-light';
  
  return (
    <div className="flex flex-col items-start w-full">
      <motion.div 
        className="relative w-full"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {isDarkMode ? (
                <>
                  <stop offset="0%" stopColor="#e0d4f7" />
                  <stop offset="40%" stopColor="#d4b8f0" />
                  <stop offset="70%" stopColor="#f0d4e8" />
                  <stop offset="100%" stopColor="#dcd0f5" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#5b4ba8" />
                  <stop offset="40%" stopColor="#6b52c0" />
                  <stop offset="70%" stopColor="#8060c8" />
                  <stop offset="100%" stopColor="#5f50b0" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl tracking-tight select-none whitespace-nowrap"
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontWeight: 700,
            background: `url(#${gradientId})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: isDarkMode ? '#e0d4f7' : '#5b4ba8',
            letterSpacing: '-0.01em',
            textShadow: isDarkMode
              ? '0 4px 30px rgba(180, 140, 220, 0.4), 0 2px 10px rgba(180, 140, 220, 0.3)'
              : '0 4px 30px rgba(91, 75, 168, 0.3), 0 2px 10px rgba(91, 75, 168, 0.2)',
          }}
        >
          tightly
        </h1>
        <motion.div
          className="flex items-center gap-2 sm:gap-3 mt-2 md:mt-3"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span 
            className="h-px w-6 sm:w-10 md:w-14"
            style={{ background: isDarkMode ? 'rgba(180, 164, 216, 0.5)' : 'rgba(107, 90, 160, 0.4)' }}
          />
          <p 
            className="text-xs sm:text-sm md:text-base font-medium tracking-[0.12em] italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: isDarkMode ? '#c8b8e8' : '#5f4f98',
              textShadow: isDarkMode
                ? '0 1px 10px rgba(180, 140, 220, 0.25)'
                : '0 1px 8px rgba(91, 75, 168, 0.15)',
            }}
          >
            Hold them tight
          </p>
          <span 
            className="h-px w-6 sm:w-10 md:w-14"
            style={{ background: isDarkMode ? 'rgba(180, 164, 216, 0.5)' : 'rgba(107, 90, 160, 0.4)' }}
          />
        </motion.div>
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
        className="absolute inset-x-0 -top-4 -bottom-4 -left-6 -right-6"
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
        className="relative z-10 px-6 py-4"
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
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight select-none whitespace-nowrap"
        style={{
          fontFamily: "'Dancing Script', cursive",
          fontWeight: 700,
          color: isDarkMode ? '#e0d4f7' : '#5b4ba8',
          letterSpacing: '-0.01em',
          textShadow: isDarkMode
            ? '0 2px 15px rgba(180, 140, 220, 0.3)'
            : '0 2px 15px rgba(91, 75, 168, 0.2)',
        }}
      >
        tightly
      </h1>
      <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
        <span 
          className="h-px w-4 sm:w-6"
          style={{ background: isDarkMode ? 'rgba(180, 164, 216, 0.5)' : 'rgba(107, 90, 160, 0.4)' }}
        />
        <p 
          className="text-[10px] sm:text-xs font-medium tracking-[0.1em] italic"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: isDarkMode ? '#c8b8e8' : '#5f4f98',
          }}
        >
          Hold them tight
        </p>
        <span 
          className="h-px w-4 sm:w-6"
          style={{ background: isDarkMode ? 'rgba(180, 164, 216, 0.5)' : 'rgba(107, 90, 160, 0.4)' }}
        />
      </div>
    </div>
  );
}
