"use client"

import Link from "next/link"
import { ArrowLeftCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AssinaturaVoltarPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <ArrowLeftCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle>Checkout interrompido</CardTitle>
          <CardDescription>
            Você voltou antes de finalizar o pagamento. Quando quiser, você pode tentar novamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link href="/" className="w-full">
            <Button className="w-full">Voltar para o painel</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
