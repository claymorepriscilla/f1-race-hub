import { motion } from 'framer-motion';
import { Crown, Trophy, Medal, Zap } from 'lucide-react';

interface PodiumDriverProps {
  username: string;
  constructor_id: string;
  total_points: number;
  avatar_url: string;
  rank_tier: string;
}

const podiumConfig = {
  1: {
    borderColor: 'border-gold',
    glowClass: 'box-glow-gold',
    label: '1',
    delay: 0.4,
    icon: Crown,
    accentGradient: 'from-[hsl(51,100%,50%)] to-[hsl(40,100%,40%)]',
    ringColor: 'ring-[hsl(51,100%,50%)]',
  },
  2: {
    borderColor: 'border-silver',
    glowClass: 'box-glow-silver',
    label: '2',
    delay: 0.6,
    icon: Medal,
    accentGradient: 'from-[hsl(0,0%,75%)] to-[hsl(0,0%,55%)]',
    ringColor: 'ring-[hsl(0,0%,75%)]',
  },
  3: {
    borderColor: 'border-bronze',
    glowClass: 'box-glow-bronze',
    label: '3',
    delay: 0.8,
    icon: Trophy,
    accentGradient: 'from-[hsl(30,60%,45%)] to-[hsl(25,60%,30%)]',
    ringColor: 'ring-[hsl(30,60%,45%)]',
  },
};

const WinnerParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 12 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-gold"
        style={{
          left: `${10 + Math.random() * 80}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [-20, -60],
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: 'easeOut',
        }}
      />
    ))}
  </div>
);

const DriverCard = ({
  driver,
  rank,
}: {
  driver: PodiumDriverProps;
  rank: 1 | 2 | 3;
}) => {
  const config = podiumConfig[rank];
  const Icon = config.icon;
  const isWinner = rank === 1;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: config.delay, duration: 0.7, type: 'spring', stiffness: 80 }}
      className={`flex flex-col items-center relative ${isWinner ? 'scale-110 z-10' : ''}`}
    >
      {isWinner && <WinnerParticles />}

      {/* Position badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: config.delay + 0.3, type: 'spring', stiffness: 200 }}
        className={`absolute -top-3 z-20 w-8 h-8 rounded-full bg-gradient-to-br ${config.accentGradient} flex items-center justify-center shadow-lg`}
      >
        <span className="font-racing text-sm text-background font-bold">{config.label}</span>
      </motion.div>

      {/* Driver card */}
      <div
        className={`relative mt-4 p-4 rounded-xl border ${config.borderColor} backdrop-blur-md bg-card/60 ${
          isWinner ? 'shadow-[0_0_40px_hsl(51,100%,50%,0.2),0_0_80px_hsl(51,100%,50%,0.1)]' : ''
        }`}
        style={{
          background: isWinner
            ? 'linear-gradient(135deg, hsl(0 0% 12% / 0.9), hsl(51 100% 50% / 0.05), hsl(0 0% 12% / 0.9))'
            : 'linear-gradient(135deg, hsl(0 0% 12% / 0.8), hsl(0 0% 16% / 0.6))',
        }}
      >
        {isWinner && (
          <motion.div
            animate={{ y: [-2, 2, -2], rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-8 left-1/2 -translate-x-1/2"
          >
            <Crown className="w-7 h-7 text-gold drop-shadow-[0_0_8px_hsl(51,100%,50%,0.6)]" fill="hsl(51,100%,50%)" />
          </motion.div>
        )}

        {/* Avatar */}
        <div className="relative mx-auto mb-3">
          <motion.div
            animate={isWinner ? { boxShadow: [
              '0 0 20px hsl(51,100%,50%,0.3)',
              '0 0 40px hsl(51,100%,50%,0.5)',
              '0 0 20px hsl(51,100%,50%,0.3)',
            ] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 ${config.borderColor} ring-2 ${config.ringColor} ring-offset-2 ring-offset-background`}
          >
            <img src={driver.avatar_url} alt={driver.username} className="w-full h-full object-cover" />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
            <Zap className="w-3 h-3 text-primary-foreground" fill="currentColor" />
          </div>
        </div>

        {/* Info */}
        <div className="text-center space-y-1">
          <p className={`font-racing text-sm md:text-base tracking-wider truncate max-w-[120px] ${isWinner ? 'text-gold' : 'text-foreground'}`}>
            {driver.username}
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground font-racing tracking-widest uppercase">
            {driver.constructor_id}
          </p>
          <motion.p
            className={`font-racing text-xl md:text-2xl ${isWinner ? 'text-gold' : 'text-primary'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: config.delay + 0.5, type: 'spring' }}
          >
            {driver.total_points}
            <span className="text-[10px] text-muted-foreground ml-1">PTS</span>
          </motion.p>
        </div>
      </div>

      {/* Podium block */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: config.delay + 0.2, duration: 0.5, ease: 'easeOut' }}
        className={`${isWinner ? 'h-20' : 'h-12'} w-28 md:w-32 rounded-t-xl flex items-center justify-center mt-2 relative overflow-hidden origin-bottom`}
        style={{
          background: 'linear-gradient(180deg, hsl(0 0% 18%) 0%, hsl(0 0% 10%) 100%)',
          borderTop: `2px solid hsl(var(--${rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'}))`,
        }}
      >
        <div className="absolute inset-0 checkered-flag opacity-[0.03]" />
        <div className="absolute inset-0 racing-stripe" />
        <div className="relative z-10 text-center">
          <Icon className={`w-5 h-5 mx-auto mb-1 ${rank === 1 ? 'text-gold' : rank === 2 ? 'text-silver' : 'text-bronze'}`} />
          <span className="font-racing text-2xl md:text-3xl text-muted-foreground/40">P{config.label}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Podium = ({ drivers }: { drivers: PodiumDriverProps[] }) => {
  if (drivers.length < 3) return null;

  return (
    <div className="relative">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-gold/5 rounded-full blur-[80px]" />
      </div>

      {/* Data lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-secondary to-transparent w-full"
            style={{ top: `${20 + i * 15}%` }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* P1 on top center, P2 and P3 flanking below at same height */}
      <div className="flex flex-col items-center gap-0 py-8 relative z-10">
        {/* P1 - Top center */}
        <DriverCard driver={drivers[0]} rank={1} />
        {/* P2 and P3 - Same level below */}
        <div className="flex items-start justify-center gap-6 md:gap-16 -mt-4">
          <DriverCard driver={drivers[1]} rank={2} />
          <DriverCard driver={drivers[2]} rank={3} />
        </div>
      </div>
    </div>
  );
};

export default Podium;
