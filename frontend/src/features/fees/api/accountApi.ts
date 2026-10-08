import { apiFetch } from "@/lib/api";

export type Balance = {
  pendingTotal: number;
  overdueTotal: number;
  paidTotal: number;
};

export type AccountSummaryRow = {
  memberId: number;
  firstName: string;
  lastName: string;
  dni: string;
  pendingCount: number;
  overdueCount: number;
  pendingTotal: number;
  overdueTotal: number;
};

export type AccountsSummary = {
  totals: { debtors: number; pendingTotal: number; overdueTotal: number };
  members: AccountSummaryRow[];
};

export type MemberAccount = {
  member: { id: number; firstName: string; lastName: string; dni: string; isActive: boolean };
  balance: Balance;
  socialFees: {
    id: number;
    category: string;
    periodMonth: number;
    periodYear: number;
    amount: number;
    paid: boolean;
    paidAt: string | null;
    dueDate: string;
    overdue: boolean;
  }[];
  sportsFees: {
    id: number;
    feeId: number;
    name: string;
    discipline: string;
    amount: number;
    paid: boolean;
    paidAt: string | null;
  }[];
};

export function getAccountsSummary(): Promise<AccountsSummary> {
  return apiFetch<AccountsSummary>("/api/account/summary");
}

export function getMemberAccount(memberId: number): Promise<MemberAccount> {
  return apiFetch<MemberAccount>(`/api/account/member/${memberId}`);
}
