import { z } from "zod";

export const accountMemberIdSchema = z.object({
  memberId: z.coerce.number().int().positive("ID de socio inválido"),
});
