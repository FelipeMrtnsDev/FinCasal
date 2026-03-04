"use client"

import React from "react"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface AuthHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  iconRotate?: number
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export function AuthHeader({ icon: Icon, title, subtitle, iconRotate = 5 }: AuthHeaderProps) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
      <motion.div
        whileHover={{ scale: 1.05, rotate: iconRotate }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/25"
      >
        <Icon className="w-8 h-8 text-primary-foreground" />
      </motion.div>
      <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
    </motion.div>
  )
}
