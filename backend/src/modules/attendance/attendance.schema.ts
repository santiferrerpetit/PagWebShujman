import { z } from "zod";

export const getAttendanceSchema = z.object({
  groupClassId: z.coerce.number().int().positive("ID de clase inválido"),
  date: z.string().optional(),
});

export const recordAttendanceSchema = z.object({
  groupClassId: z.number().int().positive("ID de clase inválido"),
  date: z.string().min(1, "Fecha es requerida"),
  records: z.array(
    z.object({
      memberId: z.number().int().positive("ID de socio inválido"),
      present: z.boolean(),
    })
  ).min(1, "Debe registrar al menos un socio"),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
