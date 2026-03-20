"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { AuthBackground } from "@/components/auth/AuthBackground"
import { GoogleButton } from "@/components/auth/GoogleButton"

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

interface InviteData {
  email: string
  inviterName: string
  dashboardId: string
}

export default function ConvitePage() {
  const params = useParams()
  const codigo = params.codigo as string

  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        // TODO: Substituir pela chamada real da API
        // const response = await fetch(`/api/dashboard/invite/${codigo}`)
        // const data = await response.json()
        
        // Simulacao - em producao, buscar do backend
        await new Promise((resolve) => setTimeout(resolve, 800))
        
        // Dados mockados - o backend retornaria o email do convite
        setInviteData({
          email: "parceiro@email.com", // Email pre-preenchido do convite
          inviterName: "Felipe",
          dashboardId: "dash_123",
        })
        setForm((f) => ({ ...f, email: "parceiro@email.com" }))
      } catch (err) {
        setError("Convite invalido ou expirado")
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
  }, [codigo])

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
    setError("")
    setSubmitting(true)

    try {
      // TODO: Substituir pela chamada real da API
      // await fetch('/api/dashboard/join', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     inviteCode: codigo,
      //     name: form.name,
      //     email: form.email,
      //     password: form.password,
      //   })
      // })

      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess(true)
      
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } catch (err) {
      setError("Erro ao aceitar convite. Tente novamente.")
      setSubmitting(false)
    }
  }

  const handleGoogleJoin = async () => {
    setGoogleLoading(true)
    try {
      // TODO: Google OAuth + join dashboard
      await new Promise((resolve) => setTimeout(resolve, 1500))
      window.location.href = "/"
    } catch (err) {
      setGoogleLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <AuthBackground />
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verificando convite...</p>
        </div>
      </div>
    )
  }

  if (!inviteData && !loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <AuthBackground />
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">:(</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Convite Invalido</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Este convite nao existe ou ja expirou.
            </p>
            <Link href="/registro">
              <Button className="w-full">Criar uma conta</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background p-4">
        <AuthBackground />
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
        {/* Header */}
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
            <span className="font-medium text-foreground">{inviteData?.inviterName}</span> quer compartilhar as financas com voce
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-xl shadow-primary/5 border-border/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">Completar Cadastro</CardTitle>
              <CardDescription>Preencha seus dados para entrar no dashboard</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <GoogleButton
                onClick={handleGoogleJoin}
                loading={googleLoading}
                text="Entrar com Google"
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

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-sm text-destructive">{error}</p>
                  </motion.div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Seu Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como voce quer ser chamado"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11"
                    autoComplete="name"
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    className="h-11 bg-muted/50"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">
                    E-mail definido pelo convite
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Criar Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimo 6 caracteres"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="h-11 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="h-11 pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-2 group"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Aceitar Convite
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                Ja tem uma conta?{" "}
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
