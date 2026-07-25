import { useForm } from "react-hook-form";
import type { CreateMemberInput, Member } from "../api/membersApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

type MemberFormProps = {
  member?: Member | null;
  onSubmit: (data: CreateMemberInput) => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
};

type FormInputs = {
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  email: string;
  phone: string;
};

export default function MemberForm({ member, onSubmit, onCancel, isLoading, error }: MemberFormProps) {
  const isEditing = !!member;
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      firstName: member?.firstName || "",
      lastName: member?.lastName || "",
      dni: member?.dni || "",
      birthDate: member?.birthDate ? member.birthDate.split("T")[0] : "",
      email: member?.email || "",
      phone: member?.phone || "",
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    const payload: CreateMemberInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      dni: data.dni,
      birthDate: data.birthDate,
      email: data.email || undefined,
      phone: data.phone || undefined,
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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="juan@ejemplo.com"
            {...register("email", {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email inválido",
              },
            })}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="341-555-1234"
            {...register("phone")}
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
