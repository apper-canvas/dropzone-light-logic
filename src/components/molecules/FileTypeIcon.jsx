import React from "react"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const FileTypeIcon = ({ fileType, className, size = 20 }) => {
  const getIconName = (type) => {
    if (!type) return "File"
    
    const lowerType = type.toLowerCase()
    
    if (lowerType.includes("image")) return "Image"
    if (lowerType.includes("video")) return "Video"
    if (lowerType.includes("audio")) return "Music"
    if (lowerType.includes("pdf")) return "FileText"
    if (lowerType.includes("word") || lowerType.includes("doc")) return "FileText"
    if (lowerType.includes("excel") || lowerType.includes("sheet")) return "FileSpreadsheet"
    if (lowerType.includes("powerpoint") || lowerType.includes("presentation")) return "Presentation"
    if (lowerType.includes("zip") || lowerType.includes("rar") || lowerType.includes("archive")) return "Archive"
    if (lowerType.includes("text") || lowerType.includes("txt")) return "FileText"
    if (lowerType.includes("code") || lowerType.includes("javascript") || lowerType.includes("html") || lowerType.includes("css")) return "Code"
    
    return "File"
  }

  const getIconColor = (type) => {
    if (!type) return "text-gray-500"
    
    const lowerType = type.toLowerCase()
    
    if (lowerType.includes("image")) return "text-green-500"
    if (lowerType.includes("video")) return "text-red-500"
    if (lowerType.includes("audio")) return "text-purple-500"
    if (lowerType.includes("pdf")) return "text-red-600"
    if (lowerType.includes("word") || lowerType.includes("doc")) return "text-blue-600"
    if (lowerType.includes("excel") || lowerType.includes("sheet")) return "text-green-600"
    if (lowerType.includes("powerpoint") || lowerType.includes("presentation")) return "text-orange-500"
    if (lowerType.includes("zip") || lowerType.includes("archive")) return "text-yellow-600"
    if (lowerType.includes("code")) return "text-indigo-500"
    
    return "text-gray-500"
  }

  return (
    <ApperIcon 
      name={getIconName(fileType)} 
      size={size}
      className={cn(getIconColor(fileType), className)}
    />
  )
}

export default FileTypeIcon