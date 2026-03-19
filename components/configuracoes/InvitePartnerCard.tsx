"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Loader2, UserRoundPlus } from "lucide-react"

type InvitePartnerCardProps = {
  partnerName: string
  hasPartnerJoined: boolean
  inviteEmail: string
  onChangeInviteEmail: (value: string) => void
  onInviteByEmail: () => Promise<void>
  inviting: boolean
  inviteSent: boolean
}

export function InvitePartnerCard({
  partnerName,
  hasPartnerJoined,
  inviteEmail,
  onChangeInviteEmail,
  onInviteByEmail,
  inviting,
  inviteSent,
}: InvitePartnerCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <UserRoundPlus className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Convite do parceiro(a)</CardTitle>
            <CardDescription>Convide por email para participar do dashboard</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasPartnerJoined ? (
          <div className="flex flex-col gap-2">
            <Label>Parceiro(a) vinculado(a)</Label>
            <Input value={partnerName || "Parceiro(a)"} disabled />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <Label>Email do parceiro(a)</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => onChangeInviteEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                />
                <Button
                  onClick={onInviteByEmail}
                  disabled={!inviteEmail.trim() || inviting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            {inviteSent && (
              <span className="text-xs text-primary font-medium">
                Convite enviado com sucesso!
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

