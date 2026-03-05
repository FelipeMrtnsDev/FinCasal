"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { GoogleIcon } from "./GoogleIcon"
import api from "@/lib/api"

interface GoogleButtonProps {
  text: string
}

export function GoogleButton({ text }: GoogleButtonProps) {
  const [loading, setLoading] = React.useState(false)

  const handleLogin = () => {
    setLoading(true)

    const baseURL = api.defaults.baseURL || "http://localhost:3000/api"

    let redirectUrl = ""
    if (baseURL.endsWith("/")) {
      redirectUrl = `${baseURL}/google/redirect`
    } else {
      redirectUrl = `${baseURL}/auth/google/redirect`
    }


    const axiosBase = api.defaults.baseURL || ""
    const targetPath = "/auth/google/redirect"

    const finalUrl = axiosBase.endsWith("/")
      ? `${axiosBase}auth/google/redirect`
      : `${axiosBase}/auth/google/redirect`

    window.location.href = finalUrl
  }

  return (
    <Button
      variant="outline"
      className="w-full h-12 text-foreground border-border hover:bg-muted/50 transition-all"
      onClick={handleLogin}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <GoogleIcon className="w-5 h-5 mr-3" />
          {text}
        </>
      )}
    </Button>
  )
}
