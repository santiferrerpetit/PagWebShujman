import { useState, useEffect, useCallback } from "react";
import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  type Member,
  type CreateMemberInput,
  type UpdateMemberInput,
} from "../api/membersApi";

export function useMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar socios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchMembers();
    };
    window.addEventListener("members:refresh", handleRefresh);
    return () => window.removeEventListener("members:refresh", handleRefresh);
  }, [fetchMembers]);

  async function addMember(data: CreateMemberInput) {
    setError(null);
    try {
      const newMember = await createMember(data);
      setMembers((prev) => [...prev, newMember]);
      return newMember;
    } catch (err: any) {
      setError(err.message || "Error al crear socio");
      return null;
    }
  }

  async function editMember(id: number, data: UpdateMemberInput) {
    setError(null);
    try {
      const updated = await updateMember(id, data);
      setMembers((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al actualizar socio");
      return null;
    }
  }

  async function removeMember(id: number) {
    setError(null);
    try {
      await deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar socio");
      return false;
    }
  }

  return {
    members,
    isLoading,
    error,
    fetchMembers,
    addMember,
    editMember,
    removeMember,
  };
}

export function useMember(id: number | null) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = useCallback(async () => {
    if (id === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMember(id);
      setMember(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar socio");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  return { member, isLoading, error, refetch: fetchMember };
}
