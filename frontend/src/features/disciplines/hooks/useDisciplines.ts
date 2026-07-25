import { useState, useEffect, useCallback } from "react";
import {
  getDisciplines,
  getDiscipline,
  createDiscipline,
  updateDiscipline,
  deleteDiscipline,
  getGroupsByDiscipline,
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  assignMemberToGroup,
  removeMemberFromGroup,
  getTeacherGroups,
  getTeachers,
  type Discipline,
  type Group,
  type GroupDetail,
  type CreateDisciplineInput,
  type UpdateDisciplineInput,
  type CreateGroupInput,
  type UpdateGroupInput,
  type AssignMemberInput,
} from "../api/disciplinesApi";

export function useDisciplines() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisciplines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDisciplines();
      setDisciplines(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar disciplinas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  async function addDiscipline(data: CreateDisciplineInput) {
    setError(null);
    try {
      const newDiscipline = await createDiscipline(data);
      setDisciplines((prev) => [...prev, newDiscipline]);
      return newDiscipline;
    } catch (err: any) {
      setError(err.message || "Error al crear disciplina");
      return null;
    }
  }

  async function editDiscipline(id: number, data: UpdateDisciplineInput) {
    setError(null);
    try {
      const updated = await updateDiscipline(id, data);
      setDisciplines((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al actualizar disciplina");
      return null;
    }
  }

  async function removeDiscipline(id: number) {
    setError(null);
    try {
      await deleteDiscipline(id);
      setDisciplines((prev) => prev.filter((d) => d.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar disciplina");
      return false;
    }
  }

  return {
    disciplines,
    isLoading,
    error,
    fetchDisciplines,
    addDiscipline,
    editDiscipline,
    removeDiscipline,
  };
}

export function useDiscipline(id: number | null) {
  const [discipline, setDiscipline] = useState<Discipline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscipline = useCallback(async () => {
    if (id === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDiscipline(id);
      setDiscipline(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar disciplina");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDiscipline();
  }, [fetchDiscipline]);

  return { discipline, isLoading, error, refetch: fetchDiscipline };
}

export function useGroups(disciplineId: number | null) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    if (disciplineId === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getGroupsByDiscipline(disciplineId);
      setGroups(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar grupos");
    } finally {
      setIsLoading(false);
    }
  }, [disciplineId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  async function addGroup(data: CreateGroupInput) {
    if (disciplineId === null) return null;
    setError(null);
    try {
      const newGroup = await createGroup(disciplineId, data);
      setGroups((prev) => [...prev, newGroup]);
      return newGroup;
    } catch (err: any) {
      setError(err.message || "Error al crear grupo");
      return null;
    }
  }

  async function editGroup(id: number, data: UpdateGroupInput) {
    setError(null);
    try {
      const updated = await updateGroup(id, data);
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al actualizar grupo");
      return null;
    }
  }

  async function removeGroup(id: number) {
    setError(null);
    try {
      await deleteGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar grupo");
      return false;
    }
  }

  return {
    groups,
    isLoading,
    error,
    fetchGroups,
    addGroup,
    editGroup,
    removeGroup,
  };
}

export function useGroup(id: number | null) {
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    if (id === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getGroup(id);
      setGroup(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar grupo");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  async function assignMember(data: AssignMemberInput) {
    if (id === null) return null;
    setError(null);
    try {
      const result = await assignMemberToGroup(id, data);
      await fetchGroup();
      return result;
    } catch (err: any) {
      setError(err.message || "Error al asignar socio");
      return null;
    }
  }

  async function removeMember(memberId: number) {
    if (id === null) return false;
    setError(null);
    try {
      await removeMemberFromGroup(id, memberId);
      await fetchGroup();
      return true;
    } catch (err: any) {
      setError(err.message || "Error al quitar socio");
      return false;
    }
  }

  return {
    group,
    isLoading,
    error,
    fetchGroup,
    assignMember,
    removeMember,
  };
}

export function useTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTeachers();
      setTeachers(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar profesores");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return { teachers, isLoading, error, refetch: fetchTeachers };
}

export function useTeacherGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTeacherGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar grupos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, isLoading, error, refetch: fetchGroups };
}
