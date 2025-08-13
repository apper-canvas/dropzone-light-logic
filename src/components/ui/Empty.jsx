import React from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { Card, CardContent } from "@/components/atoms/Card"

const Empty = ({ 
  icon = "FolderOpen",
  title = "No files uploaded yet", 
  message = "Drag and drop files or click browse to get started.", 
  actionLabel = "Browse Files",
  onAction
}) => {
  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50">
      <CardContent className="text-center py-16">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
            <ApperIcon name={icon} size={40} className="text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 font-display">
              {title}
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              {message}
            </p>
          </div>
          
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant="primary"
              size="large"
              className="inline-flex items-center space-x-2"
            >
              <ApperIcon name="Upload" size={16} />
              <span>{actionLabel}</span>
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}

export default Empty