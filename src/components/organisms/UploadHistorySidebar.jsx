import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { formatDistanceToNow, format, isToday, isYesterday, startOfDay, isSameDay } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import FileTypeIcon from "@/components/molecules/FileTypeIcon"
import { Card, CardContent } from "@/components/atoms/Card"
import { cn } from "@/utils/cn"
import uploadService from "@/services/api/uploadService"

const UploadHistorySidebar = ({ isOpen, onToggle, onFileSelect }) => {
  const [uploadHistory, setUploadHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedSections, setExpandedSections] = useState(new Set())
  const [expandedFiles, setExpandedFiles] = useState(new Set())

  useEffect(() => {
    if (isOpen) {
      loadUploadHistory()
    }
  }, [isOpen])

  const loadUploadHistory = async () => {
    try {
      setLoading(true)
      const history = await uploadService.getUploadHistory()
      setUploadHistory(history)
      
      // Auto-expand today's section
      if (history.length > 0) {
        const todaySection = history.find(section => isToday(new Date(section.date)))
        if (todaySection) {
          setExpandedSections(new Set([todaySection.date]))
        }
      }
    } catch (error) {
      console.error("Failed to load upload history:", error)
      toast.error("Failed to load upload history")
    } finally {
      setLoading(false)
    }
  }

  const formatSectionDate = (dateStr) => {
    const date = new Date(dateStr)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday" 
    return format(date, "MMMM d, yyyy")
  }

  const formatFileTime = (uploadedAt) => {
    return format(new Date(uploadedAt), "h:mm a")
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const toggleSection = (date) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(date)) {
        newSet.delete(date)
      } else {
        newSet.add(date)
      }
      return newSet
    })
  }

  const toggleFileDetails = (fileId) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const handleCopyLink = async (shareLink) => {
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success("Share link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await uploadService.deleteFile(fileId)
      toast.success("File deleted successfully")
      loadUploadHistory() // Refresh the list
    } catch (error) {
      toast.error("Failed to delete file")
    }
  }

  const getTotalFilesCount = () => {
    return uploadHistory.reduce((total, section) => total + section.files.length, 0)
  }

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen ? 0 : "100%"
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 lg:relative lg:translate-x-0 lg:shadow-none lg:border-l-0 lg:border-r"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <ApperIcon name="History" size={20} className="text-primary" />
              <h2 className="font-semibold text-gray-900 font-display">Upload History</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <ApperIcon name="X" size={16} />
            </Button>
          </div>

          {/* Stats */}
          <div className="p-4 bg-surface/50 border-b border-gray-100">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{getTotalFilesCount()}</span> files uploaded
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : uploadHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                <ApperIcon name="Upload" size={24} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No uploads yet</p>
              </div>
            ) : (
              <div className="space-y-1">
                {uploadHistory.map((section) => (
                  <div key={section.date} className="border-b border-gray-100 last:border-b-0">
                    {/* Date Section Header */}
                    <button
                      onClick={() => toggleSection(section.date)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatSectionDate(section.date)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {section.files.length}
                        </Badge>
                      </div>
                      <ApperIcon 
                        name="ChevronDown" 
                        size={16} 
                        className={cn(
                          "text-gray-500 transition-transform",
                          expandedSections.has(section.date) && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Files List */}
                    <AnimatePresence initial={false}>
                      {expandedSections.has(section.date) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 pb-2">
                            {section.files.map((file) => (
                              <div key={file.id} className="mx-2">
                                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                  {/* File Icon */}
                                  <div className="flex-shrink-0">
                                    <FileTypeIcon fileType={file.type} size={16} />
                                  </div>

                                  {/* File Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-900 truncate">
                                      {file.name}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span>{formatFileTime(file.uploadedAt)}</span>
                                      <span>•</span>
                                      <span>{formatFileSize(file.size)}</span>
                                    </div>
                                  </div>

                                  {/* Toggle Details */}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleFileDetails(file.id)}
                                    className="flex-shrink-0 h-6 w-6"
                                  >
                                    <ApperIcon 
                                      name="MoreVertical" 
                                      size={12}
                                      className="text-gray-400"
                                    />
                                  </Button>
                                </div>

                                {/* Expanded File Details */}
                                <AnimatePresence initial={false}>
                                  {expandedFiles.has(file.id) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="ml-6 mr-2 p-3 bg-gray-50 rounded-lg space-y-2">
                                        {/* File Details */}
                                        <div className="space-y-1">
                                          <div className="text-xs text-gray-500">
                                            <span className="font-medium">Type:</span> {file.type}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            <span className="font-medium">Uploaded:</span> {formatDistanceToNow(new Date(file.uploadedAt))} ago
                                          </div>
                                          {file.downloads > 0 && (
                                            <div className="text-xs text-gray-500">
                                              <span className="font-medium">Downloads:</span> {file.downloads}
                                            </div>
                                          )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-1 pt-1">
                                          <Button
                                            variant="ghost"
                                            size="small"
                                            onClick={() => onFileSelect?.(file)}
                                            className="text-xs h-6 px-2"
                                          >
                                            <ApperIcon name="Eye" size={12} className="mr-1" />
                                            View
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="small"
                                            onClick={() => handleCopyLink(file.shareLink)}
                                            className="text-xs h-6 px-2"
                                          >
                                            <ApperIcon name="Copy" size={12} className="mr-1" />
                                            Copy
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="small"
                                            onClick={() => handleDeleteFile(file.id)}
                                            className="text-xs h-6 px-2 text-error hover:text-error"
                                          >
                                            <ApperIcon name="Trash2" size={12} className="mr-1" />
                                            Delete
                                          </Button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="small"
              onClick={loadUploadHistory}
              disabled={loading}
              className="w-full justify-center"
            >
              <ApperIcon name="RefreshCw" size={14} className="mr-2" />
              Refresh History
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Toggle Button - Always visible */}
      <Button
        variant="primary"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 right-4 z-30 shadow-lg lg:hidden"
      >
        <ApperIcon name={isOpen ? "X" : "History"} size={16} />
      </Button>
    </>
  )
}

export default UploadHistorySidebar