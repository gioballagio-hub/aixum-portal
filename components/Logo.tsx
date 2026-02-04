
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', withGlow = true }) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-24'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img 
        src="logo.png" 
        alt="AIXUM Italian AI Solutions" 
        className={`${sizes[size]} w-auto object-contain transition-all duration-500 ${withGlow ? 'drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]' : ''}`}
      />
    </div>
  );
};

export default Logo;
