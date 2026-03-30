import api from "@/lib/api";
import { AuthResponse } from "@/lib/types";
import { AxiosError } from "axios";

export interface InviteDetails {
  code: string;
  email: string;
  inviterName: string;
  dashboardId: string;
  expiresAt?: string;
}

type AcceptInvitePayload = {
  code: string;
  name: string;
  email: string;
  password: string;
};

export type InviteLookupResult = {
  inviteData: InviteDetails | null;
  errorType: "invalid" | "expired" | null;
};

function normalizeInviteDetails(
  data: unknown,
  code: string,
): InviteDetails | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const email =
    (typeof record.email === "string" && record.email) ||
    (typeof record.invitedEmail === "string" && record.invitedEmail) ||
    (typeof record.partnerEmail === "string" && record.partnerEmail) ||
    "";
  const inviterName =
    (typeof record.inviterName === "string" && record.inviterName) ||
    (typeof record.ownerName === "string" && record.ownerName) ||
    (typeof record.name === "string" && record.name) ||
    "Seu parceiro(a)";
  const dashboardId =
    (typeof record.dashboardId === "string" && record.dashboardId) ||
    (typeof record.id === "string" && record.id) ||
    "";
  if (!email) return null;
  return {
    code,
    email,
    inviterName,
    dashboardId,
    expiresAt:
      typeof record.expiresAt === "string" ? record.expiresAt : undefined,
  };
}

export const inviteService = {
  getInviteDetails: async (code: string): Promise<InviteLookupResult> => {
    try {
      const response = await api.get(`/auth/invite/${code}`);
      const details = normalizeInviteDetails(response.data, code);
      if (!details) return { inviteData: null, errorType: "invalid" };
      return { inviteData: details, errorType: null };
    } catch (error) {
      const status = (error as AxiosError)?.response?.status;
      if (status === 410) return { inviteData: null, errorType: "expired" };
      return { inviteData: null, errorType: "invalid" };
    }
  },

  acceptInviteWithRegister: async (
    payload: AcceptInvitePayload,
  ): Promise<AuthResponse | null> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        inviteToken: payload.code,
      });
      return response.data || null;
    } catch {
      return null;
    }
  },
};
