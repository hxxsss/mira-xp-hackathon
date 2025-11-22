import React from 'react';

export const MoneyCircleIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="moneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#9333EA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="60" cy="60" r="55" fill="url(#moneyGrad)" filter="url(#glow)" />
    <circle cx="60" cy="60" r="45" fill="none" stroke="white" strokeWidth="2" opacity="0.3" />
    <text x="60" y="80" fontSize="60" fill="white" textAnchor="middle" fontWeight="bold" filter="url(#glow)">$</text>
  </svg>
);

export const TargetIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="targetGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#9333EA', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="targetGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="targetGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Outer ring - Gradient Purple to Pink */}
    <circle cx="50" cy="60" r="40" fill="none" stroke="url(#targetGrad1)" strokeWidth="8" filter="url(#targetGlow)" />
    
    {/* Middle ring - Pink */}
    <circle cx="50" cy="60" r="28" fill="none" stroke="#EC4899" strokeWidth="6" opacity="0.8" />
    
    {/* Inner circle - Blue Gradient */}
    <circle cx="50" cy="60" r="16" fill="url(#targetGrad2)" filter="url(#targetGlow)" />
    <circle cx="50" cy="60" r="10" fill="white" opacity="0.4" />
    
    {/* Arrow shaft - Purple */}
    <line x1="75" y1="35" x2="42" y2="68" stroke="url(#targetGrad1)" strokeWidth="5" strokeLinecap="round" filter="url(#targetGlow)" />
    
    {/* Arrow head - Purple */}
    <path d="M 75 35 L 68 33 L 70 40 Z" fill="#9333EA" filter="url(#targetGlow)" />
    
    {/* Arrow feathers - Blue */}
    <path d="M 42 68 L 45 75 L 38 72 Z" fill="url(#targetGrad2)" filter="url(#targetGlow)" />
  </svg>
);

export const LockedIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="lockGlow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Lock body - Gradient */}
    <rect x="35" y="55" width="50" height="50" rx="8" fill="url(#lockGrad)" filter="url(#lockGlow)" />
    <rect x="38" y="58" width="44" height="44" rx="6" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
    
    {/* Lock shackle - Gradient */}
    <path 
      d="M 45 55 L 45 40 Q 45 25 60 25 Q 75 25 75 40 L 75 55" 
      fill="none" 
      stroke="url(#lockGrad)" 
      strokeWidth="8" 
      strokeLinecap="round"
      filter="url(#lockGlow)"
    />
    
    {/* Inner shackle highlight */}
    <path 
      d="M 48 55 L 48 42 Q 48 30 60 30 Q 72 30 72 42 L 72 55" 
      fill="none" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round"
      opacity="0.4"
    />
    
    {/* Keyhole - White with glow */}
    <circle cx="60" cy="75" r="7" fill="white" opacity="0.9" filter="url(#lockGlow)" />
    <rect x="56.5" y="75" width="7" height="16" fill="white" rx="3.5" opacity="0.9" filter="url(#lockGlow)" />
  </svg>
);
