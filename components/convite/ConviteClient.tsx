"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { AuthBackground } from "@/components/auth/AuthBackground"
import { inviteService } from "@/services/inviteService"
import api from "@/lib/api"
import { ConviteForm } from "./ConviteForm"
import { ConviteInvalidCard } from "./ConviteInvalidCard"
import { ConviteSuccessView } from "./ConviteSuccessView"
import { InviteData, InviteRegisterForm } from "./types"

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

type ConviteClientProps = {
  codigo: string
  inviteData: InviteData | null
  inviteErrorType?: "invalid" | "expired" | null
}

export function ConviteClient({ codigo, inviteData, inviteErrorType = null }: ConviteClientProps) {
  const resolvedInviteData: InviteData = inviteData || {
    code: codigo,
    email: "",
    inviterName: "Seu parceiro(a)",
    dashboardId: "",
  }
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState<InviteRegisterForm>({
    name: "",
    email: resolvedInviteData.email || "",
    password: "",
    confirmPassword: "",
  })

  const persistToken = (token: string) => {
    localStorage.setItem("token", token)
    document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=2592000; samesite=lax`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.password || !form.confirmPassword) {
      setError("Preencha todos os campos")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas nao coincidem")
      return
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }
    const emailValue = (form.email || resolvedInviteData.email || "").trim()
    if (!emailValue || !emailValue.includes("@")) {
      setError("Informe um e-mail valido")
      return
    }
    setError("")
    setSubmitting(true)

    try {
      const response = await inviteService.acceptInviteWithRegister({
        code: codigo,
        name: form.name.trim(),
        email: emailValue,
        password: form.password,
      })

      if (!response) {
        setError("Nao foi possivel aceitar o convite com os dados informados")
        setSubmitting(false)
        return
      }

      if (response.token) {
        persistToken(response.token)
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 1200)
    } catch {
      setError("Erro ao aceitar convite. Tente novamente.")
      setSubmitting(false)
    }
  }

  const handleGoogleJoin = async () => {
    setGoogleLoading(true)
    try {
      const base = api.defaults.baseURL || ""
      const url = base.endsWith("/")
        ? `${base}auth/google/redirect?inviteCode=${encodeURIComponent(codigo)}`
        : `${base}/auth/google/redirect?inviteCode=${encodeURIComponent(codigo)}`
      window.location.href = url
    } catch {
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <AuthBackground />
        <ConviteSuccessView />
      </div>
    )
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
        {!inviteData && (
          <ConviteInvalidCard expired={inviteErrorType === "expired"} />
        )}

        {inviteData && (
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/25"
            >
              <Heart className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Voce foi convidado!</h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              <span className="font-medium text-foreground">{resolvedInviteData.inviterName}</span> quer compartilhar as financas com voce
            </p>
          </motion.div>
        )}

        {inviteData && (
          <motion.div variants={itemVariants}>
            <ConviteForm
              inviteData={resolvedInviteData}
              form={form}
              setForm={setForm}
              submitting={submitting}
              googleLoading={googleLoading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              error={error}
              onSubmit={handleSubmit}
              onGoogleJoin={handleGoogleJoin}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
