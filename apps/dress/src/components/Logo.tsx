import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" /> {/* amber-500 */}
          <stop offset="100%" stopColor="#d97706" /> {/* amber-600 */}
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill="url(#waveGradient)" />
      
      {/* Abstract Wave / Receipt lines */}
      <path 
        d="M20 55 L35 35 L50 60 L65 30 L80 50" 
        stroke="white" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M25 70 L40 50 L50 65 L60 45 L75 60" 
        stroke="rgba(255,255,255,0.5)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
