interface NutritionRingProps {
  label: string;
  value: number;
  target: number;
  color: 'calories' | 'protein' | 'fiber' | 'carbs' | 'fats' | 'water';
  size?: 'sm' | 'md' | 'lg';
}

export function NutritionRing({ 
  label, 
  value, 
  target, 
  color, 
  size = 'md' 
}: NutritionRingProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`relative ${sizeClasses[size]} animate-fade-in`}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
          fill="transparent"
          className="opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45"
          stroke={`hsl(var(--${color}))`}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out animate-progress-fill"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold text-foreground ${textSizes[size]}`}>
          {Math.round(value)}
        </span>
        <span className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-xs'}`}>
          /{target}
        </span>
        <span className={`text-muted-foreground font-medium ${size === 'sm' ? 'text-xs' : 'text-xs'} mt-1`}>
          {label}
        </span>
      </div>
    </div>
  );
}