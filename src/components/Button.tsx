import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  id,
  ...props 
}) => {
  const variants = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20',
    secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
    ghost: 'bg-transparent text-white hover:bg-white/5',
    outline: 'bg-transparent border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg font-semibold'
  };

  return (
    <motion.button
      id={id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
