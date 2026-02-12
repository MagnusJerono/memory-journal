interface DreamyBackgroundProps {
  isDarkMode: boolean;
}

export function DreamyBackground({ isDarkMode }: DreamyBackgroundProps) {
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
      
      {/* Animated gradient overlay */}
      <div 
        className={`absolute inset-0 opacity-50 animate-gradient ${
          isDarkMode
            ? 'bg-gradient-to-tr from-violet-900/30 via-purple-900/20 to-pink-900/30'
            : 'bg-gradient-to-tr from-violet-200/40 via-purple-200/30 to-pink-200/40'
        }`}
        style={{
          animation: 'gradient 15s ease infinite',
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Ambient glow spots */}
      <div 
        className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl ${
          isDarkMode ? 'bg-violet-600/20' : 'bg-violet-300/30'
        }`}
        style={{
          animation: 'float 20s ease-in-out infinite',
        }}
      />
      <div 
        className={`absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full blur-3xl ${
          isDarkMode ? 'bg-purple-600/20' : 'bg-purple-300/30'
        }`}
        style={{
          animation: 'float 25s ease-in-out infinite reverse',
        }}
      />
      
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
