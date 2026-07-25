import { useState } from "react";
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
import type { Teacher } from "@/features/disciplines/api/disciplinesApi";

const CATEGORIES = ["Menor", "Infantil", "Juvenil", "Adulto", "Senior"];

interface DisciplineFormProps {
  teachers: Teacher[];
  onSubmit: (data: {
    name: string;
    category: string;
    schedule: string;
    days: string;
    userId: number;
    amount: number;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function DisciplineForm({ teachers, onSubmit, onCancel, isLoading, error }: DisciplineFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [schedule, setSchedule] = useState("");
  const [days, setDays] = useState("");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");

  const selectedTeacher = teachers.find((t) => String(t.id) === userId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      category,
      schedule,
      days,
      userId: Number(userId),
      amount: Number(amount),
    });
  };

  const isValid = name && category && schedule && days && userId && amount;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="disc-name">Nombre de la disciplina</Label>
        <Input
          id="disc-name"
          placeholder="Fútbol"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="disc-category">Categoría</Label>
          <Select value={category} onValueChange={(v) => setCategory(v || "")}>
            <SelectTrigger id="disc-category">
              <SelectValue placeholder="Seleccionar...">
                {category || "Seleccionar..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="disc-amount">Monto arancel ($)</Label>
          <Input
            id="disc-amount"
            type="number"
            step="0.01"
            placeholder="1500.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="disc-schedule">Horario</Label>
          <Input
            id="disc-schedule"
            placeholder="18:00 - 20:00"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="disc-days">Días</Label>
          <Input
            id="disc-days"
            placeholder="Lunes, Miércoles"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="disc-teacher">Profesor</Label>
        <Select value={userId} onValueChange={(v) => setUserId(v || "")}>
          <SelectTrigger id="disc-teacher">
            <SelectValue placeholder="Seleccionar profesor...">
              {selectedTeacher
                ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`
                : "Seleccionar profesor..."}
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
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={isLoading || !isValid} className="flex-1">
          {isLoading && <Loader2 data-icon="inline-start" className="animate-spin" />}
          Crear disciplina
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
