/**
 * @fileoverview API de socios - CRUD completo.
 * Incluye tipos de datos y función auxiliar parseMember para normalizar la deuda acumulada.
 */

import { apiFetch } from "@/lib/api";

/**
 * Datos completos de un socio del club.
 */
export type Member = {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  contact: string | null;
  socialFeePaid: boolean;
  accumulatedDebt: number;
  createdAt?: string;
  updatedAt?: string;
};

/** Datos necesarios para crear un socio */
export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  contact?: string;
  socialFeePaid?: boolean;
  accumulatedDebt?: number;
};

/** Datos para actualizar un socio (todos opcionales) */
export type UpdateMemberInput = Partial<CreateMemberInput>;

/**
 * Normaliza los datos de un socio desde la API.
 * Convierte accumulatedDebt a número para evitar problemas de tipo.
 *
 * @param {any} data - Datos crudos de la API
 * @returns {Member} Socio con accumulatedDebt normalizado a number
 */
function parseMember(data: any): Member {
  return {
    ...data,
    accumulatedDebt: Number(data.accumulatedDebt) || 0,
  };
}

/**
 * Obtiene la lista completa de socios.
 *
 * @returns {Promise<Member[]>} Lista de socios
 */
export async function getMembers(): Promise<Member[]> {
  const members = await apiFetch<any[]>("/api/members");
  return members.map(parseMember);
}

/**
 * Obtiene un socio por su ID.
 *
 * @param {number} id - ID del socio
 * @returns {Promise<Member>} Datos del socio
 */
export async function getMember(id: number): Promise<Member> {
  const member = await apiFetch<any>(`/api/members/${id}`);
  return parseMember(member);
}

/**
 * Crea un nuevo socio.
 *
 * @param {CreateMemberInput} data - Datos del nuevo socio
 * @returns {Promise<Member>} Socio creado
 */
export async function createMember(data: CreateMemberInput): Promise<Member> {
  const member = await apiFetch<any>("/api/members", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return parseMember(member);
}

/**
 * Actualiza los datos de un socio existente.
 *
 * @param {number} id - ID del socio a modificar
 * @param {UpdateMemberInput} data - Campos a actualizar
 * @returns {Promise<Member>} Socio actualizado
 */
export async function updateMember(id: number, data: UpdateMemberInput): Promise<Member> {
  const member = await apiFetch<any>(`/api/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return parseMember(member);
}

/**
 * Elimina un socio del sistema.
 *
 * @param {number} id - ID del socio a eliminar
 * @returns {Promise<void>}
 */
export async function deleteMember(id: number): Promise<void> {
  return apiFetch(`/api/members/${id}`, {
    method: "DELETE",
  });
}
