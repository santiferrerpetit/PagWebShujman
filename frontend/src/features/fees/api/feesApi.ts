import { apiFetch } from "@/lib/api";

export type SportsFee = {
  id: number;
  name: string;
  amount: number;
  description: string | null;
  active: boolean;
  createdAt: string;
};

export type MemberFee = {
  id: number;
  memberId: number;
  feeId: number;
  paid: boolean;
  paidAt: string | null;
  createdAt: string;
  fee: SportsFee;
  member?: { id: number; firstName: string; lastName: string; dni: string };
};

export type CreateFeeInput = {
  name: string;
  amount: number;
  description?: string;
  active?: boolean;
};

export type UpdateFeeInput = Partial<CreateFeeInput>;

export type AssignFeeInput = {
  memberId: number;
  feeId: number;
  paid?: boolean;
};

export type ToggleFeePaidInput = {
  memberId: number;
  feeId: number;
  paid: boolean;
};

export async function getFees(): Promise<SportsFee[]> {
  return apiFetch("/api/fees");
}

export async function getFee(id: number): Promise<SportsFee & { memberFees: MemberFee[] }> {
  return apiFetch(`/api/fees/${id}`);
}

export async function createFee(data: CreateFeeInput): Promise<SportsFee> {
  return apiFetch("/api/fees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFee(id: number, data: UpdateFeeInput): Promise<SportsFee> {
  return apiFetch(`/api/fees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFee(id: number): Promise<void> {
  return apiFetch(`/api/fees/${id}`, { method: "DELETE" });
}

export async function assignFee(data: AssignFeeInput): Promise<MemberFee> {
  return apiFetch("/api/fees/assign", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function toggleFeePaid(data: ToggleFeePaidInput): Promise<MemberFee> {
  return apiFetch("/api/fees/toggle-paid", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function unassignFee(memberId: number, feeId: number): Promise<void> {
  return apiFetch(`/api/fees/member/${memberId}/fee/${feeId}`, { method: "DELETE" });
}

export async function getMemberFees(memberId: number): Promise<MemberFee[]> {
  return apiFetch(`/api/fees/member/${memberId}`);
}

export async function getAllAssignments(): Promise<MemberFee[]> {
  return apiFetch("/api/fees/all-assignments");
}
