import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = true }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-surface-border shadow-card ${
        padding ? 'p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}
const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}
const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-base font-bold text-ink ${className}`}>{children}</h3>
);

export { Card, CardHeader, CardTitle };
export default Card;
