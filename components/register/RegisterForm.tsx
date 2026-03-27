"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { authService } from "@/services/authService"

export function RegisterForm() {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Preencha todos os campos")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }
    setError("")
    setLoading(true)

    try {
      await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      const redirectTo = searchParams.get("next")
      window.location.href = redirectTo || "/"
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Erro ao criar conta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          placeholder="Seu nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-11"
          autoComplete="name"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="h-11"
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
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
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Criar Conta
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    </form>
  )
}
