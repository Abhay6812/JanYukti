import React from 'react';

interface JanYuktiLogoProps {
  className?: string;
}

/**
 * Bespoke JanYukti geometric brand emblem:
 * Civic shield container (Zero-PII public trust) + dual rising crop sprout (farmer growth)
 * + warm harvest sun spark (Yukti / smart guidance).
 */
export const JanYuktiLogo: React.FC<JanYuktiLogoProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Civic Shield Base */}
      <rect width="40" height="40" rx="11" fill="#15613E" />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9.5"
        stroke="white"
        strokeOpacity="0.16"
        strokeWidth="1"
      />

      {/* Harvest Sun / Yukti Insight Spark */}
      <circle cx="20" cy="11" r="3.2" fill="#FBBF24" />

      {/* Central Stem */}
      <path
        d="M20 30V17.5"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
      />

      {/* Left Rising Crop Leaf */}
      <path
        d="M20 24.5C15.2 24.5 11.5 21 11.5 16.2C16.2 16.2 20 19.6 20 24.5Z"
        fill="#FFFFFF"
      />

      {/* Right Rising Crop Leaf */}
      <path
        d="M20 22.5C24.8 22.5 28.5 19 28.5 14.2C23.8 14.2 20 17.6 20 22.5Z"
        fill="#D1FAE5"
      />

      {/* Furrowed Soil / Field Horizon Arc */}
      <path
        d="M11 30.5C13.8 28.8 16.8 28 20 28C23.2 28 26.2 28.8 29 30.5"
        stroke="#FBBF24"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
};
