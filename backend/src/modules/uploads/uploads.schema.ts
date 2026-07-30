import { z } from "zod";

export const uploadParamsSchema = z.object({
  module: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z-]+$/, "Módulo inválido")
    .default("general"),
});

export const listQuerySchema = z.object({
  module: z.string().max(50).regex(/^[a-z-]+$/).optional(),
});

export const deleteFileSchema = z.object({
  id: z.coerce.number().int().positive(),
});
