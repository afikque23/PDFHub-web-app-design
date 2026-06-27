import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
}

export const buttonVariants = ({ variant = "primary", size = "md", className }: { variant?: "primary" | "secondary" | "outline" | "ghost", size?: "default" | "sm" | "md" | "lg" | "icon", className?: string } = {}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-[var(--radius-btn)] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
    secondary: "bg-primary-light text-primary hover:bg-[#ffebeb]",
    outline: "border border-border bg-transparent hover:bg-gray-50 text-text-primary",
    ghost: "bg-transparent hover:bg-gray-100 text-text-secondary hover:text-text-primary",
  };

  const sizes: any = {
    default: "h-11 px-6 text-[16px]",
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-[16px]",
    lg: "h-14 px-8 text-lg",
    icon: "h-10 w-10",
  };

  return cn(baseStyles, variants[variant], sizes[size], className);
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
