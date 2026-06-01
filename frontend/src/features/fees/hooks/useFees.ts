/**
 * @fileoverview Hooks para gestión de aranceles deportivos.
 * useFees: CRUD de aranceles disponibles.
 * useMemberFees: aranceles asignados a un socio con toggle pagado/desasignar.
 * useAllAssignments: todas las asignaciones para vista global.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getFees,
  createFee,
  updateFee,
  deleteFee,
  assignFee,
  toggleFeePaid,
  unassignFee,
  getMemberFees,
  getAllAssignments,
  type SportsFee,
  type MemberFee,
  type CreateFeeInput,
  type UpdateFeeInput,
  type AssignFeeInput,
  type ToggleFeePaidInput,
} from "../api/feesApi";

/**
 * Hook para gestionar el CRUD de aranceles deportivos.
 * Carga la lista al montar.
 *
 * @returns {Object} Estado y acciones CRUD
 * @returns {SportsFee[]} returns.fees - Lista de aranceles
 * @returns {boolean} returns.isLoading - Carga en curso
 * @returns {string|null} returns.error - Mensaje de error
 * @returns {Function} returns.fetchFees - Refresca la lista manualmente
 * @returns {Function} returns.addFee - (data: CreateFeeInput) => Promise<SportsFee | null>
 * @returns {Function} returns.editFee - (id: number, data: UpdateFeeInput) => Promise<SportsFee | null>
 * @returns {Function} returns.removeFee - (id: number) => Promise<boolean>
 *
 * @example
 * const { fees, addFee, removeFee, isLoading } = useFees();
 */
export function useFees() {
  const [fees, setFees] = useState<SportsFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFees();
      setFees(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar aranceles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  async function addFee(data: CreateFeeInput) {
    setError(null);
    try {
      const newFee = await createFee(data);
      setFees((prev) => [...prev, newFee]);
      return newFee;
    } catch (err: any) {
      setError(err.message || "Error al crear arancel");
      return null;
    }
  }

  async function editFee(id: number, data: UpdateFeeInput) {
    setError(null);
    try {
      const updated = await updateFee(id, data);
      setFees((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al actualizar arancel");
      return null;
    }
  }

  async function removeFee(id: number) {
    setError(null);
    try {
      await deleteFee(id);
      setFees((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar arancel");
      return false;
    }
  }

  return { fees, isLoading, error, fetchFees, addFee, editFee, removeFee };
}

/**
 * Hook para gestionar los aranceles asignados a un socio específico.
 * Permite asignar, marcar como pagado/pendiente y desasignar aranceles.
 * Se recarga automáticamente al cambiar el memberId.
 *
 * @param {number|null} memberId - ID del socio (null = no cargar nada)
 * @returns {Object} Estado y acciones
 * @returns {MemberFee[]} returns.memberFees - Aranceles asignados al socio
 * @returns {boolean} returns.isLoading - Carga en curso
 * @returns {string|null} returns.error - Mensaje de error
 * @returns {Function} returns.fetchMemberFees - Refresca la lista
 * @returns {Function} returns.assignFeeToMember - (data: AssignFeeInput) => Promise<MemberFee | null>
 * @returns {Function} returns.togglePaid - (data: ToggleFeePaidInput) => Promise<MemberFee | null>
 * @returns {Function} returns.removeAssignment - (feeId: number) => Promise<boolean>
 *
 * @example
 * const { memberFees, assignFeeToMember, togglePaid } = useMemberFees(socioId);
 */
export function useMemberFees(memberId: number | null) {
  const [memberFees, setMemberFees] = useState<MemberFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberFees = useCallback(async () => {
    if (memberId === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMemberFees(memberId);
      setMemberFees(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar aranceles del socio");
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMemberFees();
  }, [fetchMemberFees]);

  async function assignFeeToMember(data: AssignFeeInput) {
    setError(null);
    try {
      const assigned = await assignFee(data);
      setMemberFees((prev) => [...prev, assigned]);
      return assigned;
    } catch (err: any) {
      setError(err.message || "Error al asignar arancel");
      return null;
    }
  }

  async function togglePaid(data: ToggleFeePaidInput) {
    setError(null);
    try {
      const updated = await toggleFeePaid(data);
      setMemberFees((prev) =>
        prev.map((mf) => (mf.feeId === data.feeId && mf.memberId === data.memberId ? updated : mf))
      );
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al cambiar estado de pago");
      return null;
    }
  }

  async function removeAssignment(feeId: number) {
    if (memberId === null) return false;
    setError(null);
    try {
      await unassignFee(memberId, feeId);
      setMemberFees((prev) => prev.filter((mf) => mf.feeId !== feeId));
      return true;
    } catch (err: any) {
      setError(err.message || "Error al desasignar arancel");
      return false;
    }
  }

  return {
    memberFees,
    isLoading,
    error,
    fetchMemberFees,
    assignFeeToMember,
    togglePaid,
    removeAssignment,
  };
}

/**
 * Hook para obtener todas las asignaciones de aranceles a socios.
 * Útil para vistas de reporte o resumen global de pagos.
 *
 * @returns {Object} Estado de asignaciones
 * @returns {MemberFee[]} returns.assignments - Todas las asignaciones
 * @returns {boolean} returns.isLoading - Carga en curso
 * @returns {string|null} returns.error - Mensaje de error
 * @returns {Function} returns.refetch - Refresca manualmente
 *
 * @example
 * const { assignments, isLoading } = useAllAssignments();
 */
export function useAllAssignments() {
  const [assignments, setAssignments] = useState<MemberFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllAssignments();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar asignaciones");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, isLoading, error, refetch: fetchAssignments };
}
