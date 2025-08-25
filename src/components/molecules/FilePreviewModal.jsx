import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { cn } from "@/utils/cn"

const FilePreviewModal = ({ isOpen, onClose, files, currentFileIndex, onNavigate }) => {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileContent, setFileContent] = useState(null)

  const currentFile = files[currentFileIndex]

  const resetZoom = () => setZoomLevel(1)

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.25))

  const goToPrevious = useCallback(() => {
    if (currentFileIndex > 0) {
      onNavigate(currentFileIndex - 1)
      resetZoom()
    }
  }, [currentFileIndex, onNavigate])

  const goToNext = useCallback(() => {
    if (currentFileIndex < files.length - 1) {
      onNavigate(currentFileIndex + 1)
      resetZoom()
    }
  }, [currentFileIndex, files.length, onNavigate])

  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        e.preventDefault()
        goToPrevious()
        break
      case 'ArrowRight':
        e.preventDefault()
        goToNext()
        break
      case '+':
      case '=':
        e.preventDefault()
        zoomIn()
        break
      case '-':
        e.preventDefault()
        zoomOut()
        break
      case '0':
        e.preventDefault()
        resetZoom()
        break
    }
  }, [isOpen, onClose, goToPrevious, goToNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (!currentFile || !isOpen) return

    const loadFileContent = async () => {
      setLoading(true)
      setError(null)
      setFileContent(null)

      try {
        if (currentFile.type.startsWith('text/')) {
          // For text files, we'd need the actual file content
          // Since we don't have it, we'll show a placeholder
          setFileContent("Text file preview requires server-side content loading.")
        }
        // For images and PDFs, we'll use the shareLink or thumbnailUrl
        setFileContent(currentFile.shareLink || currentFile.thumbnailUrl)
      } catch (err) {
        setError("Failed to load file preview")
        toast.error("Failed to load file preview")
      } finally {
        setLoading(false)
      }
    }

    loadFileContent()
    resetZoom()
  }, [currentFile, isOpen])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const getFilePreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-600">Loading preview...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto" />
            <p className="text-error font-medium">Failed to load preview</p>
            <Button variant="outline" size="small" onClick={() => window.open(currentFile.shareLink, '_blank')}>
              <ApperIcon name="ExternalLink" size={16} className="mr-2" />
              Open File
            </Button>
          </div>
        </div>
      )
    }

    if (currentFile.type.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center min-h-96 overflow-auto">
          <motion.img
            src={fileContent || currentFile.thumbnailUrl}
            alt={currentFile.name}
            className="max-w-none cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `scale(${zoomLevel})` }}
            transition={{ duration: 0.2 }}
            onError={() => setError("Failed to load image")}
            draggable={false}
          />
        </div>
      )
    }

    if (currentFile.type === 'application/pdf') {
      return (
        <div className="h-96">
          <iframe
            src={fileContent}
            className="w-full h-full border-0 rounded"
            title={`PDF Preview: ${currentFile.name}`}
          />
        </div>
      )
    }

    if (currentFile.type.startsWith('text/')) {
      return (
        <div className="h-96 overflow-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap p-4 bg-gray-50 rounded">
            {fileContent}
          </pre>
        </div>
      )
    }

    // Fallback for unsupported file types
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <ApperIcon name="File" size={48} className="text-gray-400 mx-auto" />
          <div>
            <p className="text-gray-600 font-medium mb-2">Preview not available</p>
            <p className="text-sm text-gray-500 mb-4">This file type cannot be previewed in the browser</p>
            <Button variant="primary" onClick={() => window.open(currentFile.shareLink, '_blank')}>
              <ApperIcon name="Download" size={16} className="mr-2" />
              Download File
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentFile) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 font-display truncate">
                  {currentFile.name}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {files.length > 1 ? `${currentFileIndex + 1} of ${files.length}` : '1 of 1'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Zoom Controls (only for images) */}
                {currentFile.type.startsWith('image/') && (
                  <>
                    <Button variant="ghost" size="icon" onClick={zoomOut} disabled={zoomLevel <= 0.25}>
                      <ApperIcon name="ZoomOut" size={16} />
                    </Button>
                    <span className="text-sm text-gray-600 w-12 text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button variant="ghost" size="icon" onClick={zoomIn} disabled={zoomLevel >= 3}>
                      <ApperIcon name="ZoomIn" size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={resetZoom}>
                      <ApperIcon name="RotateCcw" size={16} />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                  </>
                )}

                {/* Navigation Controls */}
                {files.length > 1 && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={goToPrevious}
                      disabled={currentFileIndex === 0}
                    >
                      <ApperIcon name="ChevronLeft" size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={goToNext}
                      disabled={currentFileIndex === files.length - 1}
                    >
                      <ApperIcon name="ChevronRight" size={16} />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                  </>
                )}

                <Button variant="ghost" size="icon" onClick={onClose}>
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="preview-container">
              {getFilePreview()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {Math.round(currentFile.size / 1024)} KB • {currentFile.type || 'Unknown type'}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => window.open(currentFile.shareLink, '_blank')}
                >
                  <ApperIcon name="ExternalLink" size={16} className="mr-2" />
                  Open
                </Button>
                <Button variant="outline" size="small" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FilePreviewModal