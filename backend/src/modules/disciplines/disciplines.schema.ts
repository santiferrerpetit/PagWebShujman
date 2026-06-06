import { z } from "zod";

export const createDisciplineSchema = z.object({
  name: z.string().min(1, "El nombre de la disciplina es requerido").max(200),
});

export const updateDisciplineSchema = createDisciplineSchema.partial();

export const disciplineIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createGroupSchema = z.object({
  userId: z.coerce.number().int().positive("El profesor es requerido"),
  schedule: z.string().min(1, "El horario es requerido").max(100),
  days: z.string().min(1, "Los días de práctica son requeridos").max(100),
});

export const updateGroupSchema = createGroupSchema.partial();

export const groupIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const assignMemberSchema = z.object({
  memberId: z.coerce.number().int().positive(),
});

export type CreateDisciplineInput = z.infer<typeof createDisciplineSchema>;
export type UpdateDisciplineInput = z.infer<typeof updateDisciplineSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type AssignMemberInput = z.infer<typeof assignMemberSchema>;
