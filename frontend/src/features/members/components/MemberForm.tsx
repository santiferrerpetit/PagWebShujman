import { useForm } from "react-hook-form";
import type { CreateMemberInput, UpdateMemberInput, Member } from "../api/membersApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

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
    <form onSubmit={handleFormSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nombre"
          placeholder="Juan"
          {...register("firstName", { required: "El nombre es requerido" })}
          error={errors.firstName?.message}
        />
        <Input
          label="Apellido"
          placeholder="Pérez"
          {...register("lastName", { required: "El apellido es requerido" })}
          error={errors.lastName?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="DNI"
          placeholder="12345678"
          {...register("dni", { required: "El DNI es requerido" })}
          error={errors.dni?.message}
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          {...register("birthDate", { required: "La fecha de nacimiento es requerida" })}
          error={errors.birthDate?.message}
        />
      </div>

      <Input
        label="Contacto (teléfono/email)"
        placeholder="341-555-1234"
        {...register("contact")}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Cuota social</label>
          <select
            {...register("socialFeePaid")}
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          >
            <option value="false">Pendiente</option>
            <option value="true">Pagada</option>
          </select>
        </div>
        <Input
          label="Deuda acumulada ($)"
          type="number"
          step="0.01"
          {...register("accumulatedDebt", { valueAsNumber: true })}
        />
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {isEditing ? "Guardar cambios" : "Crear socio"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
