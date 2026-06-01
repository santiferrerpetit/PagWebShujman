/**
 * @fileoverview Hooks para gestión de socios (CRUD completo).
 * useMembers: lista, crea, edita y elimina socios.
 * useMember: obtiene un socio individual por ID.
 * Escucha el evento "members:refresh" para refrescar la lista automáticamente.
 */

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

/**
 * Hook principal para la gestión de socios.
 * Carga la lista al montar y escucha refrescos automáticos vía evento "members:refresh".
 *
 * @returns {Object} Estado y acciones CRUD
 * @returns {Member[]} returns.members - Lista de socios
 * @returns {boolean} returns.isLoading - Carga en curso
 * @returns {string|null} returns.error - Mensaje de error
 * @returns {Function} returns.fetchMembers - Refresca la lista manualmente
 * @returns {Function} returns.addMember - (data: CreateMemberInput) => Promise<Member | null>
 * @returns {Function} returns.editMember - (id: number, data: UpdateMemberInput) => Promise<Member | null>
 * @returns {Function} returns.removeMember - (id: number) => Promise<boolean>
 *
 * @example
 * const { members, addMember, removeMember, isLoading } = useMembers();
 */
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

/**
 * Hook para obtener un socio específico por ID.
 * Se recarga automáticamente si cambia el ID.
 *
 * @param {number|null} id - ID del socio a buscar (null = no buscar)
 * @returns {Object} Estado del socio
 * @returns {Member|null} returns.member - Socio encontrado o null
 * @returns {boolean} returns.isLoading - Carga en curso
 * @returns {string|null} returns.error - Mensaje de error
 * @returns {Function} returns.refetch - Refresca manualmente los datos
 *
 * @example
 * const { member, isLoading } = useMember(socioId);
 */
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
