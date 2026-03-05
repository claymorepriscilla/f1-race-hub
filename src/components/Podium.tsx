import { motion } from 'framer-motion';

interface PodiumDriverProps {
  username: string;
  constructor_id: string;
  total_points: number;
  avatar_url: string;
  rank_tier: string;
}

const podiumConfig = {
  1: { height: 'h-40', color: 'border-gold', glow: 'shadow-[0_0_30px_hsl(51_100%_50%/0.4)]', label: '1ST', delay: 0.3 },
  2: { height: 'h-32', color: 'border-silver', glow: 'shadow-[0_0_20px_hsl(0_0%_75%/0.3)]', label: '2ND', delay: 0.5 },
  3: { height: 'h-24', color: 'border-bronze', glow: 'shadow-[0_0_20px_hsl(30_60%_45%/0.3)]', label: '3RD', delay: 0.7 },
};

const Podium = ({ drivers }: { drivers: PodiumDriverProps[] }) => {
  // Reorder for display: 2nd, 1st, 3rd
  const ordered = [drivers[1], drivers[0], drivers[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-4 py-8">
      {ordered.map((driver, idx) => {
        const actualRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
        const config = podiumConfig[actualRank as 1 | 2 | 3];

        return (
          <motion.div
            key={driver?.username || idx}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: config.delay, duration: 0.6, type: 'spring' }}
            className="flex flex-col items-center"
          >
            {/* Driver card */}
            <div className={`relative mb-2 ${actualRank === 1 ? 'scale-110' : ''}`}>
              <div className={`w-20 h-20 rounded-full border-3 ${config.color} ${config.glow} overflow-hidden bg-carbon`}>
                <img src={driver?.avatar_url} alt={driver?.username} className="w-full h-full object-cover" />
              </div>
              {actualRank === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</div>
              )}
            </div>
            <p className="font-racing text-sm tracking-wider truncate max-w-[100px]">
              {driver?.username || 'TBD'}
            </p>
            <p className="text-xs text-muted-foreground">{driver?.constructor_id}</p>
            <p className="font-racing text-lg text-primary">{driver?.total_points || 0}</p>

            {/* Podium block */}
            <div className={`${config.height} w-24 bg-card border border-border rounded-t-lg flex items-center justify-center mt-2`}>
              <span className="font-racing text-2xl text-muted-foreground">{config.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Podium;
