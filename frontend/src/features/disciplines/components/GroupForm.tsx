import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Group, CreateGroupInput, UpdateGroupInput } from "@/features/disciplines/api/disciplinesApi";
import type { User } from "@/context/AuthContext";

interface GroupFormProps {
  group?: Group | null;
  teachers: User[];
  onSubmit: (data: CreateGroupInput | UpdateGroupInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function GroupForm({ group, teachers, onSubmit, onCancel, isLoading, error }: GroupFormProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(group?.userId ? String(group.userId) : "");
  const selectedTeacher = teachers.find((t) => String(t.id) === selectedTeacherId);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<{
    userId: string;
    schedule: string;
    days: string;
  }>({
    defaultValues: {
      userId: group?.userId ? String(group.userId) : "",
      schedule: group?.schedule || "",
      days: group?.days || "",
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      userId: Number(data.userId),
      schedule: data.schedule,
      days: data.days,
    });
  });

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="userId">Profesor</Label>
        <Select
          value={selectedTeacherId}
          onValueChange={(v) => {
            setSelectedTeacherId(v ?? "");
            setValue("userId", v ?? "", { shouldValidate: true });
          }}
        >
          <SelectTrigger id="userId">
            <SelectValue placeholder="Seleccionar profesor">
              {selectedTeacher ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` : "Seleccionar profesor"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.firstName} {t.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.userId && <p className="text-xs text-destructive">{errors.userId.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="schedule">Horario</Label>
        <Input
          id="schedule"
          placeholder="18:00 - 20:00"
          {...register("schedule", { required: "El horario es requerido" })}
          aria-invalid={errors.schedule ? "true" : "false"}
        />
        {errors.schedule && <p className="text-xs text-destructive">{errors.schedule.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="days">Días</Label>
        <Input
          id="days"
          placeholder="Lunes, Miércoles, Viernes"
          {...register("days", { required: "Los días son requeridos" })}
          aria-invalid={errors.days ? "true" : "false"}
        />
        {errors.days && <p className="text-xs text-destructive">{errors.days.message}</p>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {group ? "Guardar cambios" : "Crear grupo"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
