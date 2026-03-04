"use client"

import React from "react"
import { motion } from "framer-motion"

export function AuthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.03, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary"
      />
    </div>
  )
}
