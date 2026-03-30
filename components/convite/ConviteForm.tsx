"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon } from "@/components/auth/GoogleIcon"
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { InviteData, InviteRegisterForm } from "./types"

type ConviteFormProps = {
  inviteData: InviteData
  form: InviteRegisterForm
  setForm: (form: InviteRegisterForm) => void
  submitting: boolean
  googleLoading: boolean
  showPassword: boolean
  setShowPassword: (value: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (value: boolean) => void
  error: string
  onSubmit: (e: React.FormEvent) => Promise<void>
  onGoogleJoin: () => Promise<void>
}

export function ConviteForm({
  inviteData,
  form,
  setForm,
  submitting,
  googleLoading,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  error,
  onSubmit,
  onGoogleJoin,
}: ConviteFormProps) {
  return (
    <Card className="shadow-xl shadow-primary/5 border-border/50">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Completar Cadastro</CardTitle>
        <CardDescription>Preencha seus dados para entrar no dashboard</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Button
          variant="outline"
          className="w-full h-12 text-foreground border-border hover:bg-muted/50 transition-all"
          onClick={onGoogleJoin}
          disabled={googleLoading}
          type="button"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 mr-3" />
              Entrar com Google
            </>
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">ou</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            {inviteData.email ? (
              <Input
                id="email"
                type="email"
                value={form.email || inviteData.email}
                className="h-11 bg-muted/50"
                disabled
                readOnly
              />
            ) : (
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11"
                placeholder="seu-email@exemplo.com"
                autoComplete="email"
              />
            )}
            <p className="text-xs text-muted-foreground">
              {inviteData.email ? "E-mail definido pelo convite" : "Informe o e-mail da conta convidada"}
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
  )
}
