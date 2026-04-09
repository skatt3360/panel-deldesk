import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
  dot?: boolean;
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  dot = false,
  style,
}) => {
  const base =
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide';
  const variants = {
    default: '',
    outline: 'border border-current bg-transparent',
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`} style={style}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />}
      {children}
    </span>
  );
};

export default Badge;
