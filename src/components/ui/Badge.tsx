import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default', style }) => {
  const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variants = {
    default: '',
    outline: 'border border-current bg-transparent',
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`} style={style}>
      {children}
    </span>
  );
};

export default Badge;
