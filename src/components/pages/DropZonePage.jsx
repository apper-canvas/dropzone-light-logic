import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import DropZone from "@/components/organisms/DropZone"
import FileList from "@/components/organisms/FileList"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import uploadService from "@/services/api/uploadService"

const DropZonePage = () => {
  const [files, setFiles] = useState([])
  const [uploadConfig, setUploadConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Load upload configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        const config = await uploadService.getUploadConfig()
        setUploadConfig(config)
      } catch (error) {
        console.error("Failed to load upload config:", error)
        setError("Failed to load upload configuration")
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const generateFileId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  const generateThumbnail = async (file) => {
    if (!file.type.startsWith("image/")) return null
    
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(file)
    })
  }

  const handleFilesSelected = async (selectedFiles) => {
    if (selectedFiles.length === 0) return

    // Check max files limit
    const totalFiles = files.length + selectedFiles.length
    if (totalFiles > uploadConfig.maxFiles) {
      toast.error(`Maximum ${uploadConfig.maxFiles} files allowed. You can upload ${uploadConfig.maxFiles - files.length} more files.`)
      return
    }

    setIsUploading(true)

    // Create file objects with metadata
    const newFiles = await Promise.all(
      Array.from(selectedFiles).map(async (file) => {
        const thumbnailUrl = await generateThumbnail(file)
        
        return {
          id: generateFileId(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 0,
          status: "pending",
          shareLink: "",
          thumbnailUrl,
          uploadSpeed: 0,
          errorMessage: "",
          file: file // Keep reference to original File object
        }
      })
    )

    // Add files to state
    setFiles(prevFiles => [...prevFiles, ...newFiles])

    // Start uploading each file
    newFiles.forEach(fileObj => {
      uploadFile(fileObj)
    })

    setIsUploading(false)
    toast.success(`${newFiles.length} file(s) added to upload queue`)
  }

  const uploadFile = async (fileObj) => {
    try {
      // Update status to uploading
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileObj.id ? { ...f, status: "uploading", uploadProgress: 0 } : f
        )
      )

      // Simulate upload progress
      const result = await uploadService.uploadFile(fileObj.file, (progress, speed) => {
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f.id === fileObj.id 
              ? { ...f, uploadProgress: progress, uploadSpeed: speed }
              : f
          )
        )
      })

      // Upload completed
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileObj.id 
            ? { 
                ...f, 
                status: "completed", 
                uploadProgress: 100,
                shareLink: result.shareLink,
                uploadSpeed: 0
              }
            : f
        )
      )

      toast.success(`${fileObj.name} uploaded successfully!`)

    } catch (error) {
      console.error("Upload failed:", error)
      
      setFiles(prevFiles => 
        prevFiles.map(f => 
          f.id === fileObj.id 
            ? { 
                ...f, 
                status: "error", 
                errorMessage: error.message || "Upload failed",
                uploadSpeed: 0
              }
            : f
        )
      )

      toast.error(`Failed to upload ${fileObj.name}`)
    }
  }

  const handleRemoveFile = (fileId) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId))
    toast.info("File removed")
  }

  const handleRetryUpload = (fileObj) => {
    uploadFile(fileObj)
    toast.info(`Retrying upload for ${fileObj.name}`)
  }

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    
    // Reload configuration
    const loadConfig = async () => {
      try {
        const config = await uploadService.getUploadConfig()
        setUploadConfig(config)
      } catch (error) {
        setError("Failed to load upload configuration")
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <Loading message="Initializing uploader..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <Error 
            title="Failed to Load"
            message={error}
            onRetry={handleRetry}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <ApperIcon name="CloudUpload" size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              DropZone
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload and share your files quickly with visual feedback. 
            Drag and drop multiple files or click to browse.
          </p>
        </motion.header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Drop Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DropZone
              onFilesSelected={handleFilesSelected}
              uploadConfig={uploadConfig}
              isUploading={isUploading}
            />
          </motion.div>

          {/* File List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {files.length > 0 ? (
              <FileList
                files={files}
                onRemoveFile={handleRemoveFile}
                onRetryUpload={handleRetryUpload}
              />
            ) : (
              <Empty
                icon="Upload"
                title="Ready to upload"
                message="Drag files to the drop zone above or click browse to select files from your device."
                actionLabel="Start Uploading"
                onAction={() => document.querySelector('input[type="file"]')?.click()}
              />
            )}
          </motion.div>

          {/* Stats Footer */}
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface rounded-lg p-4"
            >
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Total Files: {files.length}</span>
                  <span>Completed: {files.filter(f => f.status === "completed").length}</span>
                  <span>Uploading: {files.filter(f => f.status === "uploading").length}</span>
                  {files.filter(f => f.status === "error").length > 0 && (
                    <span className="text-error">
                      Failed: {files.filter(f => f.status === "error").length}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Max {uploadConfig.maxFiles} files • {Math.round(uploadConfig.maxFileSize / 1024 / 1024)}MB per file
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DropZonePage