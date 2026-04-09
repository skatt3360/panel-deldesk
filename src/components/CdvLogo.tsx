import React from 'react';

interface CdvLogoProps {
  size?: number;
  /** 'white' for dark backgrounds, 'dark' for light backgrounds */
  variant?: 'white' | 'dark';
  className?: string;
}

const CDV_PATH =
  'M712.251 326.659V386.628L509.445 505.891L509.106 417.45L612.875 359.873V353.112L509.333 295.476L509.445 206.174L712.251 326.659ZM910.086 488.999H853.224L712.95 223.161L798.877 223.072L879.092 381.154L884.218 381.153L964.434 223.07L1050.36 223.159L910.086 488.999ZM206.678 386.807V326.838L409.483 206.348L409.596 295.656L306.053 353.291V360.052L409.822 417.63L409.483 506.07L206.678 386.807Z';

// Aspect ratio of the CDV symbol: 1256 × 713
const CdvLogo: React.FC<CdvLogoProps> = ({ size = 40, variant = 'white', className = '' }) => {
  const fill = variant === 'white' ? '#FFFFFF' : '#1E252D';
  const w = Math.round(size * (1256 / 713));

  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 1256 713"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Collegium Da Vinci"
    >
      <path fillRule="evenodd" clipRule="evenodd" d={CDV_PATH} fill={fill} />
    </svg>
  );
};

export default CdvLogo;
