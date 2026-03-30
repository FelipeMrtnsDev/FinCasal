"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ConviteInvalidCardProps = {
  expired?: boolean
}

export function ConviteInvalidCard({ expired = false }: ConviteInvalidCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">:(</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {expired ? "Convite Expirado" : "Convite Invalido"}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {expired ? "Este convite expirou. Solicite um novo convite." : "Este convite nao existe."}
        </p>
        <Link href="/registro">
          <Button className="w-full">Criar uma conta</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
