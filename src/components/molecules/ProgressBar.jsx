import React from "react"
import { cn } from "@/utils/cn"

const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true, 
  className,
  size = "medium",
  variant = "primary"
}) => {
  const sizeClasses = {
    small: "h-1.5",
    medium: "h-2.5",
    large: "h-4"
  }

  const variants = {
    primary: "bg-gradient-progress",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error"
  }

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("progress-bar", sizeClasses[size])}>
        <div
          className={cn("progress-fill", variants[variant])}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-600">
          <span>{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  )
}

export default ProgressBar