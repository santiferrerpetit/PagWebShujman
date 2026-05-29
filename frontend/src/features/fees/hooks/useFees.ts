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
