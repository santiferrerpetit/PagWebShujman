import { apiFetch } from "@/lib/api";

export type Member = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  contact: string | null;
  socialFeePaid: boolean;
  accumulatedDebt: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  contact?: string;
  socialFeePaid?: boolean;
  accumulatedDebt?: number;
};

export type UpdateMemberInput = Partial<CreateMemberInput>;

function parseMember(data: any): Member {
  return {
    ...data,
    accumulatedDebt: Number(data.accumulatedDebt) || 0,
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
  return apiFetch(`/api/members/${id}`, {
    method: "DELETE",
  });
}
