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

export const reportQuerySchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha desde inválida").optional(),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha hasta inválida").optional(),
    disciplineId: z.coerce.number().int().positive().optional(),
    groupClassId: z.coerce.number().int().positive().optional(),
  })
  .refine((q) => !q.from || !q.to || q.from <= q.to, {
    message: "La fecha desde no puede ser posterior a la fecha hasta",
    path: ["from"],
  });

export type ReportQuery = z.infer<typeof reportQuerySchema>;

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
