import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-all duration-200 transform active:scale-95 shadow-sm hover:shadow flex items-center justify-center";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500",
    secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600",
    danger: "bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
