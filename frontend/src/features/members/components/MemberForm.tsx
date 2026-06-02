import { useForm } from "react-hook-form";
import type { CreateMemberInput, UpdateMemberInput, Member } from "../api/membersApi";
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

type MemberFormProps = {
  member?: Member | null;
  onSubmit: (data: CreateMemberInput | UpdateMemberInput) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
};

type FormInputs = {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  contact: string;
  socialFeePaid: string;
  accumulatedDebt: number;
};

export default function MemberForm({ member, onSubmit, onCancel, isLoading, error }: MemberFormProps) {
  const isEditing = !!member;
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      firstName: member?.firstName || "",
      lastName: member?.lastName || "",
      dni: member?.dni || "",
      birthDate: member?.birthDate ? member.birthDate.split("T")[0] : "",
      contact: member?.contact || "",
      socialFeePaid: member?.socialFeePaid ? "true" : "false",
      accumulatedDebt: member?.accumulatedDebt ?? 0,
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    const payload: CreateMemberInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      birthDate: data.birthDate,
      contact: data.contact || undefined,
      socialFeePaid: data.socialFeePaid === "true",
      accumulatedDebt: Number(data.accumulatedDebt) || 0,
    };
    onSubmit(payload);
  });

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">Nombre</Label>
          <Input
            id="firstName"
            placeholder="Juan"
            {...register("firstName", { required: "El nombre es requerido" })}
            aria-invalid={errors.firstName ? "true" : "false"}
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Apellido</Label>
          <Input
            id="lastName"
            placeholder="Pérez"
            {...register("lastName", { required: "El apellido es requerido" })}
            aria-invalid={errors.lastName ? "true" : "false"}
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="dni">DNI</Label>
          <Input
            id="dni"
            placeholder="12345678"
            {...register("dni", { required: "El DNI es requerido" })}
            aria-invalid={errors.dni ? "true" : "false"}
          />
          {errors.dni && <p className="text-xs text-destructive">{errors.dni.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="birthDate">Fecha de nacimiento</Label>
          <Input
            id="birthDate"
            type="date"
            {...register("birthDate", { required: "La fecha de nacimiento es requerida" })}
            aria-invalid={errors.birthDate ? "true" : "false"}
          />
          {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact">Contacto (teléfono/email)</Label>
        <Input id="contact" placeholder="341-555-1234" {...register("contact")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="socialFeePaid">Cuota social</Label>
          <Select defaultValue={member?.socialFeePaid ? "true" : "false"}>
            <SelectTrigger id="socialFeePaid">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Pendiente</SelectItem>
              <SelectItem value="true">Pagada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="accumulatedDebt">Deuda acumulada ($)</Label>
          <Input
            id="accumulatedDebt"
            type="number"
            step="0.01"
            {...register("accumulatedDebt", { valueAsNumber: true })}
          />
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
          {isEditing ? "Guardar cambios" : "Crear socio"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
