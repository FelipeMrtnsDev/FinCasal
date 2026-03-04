"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { AuthBackground } from "@/components/auth/AuthBackground"
import { AuthHeader } from "@/components/auth/AuthHeader"
import { GoogleButton } from "@/components/auth/GoogleButton"
import { LoginForm } from "@/components/login/LoginForm"
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

export default function LoginPage() {
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)

    try {
      // Simulação do Google Login
      // Em produção, isso redirecionaria para o Google ou usaria a SDK
      // const googleIdToken = await getGoogleToken(); 
      // await authService.googleLogin(googleIdToken);
      setTimeout(() => {
        setGoogleLoading(false)
        window.location.href = "/"
      }, 1500)
    } catch (error) {
      console.error(error)
      setGoogleLoading(false)
    }
  }

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
          icon={Wallet}
          title="FinCasal"
          subtitle="Finanças do casal em um só lugar"
          iconRotate={5}
        />

        <motion.div variants={itemVariants}>
          <Card className="shadow-xl shadow-primary/5 border-border/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Entrar</CardTitle>
              <CardDescription>Acesse sua conta para gerenciar suas finanças</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <GoogleButton
                onClick={handleGoogleLogin}
                loading={googleLoading}
                text="Continuar com Google"
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

              <LoginForm />

              <p className="text-center text-sm text-muted-foreground">
                Não tem conta?{" "}
                <Link
                  href="/registro"
                  className="text-primary font-medium hover:underline underline-offset-4"
                >
                  Criar conta
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
