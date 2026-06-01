/**
 * @fileoverview API de aranceles deportivos.
 * CRUD de aranceles, asignación a socios, toggle de pagado y consulta de asignaciones.
 */

import { apiFetch } from "@/lib/api";

/**
 * Arancel deportivo disponible en el sistema.
 */
export type SportsFee = {
  id: number;
  name: string;
  amount: number;
  description: string | null;
  active: boolean;
  createdAt: string;
};

/**
 * Relación entre un socio y un arancel asignado.
 */
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

/** Datos para crear un arancel */
export type CreateFeeInput = {
  name: string;
  amount: number;
  description?: string;
  active?: boolean;
};

/** Datos para actualizar un arancel (todos opcionales) */
export type UpdateFeeInput = Partial<CreateFeeInput>;

/** Datos para asignar un arancel a un socio */
export type AssignFeeInput = {
  memberId: number;
  feeId: number;
  paid?: boolean;
};

/** Datos para cambiar el estado de pago de una asignación */
export type ToggleFeePaidInput = {
  memberId: number;
  feeId: number;
  paid: boolean;
};

/**
 * Obtiene la lista de aranceles disponibles.
 *
 * @returns {Promise<SportsFee[]>} Lista de aranceles
 */
export async function getFees(): Promise<SportsFee[]> {
  return apiFetch("/api/fees");
}

/**
 * Obtiene un arancel por ID con sus asignaciones a socios.
 *
 * @param {number} id - ID del arancel
 * @returns {Promise<SportsFee & {memberFees: MemberFee[]}>} Arancel con sus asignaciones
 */
export async function getFee(id: number): Promise<SportsFee & { memberFees: MemberFee[] }> {
  return apiFetch(`/api/fees/${id}`);
}

/**
 * Crea un nuevo arancel deportivo.
 *
 * @param {CreateFeeInput} data - Datos del arancel
 * @returns {Promise<SportsFee>} Arancel creado
 */
export async function createFee(data: CreateFeeInput): Promise<SportsFee> {
  return apiFetch("/api/fees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Actualiza un arancel existente.
 *
 * @param {number} id - ID del arancel
 * @param {UpdateFeeInput} data - Campos a modificar
 * @returns {Promise<SportsFee>} Arancel actualizado
 */
export async function updateFee(id: number, data: UpdateFeeInput): Promise<SportsFee> {
  return apiFetch(`/api/fees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Elimina un arancel del sistema.
 *
 * @param {number} id - ID del arancel
 * @returns {Promise<void>}
 */
export async function deleteFee(id: number): Promise<void> {
  return apiFetch(`/api/fees/${id}`, { method: "DELETE" });
}

/**
 * Asigna un arancel a un socio.
 *
 * @param {AssignFeeInput} data - Datos de la asignación (memberId, feeId, paid)
 * @returns {Promise<MemberFee>} Asignación creada
 */
export async function assignFee(data: AssignFeeInput): Promise<MemberFee> {
  return apiFetch("/api/fees/assign", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Cambia el estado de pago de una asignación (pagado ↔ pendiente).
 *
 * @param {ToggleFeePaidInput} data - memberId, feeId y nuevo estado paid
 * @returns {Promise<MemberFee>} Asignación actualizada
 */
export async function toggleFeePaid(data: ToggleFeePaidInput): Promise<MemberFee> {
  return apiFetch("/api/fees/toggle-paid", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Desasigna un arancel de un socio.
 *
 * @param {number} memberId - ID del socio
 * @param {number} feeId - ID del arancel a desasignar
 * @returns {Promise<void>}
 */
export async function unassignFee(memberId: number, feeId: number): Promise<void> {
  return apiFetch(`/api/fees/member/${memberId}/fee/${feeId}`, { method: "DELETE" });
}

/**
 * Obtiene los aranceles asignados a un socio específico.
 *
 * @param {number} memberId - ID del socio
 * @returns {Promise<MemberFee[]>} Lista de aranceles asignados al socio
 */
export async function getMemberFees(memberId: number): Promise<MemberFee[]> {
  return apiFetch(`/api/fees/member/${memberId}`);
}

/**
 * Obtiene todas las asignaciones de aranceles a socios.
 * Útil para vistas de reporte o resúmenes globales.
 *
 * @returns {Promise<MemberFee[]>} Todas las asignaciones existentes
 */
export async function getAllAssignments(): Promise<MemberFee[]> {
  return apiFetch("/api/fees/all-assignments");
}
