import uploadConfigData from "@/services/mockData/uploadConfig.json";

class UploadService {
  async getUploadConfig() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return uploadConfigData
  }

  async uploadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0
      const fileSize = file.size
      const uploadSpeed = 1024 * 1024 * 2 // 2MB/s simulated speed
      const totalTime = (fileSize / uploadSpeed) * 1000 // Total time in milliseconds
      const intervalTime = 100 // Update every 100ms
      const progressIncrement = (intervalTime / totalTime) * 100

      const interval = setInterval(() => {
        progress = Math.min(100, progress + progressIncrement + Math.random() * 2)
        
        if (onProgress) {
          onProgress(Math.round(progress), uploadSpeed)
        }

        if (progress >= 100) {
          clearInterval(interval)
          
          // Simulate final processing delay
          setTimeout(() => {
            // Simulate random upload failure (5% chance)
            if (Math.random() < 0.05) {
              reject(new Error("Network error during upload"))
              return
            }

            // Generate mock share link
            const shareLink = `https://dropzone.app/share/${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
            
            resolve({
              id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
              shareLink,
              downloadUrl: shareLink + "/download",
              fileName: file.name,
              fileSize: file.size,
              uploadedAt: new Date().toISOString()
            })
          }, 500)
        }
      }, intervalTime)
    })
  }

  async getFileInfo(fileId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      id: fileId,
      name: "example-file.pdf",
      size: 1024000,
      type: "application/pdf",
      uploadedAt: new Date().toISOString(),
      downloads: 0,
      shareLink: `https://dropzone.app/share/${fileId}`
    }
  }

async deleteFile(fileId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Remove from history if it exists
    if (this.uploadHistory) {
      this.uploadHistory = this.uploadHistory.filter(file => file.id !== fileId)
      this.saveHistoryToStorage()
    }
    
    return { success: true }
  }

  generateShareLink(fileId) {
    return `https://dropzone.app/share/${fileId}`
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  isAllowedFileType(file, allowedTypes) {
    if (!allowedTypes || allowedTypes.length === 0) return true
    
    return allowedTypes.some(type => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.startsWith(type.replace("*", ""))
    })
  }
}

  // Upload history storage and management
  constructor() {
    this.uploadHistory = this.loadHistoryFromStorage()
  }

  loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('uploadHistory')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load upload history:', error)
      return []
    }
  }

  saveHistoryToStorage() {
    try {
      localStorage.setItem('uploadHistory', JSON.stringify(this.uploadHistory))
    } catch (error) {
      console.error('Failed to save upload history:', error)
    }
  }

  addToHistory(fileData) {
    const historyEntry = {
      id: fileData.id,
      name: fileData.fileName,
      size: fileData.fileSize,
      type: fileData.type || 'application/octet-stream',
      uploadedAt: fileData.uploadedAt,
      shareLink: fileData.shareLink,
      downloadUrl: fileData.downloadUrl,
      downloads: 0
    }

    // Add to beginning of array (most recent first)
    this.uploadHistory.unshift(historyEntry)
    
    // Keep only last 100 files
    this.uploadHistory = this.uploadHistory.slice(0, 100)
    
    this.saveHistoryToStorage()
  }

  async getUploadHistory() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Group files by upload date
    const groupedHistory = this.uploadHistory.reduce((groups, file) => {
      const uploadDate = new Date(file.uploadedAt)
      const dateKey = uploadDate.toISOString().split('T')[0] // YYYY-MM-DD format
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          files: []
        }
      }
      
      groups[dateKey].files.push(file)
      return groups
    }, {})

    // Convert to array and sort by date (most recent first)
    const sections = Object.values(groupedHistory).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    )

    return sections
  }
}