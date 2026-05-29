import { z } from "zod";

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  dni: z.string().min(1, "El DNI es requerido"),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha de nacimiento inválida",
  }),
  contact: z.string().optional(),
  socialFeePaid: z.coerce.boolean().default(false),
  accumulatedDebt: z.number().default(0),
});

export const updateMemberSchema = createMemberSchema.partial();

export const memberIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
