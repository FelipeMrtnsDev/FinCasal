"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

export function ConviteSuccessView() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <CheckCircle2 className="w-10 h-10 text-primary" />
      </motion.div>
      <h2 className="text-2xl font-bold text-foreground">Bem-vindo ao FinCasal!</h2>
      <p className="text-muted-foreground text-sm">Redirecionando para o dashboard...</p>
    </motion.div>
  )
}

