"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Loader2 } from "lucide-react"

type OwnNameCardProps = {
  ownName: string
  onChangeOwnName: (value: string) => void
  onSaveOwnName: () => Promise<void>
  saving: boolean
  saved: boolean
  error?: string
}

export function OwnNameCard({
  ownName,
  onChangeOwnName,
  onSaveOwnName,
  saving,
  saved,
  error,
}: OwnNameCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Seu nome</CardTitle>
            <CardDescription>Este nome é do seu usuário real da conta</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Nome</Label>
            <Input
              value={ownName}
              onChange={(e) => onChangeOwnName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onSaveOwnName}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!ownName.trim() || saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar nome"}
            </Button>
            {saved && <span className="text-sm text-primary font-medium">Salvo com sucesso!</span>}
          </div>
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
