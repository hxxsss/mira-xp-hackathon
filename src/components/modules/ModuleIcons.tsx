import React from 'react';

export const MoneyCircleIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="55" fill="#9333EA" />
    <text x="60" y="80" fontSize="60" fill="white" textAnchor="middle" fontWeight="bold">$</text>
  </svg>
);

export const TargetIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer ring - Purple */}
    <circle cx="50" cy="60" r="40" fill="none" stroke="#9333EA" strokeWidth="8" />
    
    {/* Middle ring - Pink */}
    <circle cx="50" cy="60" r="28" fill="none" stroke="#EC4899" strokeWidth="8" />
    
    {/* Inner circle - Blue */}
    <circle cx="50" cy="60" r="16" fill="#3B82F6" />
    
    {/* Arrow shaft - Purple */}
    <line x1="75" y1="35" x2="42" y2="68" stroke="#9333EA" strokeWidth="5" strokeLinecap="round" />
    
    {/* Arrow head - Purple */}
    <path d="M 75 35 L 68 33 L 70 40 Z" fill="#9333EA" />
    
    {/* Arrow feathers - Blue */}
    <path d="M 42 68 L 45 75 L 38 72 Z" fill="#3B82F6" />
  </svg>
);

export const LockedIcon = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Lock body - Pink gradient */}
    <rect x="35" y="55" width="50" height="50" rx="8" fill="#EC4899" />
    
    {/* Lock shackle - Pink */}
    <path 
      d="M 45 55 L 45 40 Q 45 25 60 25 Q 75 25 75 40 L 75 55" 
      fill="none" 
      stroke="#EC4899" 
      strokeWidth="8" 
      strokeLinecap="round"
    />
    
    {/* Keyhole - White */}
    <circle cx="60" cy="75" r="6" fill="white" />
    <rect x="57" y="75" width="6" height="15" fill="white" rx="3" />
  </svg>
);
