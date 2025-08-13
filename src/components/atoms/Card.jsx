import React from "react"
import { cn } from "@/utils/cn"

const Card = React.forwardRef(({ className, children, hover = true, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-lg border border-gray-200 shadow-sm",
        hover && "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = "Card"

const CardContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("p-6", className)} {...props}>
      {children}
    </div>
  )
})

CardContent.displayName = "CardContent"

export { Card, CardContent }