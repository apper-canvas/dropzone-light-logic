import React from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import { Card, CardContent } from "@/components/atoms/Card"

const Loading = ({ message = "Loading files..." }) => {
  return (
    <div className="space-y-4">
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mx-auto mb-4 text-primary"
        >
          <ApperIcon name="Loader2" size={48} />
        </motion.div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>

      {/* File List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} hover={false}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-full" />
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Loading