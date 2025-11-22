import React from 'react';

export const TrophyGameIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#A855F7', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="trophyGlow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Trophy Cup */}
    <path d="M6 5h12v6c0 3.31-2.69 6-6 6s-6-2.69-6-6V5z" 
      stroke="url(#trophyGrad)" 
      strokeWidth="2" 
      fill="url(#trophyGrad)" 
      fillOpacity="0.2"
      filter="url(#trophyGlow)"
    />
    
    {/* Left Handle */}
    <path d="M6 7H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2" 
      stroke="url(#trophyGrad)" 
      strokeWidth="2" 
      fill="none"
      filter="url(#trophyGlow)"
    />
    
    {/* Right Handle */}
    <path d="M18 7h2c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-2" 
      stroke="url(#trophyGrad)" 
      strokeWidth="2" 
      fill="none"
      filter="url(#trophyGlow)"
    />
    
    {/* Base */}
    <path d="M12 17v2m-4 2h8c.55 0 1-.45 1-1h-10c0 .55.45 1 1 1z" 
      stroke="url(#trophyGrad)" 
      strokeWidth="2" 
      fill="url(#trophyGrad)"
      fillOpacity="0.3"
      filter="url(#trophyGlow)"
    />
    
    {/* Star decoration */}
    <path d="M12 8l.5 1.5h1.5l-1.2 1 .5 1.5-1.3-1-1.3 1 .5-1.5-1.2-1h1.5z" 
      fill="#FBBF24"
      filter="url(#trophyGlow)"
    />
  </svg>
);

export const WalletGameIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="walletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#06B6D4', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="walletGlow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Wallet Body */}
    <rect x="2" y="6" width="20" height="14" rx="2" 
      stroke="url(#walletGrad)" 
      strokeWidth="2" 
      fill="url(#walletGrad)" 
      fillOpacity="0.2"
      filter="url(#walletGlow)"
    />
    
    {/* Card Slot */}
    <rect x="16" y="10" width="4" height="6" rx="1" 
      fill="url(#walletGrad)"
      filter="url(#walletGlow)"
    />
    
    {/* Dollar Sign */}
    <path d="M10 9v1m0 4v1m0-5a2 2 0 011.5 3.5m-1.5.5a2 2 0 01-1.5-3.5" 
      stroke="#FBBF24" 
      strokeWidth="2" 
      strokeLinecap="round"
      filter="url(#walletGlow)"
    />
    
    {/* Shine Effect */}
    <path d="M5 8l2 2m1-3l1 1" 
      stroke="white" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const ProfileGameIcon = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#A855F7', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="profileGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Outer Ring */}
    <circle cx="20" cy="20" r="18" 
      stroke="url(#profileGrad)" 
      strokeWidth="2" 
      fill="none"
      filter="url(#profileGlow)"
    />
    
    {/* Inner Circle Background */}
    <circle cx="20" cy="20" r="16" 
      fill="url(#profileGrad)" 
      fillOpacity="0.1"
    />
    
    {/* Head */}
    <circle cx="20" cy="15" r="5" 
      fill="url(#profileGrad)"
      filter="url(#profileGlow)"
    />
    
    {/* Body */}
    <path d="M10 32c0-5.5 4.5-10 10-10s10 4.5 10 10" 
      stroke="url(#profileGrad)" 
      strokeWidth="3"
      strokeLinecap="round"
      filter="url(#profileGlow)"
    />
    
    {/* Crown decoration */}
    <path d="M14 10l2 2 4-3 4 3 2-2v3h-12z" 
      fill="#FBBF24"
      opacity="0.8"
      filter="url(#profileGlow)"
    />
  </svg>
);
