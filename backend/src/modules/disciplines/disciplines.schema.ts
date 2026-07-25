import { z } from "zod";

export const createDisciplineSchema = z.object({
  name: z.string().min(2, "El nombre de la disciplina debe tener al menos 2 caracteres"),
});

export const updateDisciplineSchema = z.object({
  name: z.string().min(2, "El nombre de la disciplina debe tener al menos 2 caracteres"),
});

export const disciplineIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;
