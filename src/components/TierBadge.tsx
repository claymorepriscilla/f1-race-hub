import { Badge } from '@/components/ui/badge';

interface TierBadgeProps {
  tier: string;
}

const tierColors: Record<string, string> = {
  Rookie: 'bg-muted text-muted-foreground',
  Bronze: 'bg-bronze/20 text-bronze border-bronze/30',
  Silver: 'bg-silver/20 text-foreground border-silver/30',
  Gold: 'bg-gold/20 text-gold border-gold/30',
  Platinum: 'bg-secondary/20 text-secondary border-secondary/30',
  Champion: 'bg-primary/20 text-primary border-primary/30',
};

const TierBadge = ({ tier }: TierBadgeProps) => {
  return (
    <Badge variant="outline" className={`font-racing text-[10px] tracking-wider ${tierColors[tier] || tierColors.Rookie}`}>
      {tier.toUpperCase()}
    </Badge>
  );
};

export default TierBadge;
