import { z } from "zod";

export const createMemberSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido").max(100),
  lastName: z.string().min(1, "El apellido es requerido").max(100),
  dni: z.string().min(1, "El DNI es requerido").max(20),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Fecha de nacimiento inválida",
  }),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
});

export const updateMemberSchema = createMemberSchema.partial();

export const memberIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
