/**
 * @fileoverview Hooks para gestión de cuotas sociales.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getSocialFees,
  createSocialFee,
  updateSocialFee,
  deleteSocialFee,
  getMemberSocialFees,
  toggleSocialFeePaid,
  generateMonthFees,
  type SocialFee,
  type MemberSocialFee,
  type CreateSocialFeeInput,
  type UpdateSocialFeeInput,
  type GenerateMonthInput,
} from "../api/socialFeesApi";

export function useSocialFees() {
  const [fees, setFees] = useState<SocialFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSocialFees();
      setFees(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar cuotas sociales");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  async function addFee(data: CreateSocialFeeInput) {
    setError(null);
    try {
      const newFee = await createSocialFee(data);
      setFees((prev) => [...prev, newFee]);
      return newFee;
    } catch (err: any) {
      setError(err.message || "Error al crear cuota social");
      return null;
    }
  }

  async function editFee(id: number, data: UpdateSocialFeeInput) {
    setError(null);
    try {
      const updated = await updateSocialFee(id, data);
      setFees((prev) => prev.map((f) => (f.id === id ? updated : f)));
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al actualizar cuota social");
      return null;
    }
  }

  async function removeFee(id: number) {
    setError(null);
    try {
      await deleteSocialFee(id);
      setFees((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || "Error al eliminar cuota social");
      return false;
    }
  }

  return { fees, isLoading, error, fetchFees, addFee, editFee, removeFee };
}

export function useMemberSocialFees(memberId: number | null) {
  const [memberFees, setMemberFees] = useState<MemberSocialFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberFees = useCallback(async () => {
    if (memberId === null) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMemberSocialFees(memberId);
      setMemberFees(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar cuotas del socio");
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMemberFees();
  }, [fetchMemberFees]);

  async function togglePaid(memberSocialFeeId: number, paid: boolean) {
    setError(null);
    try {
      const updated = await toggleSocialFeePaid({ memberSocialFeeId, paid });
      setMemberFees((prev) =>
        prev.map((mf) => (mf.id === memberSocialFeeId ? updated : mf))
      );
      return updated;
    } catch (err: any) {
      setError(err.message || "Error al cambiar estado de pago");
      return null;
    }
  }

  return { memberFees, isLoading, error, fetchMemberFees, togglePaid };
}

export function useGenerateMonthFees() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(data: GenerateMonthInput) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateMonthFees(data);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al generar cuotas del mes");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { generate, isLoading, error };
}
