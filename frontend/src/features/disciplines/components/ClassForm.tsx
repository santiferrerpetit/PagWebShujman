import { useForm } from "react-hook-form";
import type { CreateClassInput, GroupClass, Discipline } from "../api/disciplinesApi";
import type { User } from "@/features/auth/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type ClassFormProps = {
  groupClass?: GroupClass | null;
  disciplines: Discipline[];
  professors: User[];
  onSubmit: (data: CreateClassInput) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
};

type FormInputs = {
  disciplineId: number;
  userId: number;
  schedule: string;
  days: string;
};

export default function ClassForm({
  groupClass,
  disciplines,
  professors,
  onSubmit,
  onCancel,
  isLoading,
  error,
}: ClassFormProps) {
  const isEditing = !!groupClass;
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      disciplineId: groupClass?.disciplineId || (disciplines[0]?.id ?? 0),
      userId: groupClass?.userId || (professors[0]?.id ?? 0),
      schedule: groupClass?.schedule || "",
      days: groupClass?.days || "",
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit({
      disciplineId: Number(data.disciplineId),
      userId: Number(data.userId),
      schedule: data.schedule,
      days: data.days,
    });
  });

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="disciplineId">Disciplina</Label>
          <select
            id="disciplineId"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("disciplineId", { required: "La disciplina es requerida", valueAsNumber: true })}
          >
            <option value="">Seleccione una disciplina...</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.disciplineId && <p className="text-xs text-destructive">{errors.disciplineId.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="userId">Profesor</Label>
          <select
            id="userId"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            {...register("userId", { required: "El profesor es requerido", valueAsNumber: true })}
          >
            <option value="">Seleccione un profesor...</option>
            {professors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.role.name === "Administrator" ? "Admin" : "Profesor"})
              </option>
            ))}
          </select>
          {errors.userId && <p className="text-xs text-destructive">{errors.userId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="days">Días</Label>
          <Input
            id="days"
            placeholder="Ej: Lunes, Miércoles, Viernes"
            {...register("days", { required: "Los días son requeridos" })}
            aria-invalid={errors.days ? "true" : "false"}
          />
          {errors.days && <p className="text-xs text-destructive">{errors.days.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="schedule">Horario</Label>
          <Input
            id="schedule"
            placeholder="Ej: 18:00 - 19:30"
            {...register("schedule", { required: "El horario es requerido" })}
            aria-invalid={errors.schedule ? "true" : "false"}
          />
          {errors.schedule && <p className="text-xs text-destructive">{errors.schedule.message}</p>}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {isEditing ? "Guardar cambios" : "Crear clase"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
