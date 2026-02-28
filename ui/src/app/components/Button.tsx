import { Link } from "react-router";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outlined" | "text" | "danger";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  to?: string;
  type?: "button" | "submit";
  className?: string;
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  onClick, 
  disabled, 
  fullWidth,
  to,
  type = "button",
  className = ""
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-optivault-emerald text-white hover:bg-optivault-emerald/80 active:scale-[0.98]",
    secondary: "bg-surface text-primary hover:bg-surface-alt active:scale-[0.98] border border-optivault",
    outlined: "border-2 border-optivault-emerald text-optivault-emerald bg-transparent hover:bg-optivault-emerald-dim active:scale-[0.98]",
    text: "text-optivault-emerald hover:underline",
    danger: "bg-[#EF4444] text-white hover:bg-[#EF4444]/80 active:scale-[0.98]"
  };
  
  const sizes = {
    sm: "h-9 px-4 text-sm rounded-lg",
    md: "h-12 px-6 text-base rounded-xl",
    lg: "h-14 px-8 text-base rounded-xl"
  };
  
  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
  
  if (to && !disabled) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }
  
  return (
    <button 
      type={type}
      className={classes} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
}