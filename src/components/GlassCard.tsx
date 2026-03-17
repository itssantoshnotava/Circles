import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, id }) => {
  return (
    <div 
      id={id}
      className={cn(
        "glass p-6 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};
