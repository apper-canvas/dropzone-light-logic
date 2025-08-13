import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { cn } from "@/utils/cn"

const DropZone = ({ onFilesSelected, uploadConfig, isUploading }) => {
  const [dragActive, setDragActive] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const validateFiles = (files) => {
    const validFiles = []
    const errors = []

    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > uploadConfig.maxFileSize) {
        errors.push(`${file.name} is too large. Maximum size is ${formatFileSize(uploadConfig.maxFileSize)}.`)
        return
      }

      // Check file type
      if (uploadConfig.allowedTypes.length > 0) {
        const isAllowed = uploadConfig.allowedTypes.some(type => {
          if (type.startsWith(".")) {
            return file.name.toLowerCase().endsWith(type.toLowerCase())
          }
          return file.type.startsWith(type)
        })

        if (!isAllowed) {
          errors.push(`${file.name} is not an allowed file type.`)
          return
        }
      }

      validFiles.push(file)
    })

    return { validFiles, errors }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
      setDragOver(true)
    }
  }, [])

  const handleDragOut = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragActive(false)
    setDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const { validFiles, errors } = validateFiles(e.dataTransfer.files)
      
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error))
      }
      
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
      
      e.dataTransfer.clearData()
    }
  }, [onFilesSelected, uploadConfig])

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const { validFiles, errors } = validateFiles(e.target.files)
      
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error))
      }
      
      if (validFiles.length > 0) {
        onFilesSelected(validFiles)
      }
      
      e.target.value = ""
    }
  }

  return (
    <motion.div
      className={cn(
        "relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center transition-all duration-200 cursor-pointer group",
        dragActive && "drag-active",
        dragOver && "drag-over",
        isUploading && "cursor-not-allowed opacity-75"
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      whileHover={!isUploading ? { scale: 1.01 } : {}}
      whileTap={!isUploading ? { scale: 0.99 } : {}}
    >
      <input
        type="file"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={isUploading}
        accept={uploadConfig.allowedTypes.length > 0 ? uploadConfig.allowedTypes.join(",") : undefined}
      />
      
      <div className="space-y-6">
        <motion.div
          className="flex justify-center"
          animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200",
            dragActive 
              ? "bg-gradient-primary text-white shadow-lg" 
              : "bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:from-primary/20 group-hover:to-accent/20"
          )}>
            <ApperIcon 
              name={dragActive ? "Upload" : "CloudUpload"} 
              size={32}
              className={dragActive ? "animate-bounce" : ""}
            />
          </div>
        </motion.div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 font-display">
            {dragActive ? "Drop files here!" : "Drop files to upload"}
          </h3>
          <p className="text-gray-600">
            {dragActive ? "Release to start uploading" : "or click to browse"}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="large"
            className="mx-auto"
            disabled={isUploading}
          >
            <ApperIcon name="FolderOpen" size={16} className="mr-2" />
            Choose Files
          </Button>

          <div className="text-sm text-gray-500 space-y-1">
            <p>
              Maximum file size: {formatFileSize(uploadConfig.maxFileSize)}
            </p>
            {uploadConfig.allowedTypes.length > 0 && (
              <p>
                Allowed types: {uploadConfig.allowedTypes.join(", ")}
              </p>
            )}
            <p>
              Maximum {uploadConfig.maxFiles} files at once
            </p>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-700">
              Processing files...
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default DropZone