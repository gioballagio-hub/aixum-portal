
import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', withGlow = true }) => {
  const [error, setError] = useState(false);

  // Dimensioni basate sulla larghezza per ospitare il payoff "Italian AI Solutions"
  const imageWidths = {
    sm: 'w-28 md:w-32',
    md: 'w-40 md:w-48',
    lg: 'w-64 md:w-72',
    xl: 'w-80 md:w-96'
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Glow di profondità dietro il logo */}
      {withGlow && !error && (
        <div className="absolute inset-0 blur-[40px] bg-gold-primary/15 -z-10 rounded-full scale-110 animate-pulse"></div>
      )}

      {!error ? (
        <img 
          src="logo_AIXUM_senza_sfondo.png" 
          alt="AIXUM Italian AI Solutions" 
          onError={() => setError(true)}
          className={`
            ${imageWidths[size]} 
            h-auto object-contain relative z-10 
            brightness-[1.1] contrast-[1.05]
            drop-shadow-[0_0_15px_rgba(212,175,55,0.35)]
            transition-all duration-500 hover:scale-[1.02]
          `}
        />
      ) : (
        /* Fallback Premium se l'immagine non è presente */
        <div className="flex flex-col items-center group">
          <span className="text-3xl md:text-4xl font-display font-black gold-text-gradient tracking-tighter italic">AIXUM</span>
          <span className="text-[8px] md:text-[10px] text-gold-primary/70 font-bold uppercase tracking-[0.3em] -mt-1">Italian AI Solutions</span>
          <div className="h-[1px] w-full gold-gradient rounded-full mt-1 opacity-50 group-hover:opacity-100 transition-opacity"></div>
        </div>
      )}
    </div>
  );
};

export default Logo;
