import { ConviteClient } from "@/components/convite/ConviteClient"
import { inviteService } from "@/services/inviteService"

type InvitePageProps = {
  params: Promise<{ codigo: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { codigo } = await params
  const { inviteData, errorType } = await inviteService.getInviteDetails(codigo)

  return <ConviteClient codigo={codigo} inviteData={inviteData} inviteErrorType={errorType} />
}
