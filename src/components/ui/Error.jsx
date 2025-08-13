import React from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { Card, CardContent } from "@/components/atoms/Card"

const Error = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while processing your request.", 
  onRetry,
  showRetry = true 
}) => {
  return (
    <Card className="border-error/20 bg-error/5">
      <CardContent className="text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 mx-auto mb-4 text-error"
        >
          <ApperIcon name="AlertCircle" size={64} />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {message}
        </p>
        
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            className="inline-flex items-center space-x-2"
          >
            <ApperIcon name="RotateCcw" size={16} />
            <span>Try Again</span>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default Error