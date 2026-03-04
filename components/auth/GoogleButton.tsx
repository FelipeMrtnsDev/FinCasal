"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { GoogleIcon } from "./GoogleIcon"

interface GoogleButtonProps {
  onClick: () => void
  loading: boolean
  text: string
}

export function GoogleButton({ onClick, loading, text }: GoogleButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full h-12 text-foreground border-border hover:bg-muted/50 transition-all"
      onClick={onClick}
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
