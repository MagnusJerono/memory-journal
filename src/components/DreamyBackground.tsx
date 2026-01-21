import { motion } from 'framer-motion';

export function DreamyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/80 via-background to-violet-50/50" />
      
      <div className="absolute inset-0 opacity-40">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12"
                result="goo"
              />
            </filter>
          </defs>
        </svg>
      </div>

      <motion.div
        className="absolute w-[500px] h-[300px] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.95 0.02 280) 0%, transparent 70%)',
          filter: 'blur(40px)',
          top: '5%',
          left: '10%',
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 30, -20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[600px] h-[350px] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.92 0.03 200) 0%, transparent 70%)',
          filter: 'blur(50px)',
          top: '15%',
          right: '5%',
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, 40, 10, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[250px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.90 0.05 330) 0%, transparent 70%)',
          filter: 'blur(45px)',
          top: '40%',
          left: '30%',
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[550px] h-[320px] rounded-full opacity-45"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.94 0.02 260) 0%, transparent 70%)',
          filter: 'blur(55px)',
          bottom: '20%',
          left: '5%',
        }}
        animate={{
          x: [0, 120, 60, 0],
          y: [0, -40, 30, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-[450px] h-[280px] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(ellipse, oklch(0.88 0.06 280) 0%, transparent 70%)',
          filter: 'blur(50px)',
          bottom: '10%',
          right: '15%',
        }}
        animate={{
          x: [0, -70, -35, 0],
          y: [0, 50, -20, 0],
          scale: [1, 1.08, 0.92, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
