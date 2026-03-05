interface SpeedometerProps {
  value: number;
  max: number;
  label: string;
}

const Speedometer = ({ value, max, label }: SpeedometerProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0 border-[6px] border-border rounded-t-full" />
        {/* Filled arc */}
        <div
          className="absolute inset-0 border-[6px] border-primary rounded-t-full"
          style={{
            clipPath: `polygon(0 100%, 0 0, ${percentage}% 0, ${percentage}% 100%)`,
          }}
        />
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-0.5 h-14 bg-secondary origin-bottom transition-transform duration-1000"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-secondary rounded-full translate-y-1/2" />
      </div>
      <div className="text-center mt-2">
        <p className="font-racing text-xl text-primary">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

export default Speedometer;
