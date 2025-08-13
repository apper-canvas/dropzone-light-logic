import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ProgressBar from "@/components/molecules/ProgressBar"
import FileTypeIcon from "@/components/molecules/FileTypeIcon"
import ShareLinkModal from "@/components/molecules/ShareLinkModal"
import { Card, CardContent } from "@/components/atoms/Card"
import { cn } from "@/utils/cn"

const FileList = ({ files, onRemoveFile, onRetryUpload }) => {
  const [shareModal, setShareModal] = React.useState({ isOpen: false, file: null })

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatUploadSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond || bytesPerSecond === 0) return ""
    return `${formatFileSize(bytesPerSecond)}/s`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "uploading":
        return <Badge variant="info">Uploading</Badge>
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "error":
        return <Badge variant="error">Failed</Badge>
      case "pending":
        return <Badge variant="default">Pending</Badge>
      default:
        return null
    }
  }

  const handleShare = (file) => {
    setShareModal({ isOpen: true, file })
  }

  const handleCopyLink = async (shareLink) => {
    try {
      await navigator.clipboard.writeText(shareLink)
      toast.success("Share link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  if (files.length === 0) {
    return null
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 font-display">
            Uploaded Files ({files.length})
          </h2>
          <Button
            variant="ghost"
            size="small"
            onClick={() => files.filter(f => f.status === "error").forEach(f => onRetryUpload(f))}
            className={files.some(f => f.status === "error") ? "" : "hidden"}
          >
            <ApperIcon name="RotateCcw" size={16} className="mr-1" />
            Retry Failed
          </Button>
        </div>

        <AnimatePresence mode="popLayout">
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <Card hover={false} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* File Thumbnail/Icon */}
                    <div className="flex-shrink-0">
                      {file.thumbnailUrl ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="file-thumbnail"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-surface border border-gray-200 flex items-center justify-center">
                          <FileTypeIcon fileType={file.type} size={20} />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </h3>
                        {getStatusBadge(file.status)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        {file.uploadSpeed && file.status === "uploading" && (
                          <span>{formatUploadSpeed(file.uploadSpeed)}</span>
                        )}
                        {file.type && (
                          <span className="truncate">{file.type}</span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {file.status === "uploading" && (
                        <div className="mt-2">
                          <ProgressBar 
                            progress={file.uploadProgress} 
                            size="small"
                            showPercentage={false}
                          />
                        </div>
                      )}

                      {/* Error Message */}
                      {file.status === "error" && file.errorMessage && (
                        <p className="mt-1 text-xs text-error">
                          {file.errorMessage}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {file.status === "completed" && file.shareLink && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyLink(file.shareLink)}
                            className="text-gray-500 hover:text-primary"
                            title="Copy share link"
                          >
                            <ApperIcon name="Copy" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShare(file)}
                            className="text-gray-500 hover:text-primary"
                            title="Share file"
                          >
                            <ApperIcon name="Share2" size={16} />
                          </Button>
                        </>
                      )}
                      
                      {file.status === "error" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRetryUpload(file)}
                          className="text-gray-500 hover:text-primary"
                          title="Retry upload"
                        >
                          <ApperIcon name="RotateCcw" size={16} />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveFile(file.id)}
                        className="text-gray-500 hover:text-error"
                        title="Remove file"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ShareLinkModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, file: null })}
        shareLink={shareModal.file?.shareLink || ""}
        fileName={shareModal.file?.name || ""}
      />
    </>
  )
}

export default FileList