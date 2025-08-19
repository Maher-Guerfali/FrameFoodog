import React, { useState, useEffect } from 'react';

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
  // Animation state
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const isHighPercentage = percentage > 80;
  
  // Ring geometry
  const radius = 40; // Radius increased by 10% (from 36 to ~40)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  // Animate the ring progress after component mounts
  useEffect(() => {
    // Start animation after 1 second
    const timer = setTimeout(() => {
      const duration = 1500; // Slightly longer animation for smoother feel
      const startTime = performance.now();
      const startValue = 0;
      const endValue = percentage;

      const animate = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Ease-out function for smoother animation
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOutProgress;
        
        setAnimatedPercentage(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, 1000);

    // Cleanup function to prevent memory leaks
    return () => clearTimeout(timer);
  }, [percentage]);
  
  const sizeClasses = {
    sm: 'w-22 h-22',     // ~10% larger than w-20/h-20
    md: 'w-28 h-28',     // ~10% larger than w-24/h-24
    lg: 'w-36 h-36'      // ~10% larger than w-32/h-32
  };
  
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Gradient IDs must be unique per component instance
  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col items-center ${sizeClasses[size]} group`}>
      <div className="relative w-full h-full">
        <svg className="transform -rotate-90 w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`hsl(var(--${color}) / 0.8)`} />
              <stop offset="100%" stopColor={`hsl(var(--${color}) / 1)`} />
            </linearGradient>
          </defs>
          
          {/* Background circle - more subtle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={`hsl(var(--${color}) / 0.1)`}
            strokeWidth="12"
            fill="transparent"
            className="transition-colors duration-300"
          />
          
          {/* Progress track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={`hsl(var(--${color}) / 0.2)`}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            className="transition-opacity duration-300"
          />
          
          {/* Progress circle with gradient */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${
              isHighPercentage ? 'drop-shadow-glow' : ''
            }`}
            style={{
              '--progress': `${percentage}%`,
              '--circumference': circumference,
              '--offset': strokeDashoffset,
            } as React.CSSProperties}
          />
          
          {/* Glow effect for high percentages */}
          {isHighPercentage && (
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={`url(#${gradientId})`}
              strokeWidth="16"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"
            />
          )}
        </svg>
        
        {/* Center content - stacked value and target */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <span 
              className={`font-bold ${
                isHighPercentage 
                  ? 'text-foreground' 
                  : 'text-muted-foreground'
              } ${textSizes[size]} transition-colors duration-300 leading-none`}
            >
              {Math.round((animatedPercentage / 100) * value)}
            </span>
            <span className={`text-muted-foreground/60 text-xs leading-none mt-0.5`}>
              of {target}
            </span>
          </div>
        </div>
      </div>
      
      {/* Label below the ring */}
      <span className={`mt-2 font-medium text-center ${
        isHighPercentage 
          ? 'text-foreground' 
          : 'text-muted-foreground/80'
      } text-sm transition-colors duration-300`}>
        {label}
      </span>
    </div>
  );
}