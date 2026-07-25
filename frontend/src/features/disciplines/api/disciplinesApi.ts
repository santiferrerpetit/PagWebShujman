import { apiFetch } from "@/lib/api";

export type Discipline = {
  id: number;
  name: string;
};

export type CreateDisciplineInput = {
  name: string;
};

export type GroupClass = {
  id: number;
  disciplineId: number;
  discipline: { id: number; name: string };
  userId: number;
  user: { id: number; firstName: string; lastName: string; username?: string };
  schedule: string;
  days: string;
  _count?: { memberGroups: number };
  memberGroups?: { id: number; member: { id: number; firstName: string; lastName: string; dni: string; contact: string | null } }[];
};

export type CreateClassInput = {
  disciplineId: number;
  userId: number;
  schedule: string;
  days: string;
};

// --- Disciplines API ---

export async function getDisciplines(): Promise<Discipline[]> {
  return apiFetch<Discipline[]>("/api/disciplines");
}

export async function createDiscipline(data: CreateDisciplineInput): Promise<Discipline> {
  return apiFetch("/api/disciplines", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDiscipline(id: number, data: CreateDisciplineInput): Promise<Discipline> {
  return apiFetch(`/api/disciplines/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDiscipline(id: number): Promise<void> {
  return apiFetch(`/api/disciplines/${id}`, {
    method: "DELETE",
  });
}

// --- Classes API ---

export async function getClasses(userId?: number): Promise<GroupClass[]> {
  const query = userId ? `?userId=${userId}` : "";
  return apiFetch<GroupClass[]>(`/api/classes${query}`);
}

export async function getClass(id: number): Promise<GroupClass> {
  return apiFetch<GroupClass>(`/api/classes/${id}`);
}

export async function createClass(data: CreateClassInput): Promise<GroupClass> {
  return apiFetch("/api/classes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateClass(id: number, data: CreateClassInput): Promise<GroupClass> {
  return apiFetch(`/api/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteClass(id: number): Promise<void> {
  return apiFetch(`/api/classes/${id}`, {
    method: "DELETE",
  });
}

export async function enrollMember(classId: number, memberId: number): Promise<any> {
  return apiFetch(`/api/classes/${classId}/enroll`, {
    method: "POST",
    body: JSON.stringify({ memberId }),
  });
}

export async function unenrollMember(classId: number, memberId: number): Promise<any> {
  return apiFetch(`/api/classes/${classId}/unenroll`, {
    method: "POST",
    body: JSON.stringify({ memberId }),
  });
}
