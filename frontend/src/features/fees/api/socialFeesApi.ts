/**
 * @fileoverview API de cuotas sociales.
 * CRUD de montos por categoría, generación mensual y toggle de pagado.
 */

import { apiFetch } from "@/lib/api";

export type SocialFee = {
  id: number;
  category: string;
  amount: number;
  dueDay: number;
  active: boolean;
  createdAt: string;
};

export type MemberSocialFee = {
  id: number;
  memberId: number;
  socialFeeId: number;
  periodMonth: number;
  periodYear: number;
  amount: number;
  paid: boolean;
  paidAt: string | null;
  createdAt: string;
  socialFee: SocialFee;
  member?: { id: number; firstName: string; lastName: string };
};

export type CreateSocialFeeInput = {
  category: string;
  amount: number;
  dueDay?: number;
  active?: boolean;
};

export type UpdateSocialFeeInput = Partial<CreateSocialFeeInput>;

export type ToggleSocialFeePaidInput = {
  memberSocialFeeId: number;
  paid: boolean;
};

export type GenerateMonthInput = {
  month: number;
  year: number;
};

export async function getSocialFees(): Promise<SocialFee[]> {
  return apiFetch("/api/social-fees");
}

export async function getSocialFee(id: number): Promise<SocialFee> {
  return apiFetch(`/api/social-fees/${id}`);
}

export async function createSocialFee(data: CreateSocialFeeInput): Promise<SocialFee> {
  return apiFetch("/api/social-fees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSocialFee(id: number, data: UpdateSocialFeeInput): Promise<SocialFee> {
  return apiFetch(`/api/social-fees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSocialFee(id: number): Promise<void> {
  return apiFetch(`/api/social-fees/${id}`, { method: "DELETE" });
}

export async function getMemberSocialFees(memberId: number): Promise<MemberSocialFee[]> {
  return apiFetch(`/api/social-fees/member/${memberId}`);
}

export async function toggleSocialFeePaid(data: ToggleSocialFeePaidInput): Promise<MemberSocialFee> {
  return apiFetch("/api/social-fees/toggle-paid", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function generateMonthFees(data: GenerateMonthInput): Promise<{ created: number }> {
  return apiFetch("/api/social-fees/generate-month", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
