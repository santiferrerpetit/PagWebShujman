/**
 * @fileoverview API de socios - CRUD completo + toggle activo/inactivo.
 */

import { apiFetch } from "@/lib/api";

export type MemberSocialFeeItem = {
  id: number;
  periodMonth: number;
  periodYear: number;
  amount: number;
  paid: boolean;
  socialFee: { category: string };
};

export type Member = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  category?: string;
  accumulatedDebt: number;
  memberSocialFees?: MemberSocialFeeItem[];
  createdAt?: string;
  updatedAt?: string;
};

/** Datos necesarios para crear un socio */
export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
};

/** Datos para actualizar un socio (todos opcionales) */
export type UpdateMemberInput = Partial<CreateMemberInput>;

function parseMember(data: any): Member {
  return {
    ...data,
    accumulatedDebt: Number(data.accumulatedDebt) || 0,
    isActive: data.isActive ?? true,
  };
}

export async function getMembers(): Promise<Member[]> {
  const members = await apiFetch<any[]>("/api/members");
  return members.map(parseMember);
}

export async function getMember(id: number): Promise<Member> {
  const member = await apiFetch<any>(`/api/members/${id}`);
  return parseMember(member);
}

export async function createMember(data: CreateMemberInput): Promise<Member> {
  const member = await apiFetch<any>("/api/members", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return parseMember(member);
}

export async function updateMember(id: number, data: UpdateMemberInput): Promise<Member> {
  const member = await apiFetch<any>(`/api/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return parseMember(member);
}

export async function deleteMember(id: number): Promise<void> {
  return apiFetch(`/api/members/${id}`, { method: "DELETE" });
}

export async function toggleMemberActive(id: number): Promise<Member> {
  const member = await apiFetch<any>(`/api/members/${id}/toggle-active`, { method: "POST" });
  return parseMember(member);
}
