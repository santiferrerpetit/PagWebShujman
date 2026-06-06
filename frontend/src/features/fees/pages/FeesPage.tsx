import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSocialFees, useGenerateMonthFees } from "@/features/fees/hooks/useSocialFees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Pencil, Trash2, CalendarDays } from "lucide-react";
import type { SocialFee } from "@/features/fees/api/socialFeesApi";

const CATEGORIES = ["Menor", "Infantil", "Juvenil", "Adulto", "Senior"];

export default function FeesPage() {
  const { fees, isLoading, error, addFee, editFee, removeFee } = useSocialFees();
  const { generate, isLoading: generating } = useGenerateMonthFees();
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState<SocialFee | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    category: string;
    amount: string;
    dueDay: string;
  }>();

  const openCreate = () => {
    setEditingFee(null);
    setFormError(null);
    reset({ category: "", amount: "", dueDay: "10" });
    setShowForm(true);
  };

  const openEdit = (fee: SocialFee) => {
    setEditingFee(fee);
    setFormError(null);
    reset({
      category: fee.category,
      amount: String(fee.amount),
      dueDay: String(fee.dueDay),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFee(null);
    setFormError(null);
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    setFormError(null);
    const payload = {
      category: data.category,
      amount: Number(data.amount),
      dueDay: Number(data.dueDay),
    };
    if (editingFee) {
      const result = await editFee(editingFee.id, payload);
      if (result) closeForm();
      else setFormError(error || "Error al actualizar cuota social");
    } else {
      const result = await addFee(payload);
      if (result) closeForm();
      else setFormError(error || "Error al crear cuota social");
    }
    setIsSubmitting(false);
  });

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta cuota social?")) return;
    await removeFee(id);
  };

  const handleGenerate = async () => {
    const now = new Date();
    const result = await generate({ month: now.getMonth() + 1, year: now.getFullYear() });
    if (result) {
      window.dispatchEvent(new Event("members:refresh"));
      alert(`Se generaron ${result.created} cuotas sociales para el mes actual.`);
    }
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight">Cuotas Sociales</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Configura los montos por categoría y genera las cuotas del mes
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={openCreate} variant="outline">
            <Plus data-icon="inline-start" />
            Nueva Cuota Social
          </Button>
          <Button onClick={handleGenerate} variant="secondary" disabled={generating}>
            <CalendarDays data-icon="inline-start" />
            {generating ? "Generando..." : "Generar cuotas del mes"}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {editingFee ? "Editar Cuota Social" : "Nueva Cuota Social"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="flex flex-col gap-4 max-w-md">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sf-category">Categoría</Label>
                  <Select defaultValue={editingFee?.category} onValueChange={(v) => setValue("category", v || "", { shouldValidate: true })}>
                    <SelectTrigger id="sf-category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sf-amount">Monto ($)</Label>
                  <Input id="sf-amount" type="number" step="0.01" {...register("amount", { required: "El monto es requerido" })} />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sf-dueDay">Día de vencimiento</Label>
                  <Input id="sf-dueDay" type="number" min={1} max={31} {...register("dueDay", { required: "El día de vencimiento es requerido" })} />
                  {errors.dueDay && <p className="text-xs text-destructive">{errors.dueDay.message}</p>}
                </div>
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
                    {editingFee ? "Guardar" : "Crear"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeForm} className="flex-1">Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Montos de Cuota Social por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : error ? (
              <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
            ) : fees.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                <p className="font-medium">No hay cuotas sociales configuradas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Vencimiento (día)</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">{fee.category}</TableCell>
                        <TableCell>${Number(fee.amount).toFixed(2)}</TableCell>
                        <TableCell>{fee.dueDay}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(fee)}>
                              <Pencil data-icon="inline-start" /> Editar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(fee.id)}>
                              <Trash2 data-icon="inline-start" /> Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
