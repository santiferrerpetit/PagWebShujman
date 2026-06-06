import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { Discipline, CreateDisciplineInput, UpdateDisciplineInput } from "@/features/disciplines/api/disciplinesApi";

interface DisciplineFormProps {
  discipline?: Discipline | null;
  onSubmit: (data: CreateDisciplineInput | UpdateDisciplineInput) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function DisciplineForm({ discipline, onSubmit, onCancel, isLoading, error }: DisciplineFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ name: string }>({
    defaultValues: { name: discipline?.name || "" },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Fútbol"
          {...register("name", { required: "El nombre es requerido" })}
          aria-invalid={errors.name ? "true" : "false"}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {discipline ? "Guardar cambios" : "Crear disciplina"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
