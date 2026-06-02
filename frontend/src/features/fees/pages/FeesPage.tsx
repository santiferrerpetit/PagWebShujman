import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFees, useAllAssignments } from "@/features/fees/hooks/useFees";
import { useMembers } from "@/features/members/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import type { SportsFee } from "@/features/fees/api/feesApi";

export default function FeesPage() {
  const { fees, isLoading, error, addFee, editFee, removeFee } = useFees();
  const { assignments, isLoading: assignmentsLoading, error: assignmentsError } = useAllAssignments();
  const { members } = useMembers();
  const [showForm, setShowForm] = useState(false);
  const [editingFee, setEditingFee] = useState<SportsFee | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterMemberId, setFilterMemberId] = useState<string>("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    name: string;
    amount: string;
    description: string;
  }>();

  const openCreate = () => {
    setEditingFee(null);
    setFormError(null);
    reset({ name: "", amount: "", description: "" });
    setShowForm(true);
  };

  const openEdit = (fee: SportsFee) => {
    setEditingFee(fee);
    setFormError(null);
    reset({
      name: fee.name,
      amount: String(fee.amount),
      description: fee.description || "",
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
      name: data.name,
      amount: Number(data.amount),
      description: data.description || undefined,
    };

    if (editingFee) {
      const result = await editFee(editingFee.id, payload);
      if (result) closeForm();
      else setFormError(error || "Error al actualizar arancel");
    } else {
      const result = await addFee(payload);
      if (result) closeForm();
      else setFormError(error || "Error al crear arancel");
    }

    setIsSubmitting(false);
  });

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este arancel?")) return;
    await removeFee(id);
  };

  const filteredAssignments = filterMemberId
    ? assignments.filter((a) => a.memberId === Number(filterMemberId))
    : assignments;

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Aranceles Deportivos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestiona los aranceles disponibles y sus pagos</p>
        </div>
        <Button onClick={openCreate} variant="outline">
          <Plus data-icon="inline-start" />
          Nuevo Arancel
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {editingFee ? "Editar Arancel" : "Nuevo Arancel"}
              </CardTitle>
              <CardDescription>
                {editingFee ? `Modificando: ${editingFee.name}` : "Completa los datos del arancel"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Cuota Fútbol"
                    {...register("name", { required: "El nombre es requerido" })}
                    aria-invalid={errors.name ? "true" : "false"}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="amount">Monto ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="1500.00"
                    {...register("amount", { required: "El monto es requerido" })}
                    aria-invalid={errors.amount ? "true" : "false"}
                  />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Arancel mensual para práctica de fútbol"
                    {...register("description")}
                  />
                </div>

                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-1">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
                    {editingFee ? "Guardar cambios" : "Crear arancel"}
                  </Button>
                  <Button type="button" variant="outline" onClick={closeForm} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base font-medium">Aranceles Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : fees.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <p className="font-medium">No hay aranceles registrados</p>
              <p className="text-xs mt-1">Agrega un nuevo arancel para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.name}</TableCell>
                      <TableCell>${Number(fee.amount).toFixed(2)}</TableCell>
                      <TableCell>{fee.description || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(fee)}>
                            <Pencil data-icon="inline-start" />
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(fee.id)}>
                            <Trash2 data-icon="inline-start" />
                            Eliminar
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Asignaciones a Socios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 max-w-sm">
            <Label htmlFor="filterMember" className="mb-2 block">Filtrar por socio</Label>
            <Select value={filterMemberId} onValueChange={(v) => setFilterMemberId(v ?? "")}>
              <SelectTrigger id="filterMember">
                <SelectValue placeholder="Todos los socios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los socios</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.firstName} {m.lastName} ({m.dni})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {assignmentsLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : assignmentsError ? (
            <Alert variant="destructive">
              <AlertDescription>{assignmentsError}</AlertDescription>
            </Alert>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <p className="font-medium">
                {filterMemberId ? "Este socio no tiene aranceles asignados" : "No hay asignaciones registradas"}
              </p>
              <p className="text-xs mt-1">
                {filterMemberId ? "" : "Asigna aranceles a socios desde la página de socios"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Socio</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Arancel</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.member?.firstName} {assignment.member?.lastName}
                      </TableCell>
                      <TableCell>{assignment.member?.dni}</TableCell>
                      <TableCell>{assignment.fee.name}</TableCell>
                      <TableCell>${Number(assignment.fee.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.paid ? "secondary" : "destructive"}>
                          {assignment.paid ? "Pagado" : "Pendiente"}
                        </Badge>
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
  );
}
