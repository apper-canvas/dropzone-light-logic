import React from "react"
import { cn } from "@/utils/cn"

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "medium", 
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-gradient-primary text-white hover:shadow-lg hover:scale-[1.02] focus:ring-primary/50",
    secondary: "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-lg focus:ring-primary/50",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 focus:ring-primary/50",
    ghost: "text-gray-600 hover:text-primary hover:bg-primary/5 focus:ring-primary/50",
    success: "bg-success text-white hover:bg-success/90 hover:shadow-lg focus:ring-success/50",
    error: "bg-error text-white hover:bg-error/90 hover:shadow-lg focus:ring-error/50"
  }
  
  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
    icon: "p-2"
  }
  
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button