import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "px-6 py-2.5 rounded-[8px] font-bold text-[14px] transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 border-none outline-none";
  
  const variants = {
    primary: "bg-[#6366F1] hover:bg-[#818CF8] text-white shadow-lg shadow-[#6366F1]/20",
    secondary: "bg-[#1A1D27] hover:bg-[#252840] text-slate-300 border border-[#2A2D3E] shadow-sm",
    danger: "bg-[#EF4444]/10 hover:bg-[#EF4444] text-[#EF4444] hover:text-white border border-[#EF4444]/20 shadow-sm"
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
