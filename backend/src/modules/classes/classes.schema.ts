import { z } from "zod";

export const createClassSchema = z.object({
  disciplineId: z.number().int().positive("ID de disciplina inválido"),
  userId: z.number().int().positive("ID de profesor inválido"),
  schedule: z.string().min(1, "Horario es requerido"),
  days: z.string().min(1, "Días son requeridos"),
});

export const updateClassSchema = z.object({
  disciplineId: z.number().int().positive("ID de disciplina inválido"),
  userId: z.number().int().positive("ID de profesor inválido"),
  schedule: z.string().min(1, "Horario es requerido"),
  days: z.string().min(1, "Días son requeridos"),
});

export const classIdSchema = z.object({
  id: z.coerce.number().int().positive("ID de clase inválido"),
});

export const enrollMemberSchema = z.object({
  memberId: z.number().int().positive("ID de socio inválido"),
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
