import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DreamyBackgroundProps {
  isDarkMode: boolean;
}

export function DreamyBackground({ isDarkMode }: DreamyBackgroundProps) {
  const isMobile = useIsMobile();
  const [isReady, setIsReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Lazy load animation - wait for idle time or 300ms
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => setIsReady(true), { timeout: 300 });
    } else {
      setTimeout(() => setIsReady(true), 300);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // If user prefers reduced motion, show static gradient only
  if (prefersReducedMotion) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div 
          className={`absolute inset-0 transition-all duration-1000 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900' 
              : 'bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50'
          }`}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900' 
            : 'bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50'
        }`}
      />
      
      {isReady && (
        <>
          {/* Animated gradient overlay */}
          <div 
            className={`absolute inset-0 opacity-50 ${
              isDarkMode
                ? 'bg-gradient-to-tr from-violet-900/30 via-purple-900/20 to-pink-900/30'
                : 'bg-gradient-to-tr from-violet-200/40 via-purple-200/30 to-pink-200/40'
            }`}
            style={{
              animation: `gradient ${isMobile ? '20s' : '15s'} ease infinite`,
              backgroundSize: '200% 200%',
              willChange: 'background-position',
            }}
          />
          
          {/* Ambient glow spots - smaller on mobile for better performance */}
          <div 
            className={`absolute top-1/4 right-1/4 ${isMobile ? 'w-64 h-64' : 'w-96 h-96'} rounded-full blur-3xl ${
              isDarkMode ? 'bg-violet-600/20' : 'bg-violet-300/30'
            }`}
            style={{
              animation: `float ${isMobile ? '25s' : '20s'} ease-in-out infinite`,
              willChange: 'transform',
            }}
          />
          <div 
            className={`absolute bottom-1/3 left-1/3 ${isMobile ? 'w-56 h-56' : 'w-80 h-80'} rounded-full blur-3xl ${
              isDarkMode ? 'bg-purple-600/20' : 'bg-purple-300/30'
            }`}
            style={{
              animation: `float ${isMobile ? '30s' : '25s'} ease-in-out infinite reverse`,
              willChange: 'transform',
            }}
          />
        </>
      )}
      
      {/* CSS animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
