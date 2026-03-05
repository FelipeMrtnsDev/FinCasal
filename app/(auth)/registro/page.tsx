"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserPlus } from "lucide-react"
import { AuthBackground } from "@/components/auth/AuthBackground"
import { AuthHeader } from "@/components/auth/AuthHeader"
import { GoogleButton } from "@/components/auth/GoogleButton"
import { RegisterForm } from "@/components/register/RegisterForm"
import { authService } from "@/services/authService"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export default function RegistroPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <AuthBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md relative z-10"
      >
        <AuthHeader
          icon={UserPlus}
          title="Criar Conta"
          subtitle="Comece a organizar as finanças do casal"
          iconRotate={-5}
        />

        <motion.div variants={itemVariants}>
          <Card className="shadow-xl shadow-primary/5 border-border/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Registro</CardTitle>
              <CardDescription>Crie sua conta para começar</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <GoogleButton
                text="Registrar com Google"
              />

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">ou</span>
                </div>
              </div>

              <RegisterForm />

              <p className="text-center text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link
                  href="/login"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Entrar
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
