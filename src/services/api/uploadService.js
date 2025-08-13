import uploadConfigData from "@/services/mockData/uploadConfig.json"

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

export default new UploadService()