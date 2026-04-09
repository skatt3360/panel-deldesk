import React from 'react';

interface CdvLogoProps {
  className?: string;
  size?: number;
}

// CDV Collegium Da Vinci – stylized wordmark SVG
const CdvLogo: React.FC<CdvLogoProps> = ({ className = '', size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer ring */}
    <circle cx="60" cy="60" r="56" stroke="#FFB81C" strokeWidth="4" />
    {/* Inner decorative ring */}
    <circle cx="60" cy="60" r="46" stroke="#FFB81C" strokeWidth="1.5" strokeOpacity="0.4" />

    {/* "C" arc shape — left side */}
    <path
      d="M38 42 C28 50 28 70 38 78"
      stroke="#FFB81C"
      strokeWidth="7"
      strokeLinecap="round"
      fill="none"
    />

    {/* "D" shape — center */}
    <path
      d="M50 40 L50 80 C50 80 72 80 76 60 C80 40 60 40 50 40Z"
      fill="#FFB81C"
      opacity="0.15"
    />
    <path
      d="M50 40 L50 80"
      stroke="#FFB81C"
      strokeWidth="7"
      strokeLinecap="round"
    />
    <path
      d="M50 40 C60 40 76 44 76 60 C76 76 60 80 50 80"
      stroke="#FFB81C"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />

    {/* "V" shape — right */}
    <path
      d="M83 40 L73 80 L63 40"
      stroke="#FFB81C"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export default CdvLogo;
