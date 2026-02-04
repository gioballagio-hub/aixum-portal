
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', withGlow = true }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Sfondo del logo (Quadrato arrotondato premium) */}
      <div className={`
        ${containerSizes[size]} 
        rounded-xl bg-dark-lighter border border-white/10 
        flex items-center justify-center relative overflow-hidden
        ${withGlow ? 'shadow-[0_0_20px_rgba(212,175,55,0.15)]' : ''}
      `}>
        {/* Effetto luce interna */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Simbolo SVG AIXUM */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizes[size]} transition-all duration-500`}
        >
          <defs>
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#F9A602" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Forma stilizzata "A" e "X" incrociate */}
          <path 
            d="M50 20L25 80H35L50 45L65 80H75L50 20Z" 
            fill="url(#gold-grad)" 
          />
          <path 
            d="M30 40L45 55L30 70" 
            stroke="url(#gold-grad)" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          <path 
            d="M70 40L55 55L70 70" 
            stroke="url(#gold-grad)" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          
          {/* Punto AI centrale */}
          <circle cx="50" cy="55" r="4" fill="url(#gold-grad)" filter="url(#glow)" />
        </svg>
      </div>

      {/* Se il logo è grande o extra grande, aggiungiamo il testo accanto se necessario, 
          ma qui manteniamo l'icona pura come richiesto dal design della sidebar */}
    </div>
  );
};

export default Logo;
