/**
 * @fileoverview Página de gestión de aranceles deportivos.
 * CRUD de aranceles, tabla de asignaciones con filtro por socio y vista de estados de pago.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useFees, useAllAssignments } from "@/features/fees/hooks/useFees";
import { useMembers } from "@/features/members/hooks/useMembers";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";
import type { SportsFee } from "@/features/fees/api/feesApi";

/**
 * Página de gestión de aranceles.
 * Permite crear, editar y eliminar aranceles.
 * Muestra tabla de asignaciones con filtro por socio.
 *
 * @component
 * @returns {JSX.Element} Página de aranceles con CRUD y tabla de asignaciones
 */
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
          <h1 className="text-3xl font-bold text-white">Aranceles Deportivos</h1>
          <p className="text-slate-400 mt-1">Gestiona los aranceles disponibles y sus pagos</p>
        </div>
        <Button onClick={openCreate} variant="secondary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Arancel
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <Card
            title={editingFee ? "Editar Arancel" : "Nuevo Arancel"}
            subtitle={editingFee ? `Modificando: ${editingFee.name}` : "Completa los datos del arancel"}
          >
            <form onSubmit={onSubmit} className="space-y-5">
              <Input
                label="Nombre"
                placeholder="Cuota Fútbol"
                {...register("name", { required: "El nombre es requerido" })}
                error={errors.name?.message}
              />
              <Input
                label="Monto ($)"
                type="number"
                step="0.01"
                placeholder="1500.00"
                {...register("amount", { required: "El monto es requerido" })}
                error={errors.amount?.message}
              />
              <Input
                label="Descripción (opcional)"
                placeholder="Arancel mensual para práctica de fútbol"
                {...register("description")}
              />

              {formError && <Alert>{formError}</Alert>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  {editingFee ? "Guardar cambios" : "Crear arancel"}
                </Button>
                <Button type="button" variant="ghost" onClick={closeForm} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Tabla de Aranceles */}
      <Card title="Aranceles Disponibles" className="mb-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <Alert>{error}</Alert>
        ) : fees.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg font-medium">No hay aranceles registrados</p>
            <p className="text-sm mt-1">Agrega un nuevo arancel para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-slate-400 font-medium text-sm">Nombre</th>
                  <th className="pb-3 text-slate-400 font-medium text-sm">Monto</th>
                  <th className="pb-3 text-slate-400 font-medium text-sm">Descripción</th>
                  <th className="pb-3 text-slate-400 font-medium text-sm text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 text-white font-medium">{fee.name}</td>
                    <td className="py-4 text-slate-300">${Number(fee.amount).toFixed(2)}</td>
                    <td className="py-4 text-slate-300">{fee.description || "—"}</td>
                    <td className="py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(fee)}>
                        Editar
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(fee.id)}>
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Tabla de Asignaciones */}
      <Card title="Asignaciones a Socios">
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">Filtrar por socio</label>
          <select
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-colors"
          >
            <option value="">Todos los socios</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} ({m.dni})
              </option>
            ))}
          </select>
        </div>

        {assignmentsLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          </div>
        ) : assignmentsError ? (
          <Alert>{assignmentsError}</Alert>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-lg font-medium">
              {filterMemberId ? "Este socio no tiene aranceles asignados" : "No hay asignaciones registradas"}
            </p>
            <p className="text-sm mt-1">
              {filterMemberId ? "" : "Asigna aranceles a socios desde la página de socios"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-slate-400 font-medium text-sm">Socio</th>
                  <th className="pb-3 text-slate-400 font-medium text-sm">DNI</th>
                  <th className="pb-3 text-slate-400 font-medium text-sm">Arancel</th>
                  <th className="pb-3 text-slate-400 font-medium text-sm">Monto</th>
                  <th className="pb-3 text-slate-400 font-medium text-sm">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 text-white font-medium">
                      {assignment.member?.firstName} {assignment.member?.lastName}
                    </td>
                    <td className="py-4 text-slate-300">{assignment.member?.dni}</td>
                    <td className="py-4 text-slate-300">{assignment.fee.name}</td>
                    <td className="py-4 text-slate-300">${Number(assignment.fee.amount).toFixed(2)}</td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.paid
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {assignment.paid ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
