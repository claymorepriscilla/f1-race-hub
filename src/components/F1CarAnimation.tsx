import { motion } from 'framer-motion';

const SmokeParticle = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute rounded-full bg-muted-foreground/20"
    style={{ width: 8, height: 8, right: 0, bottom: 4 }}
    initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0.5, 2.5, 4],
      x: [-10, -40, -80],
      y: [0, -8, -20],
    }}
    transition={{
      duration: 1.2,
      repeat: Infinity,
      delay,
      ease: 'easeOut',
    }}
  />
);

const F1CarAnimation = () => {
  return (
    <div className="relative w-full h-16 overflow-hidden pointer-events-none mt-2">
      {/* Track line */}
      <div className="absolute bottom-2 left-0 right-0 h-px bg-border" />

      <motion.div
        className="absolute bottom-2 left-0"
        initial={{ x: '-150px' }}
        animate={{ x: '100vw' }}
        transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
      >
        {/* Smoke particles */}
        <div className="absolute -left-4 bottom-0">
          <SmokeParticle delay={0} />
          <SmokeParticle delay={0.2} />
          <SmokeParticle delay={0.4} />
          <SmokeParticle delay={0.6} />
          <SmokeParticle delay={0.8} />
        </div>

        {/* F1 Car SVG — Red Bull inspired (dark blue + red + yellow) */}
        <svg width="110" height="32" viewBox="0 0 110 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Body */}
          <path d="M10 22 L25 22 L30 14 L75 10 L95 12 L100 18 L100 22 L10 22Z" fill="hsl(220, 80%, 20%)" />
          {/* Nose cone */}
          <path d="M2 22 L10 22 L10 20 L5 20Z" fill="hsl(220, 80%, 25%)" />
          {/* Cockpit */}
          <path d="M40 14 L55 12 L55 10 L45 10Z" fill="hsl(220, 60%, 12%)" />
          {/* Red accent stripe */}
          <rect x="30" y="16" width="65" height="3" rx="1" fill="hsl(1, 95%, 44%)" />
          {/* Yellow accent (Red Bull logo area) */}
          <rect x="60" y="12" width="12" height="4" rx="1" fill="hsl(51, 100%, 50%)" />
          {/* Rear wing */}
          <rect x="92" y="6" width="3" height="12" rx="1" fill="hsl(220, 80%, 25%)" />
          <rect x="88" y="4" width="14" height="3" rx="1" fill="hsl(220, 80%, 20%)" />
          {/* Front wing */}
          <rect x="2" y="22" width="14" height="2" rx="1" fill="hsl(220, 80%, 25%)" />
          {/* Rear wheel */}
          <circle cx="85" cy="24" r="6" fill="hsl(0, 0%, 15%)" />
          <circle cx="85" cy="24" r="3" fill="hsl(0, 0%, 30%)" />
          {/* Front wheel */}
          <circle cx="22" cy="24" r="6" fill="hsl(0, 0%, 15%)" />
          <circle cx="22" cy="24" r="3" fill="hsl(0, 0%, 30%)" />
          {/* Number */}
          <text x="50" y="20" fill="white" fontSize="6" fontFamily="monospace" fontWeight="bold">1</text>
        </svg>
      </motion.div>
    </div>
  );
};

export default F1CarAnimation;
