/**
 * @fileoverview Página de gestión de socios con formulario de creación/edición,
 * tabla de socios y gestor de aranceles por socio.
 */

import { useState } from "react";
import { useMembers } from "@/features/members/hooks/useMembers";
import MemberList from "@/features/members/components/MemberList";
import MemberForm from "@/features/members/components/MemberForm";
import MemberFeesManager from "@/features/fees/components/MemberFeesManager";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { Member, CreateMemberInput, UpdateMemberInput } from "@/features/members/api/membersApi";

/**
 * Página principal de gestión de socios.
 * Integra creación, edición, eliminación y asignación de aranceles.
 *
 * @component
 * @returns {JSX.Element} Página de socios con CRUD y gestor de aranceles
 */
export default function MembersPage() {
  const { members, isLoading, error, addMember, editMember, removeMember } = useMembers();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (data: CreateMemberInput | UpdateMemberInput) => {
    setIsSubmitting(true);
    setFormError(null);
    const payload = data as CreateMemberInput;
    const result = await addMember(payload);
    setIsSubmitting(false);
    if (result) {
      setShowForm(false);
    } else {
      setFormError(error || "Error al crear socio");
    }
  };

  const handleEdit = async (data: UpdateMemberInput) => {
    if (!editingMember) return;
    setIsSubmitting(true);
    setFormError(null);
    const result = await editMember(editingMember.id, data);
    setIsSubmitting(false);
    if (result) {
      setEditingMember(null);
      setShowForm(false);
    } else {
      setFormError(error || "Error al actualizar socio");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que querés eliminar este socio?")) return;
    await removeMember(id);
  };

  const openCreate = () => {
    setEditingMember(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMember(null);
    setFormError(null);
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Socios</h1>
          <p className="text-slate-400 mt-1">Administra los socios y sus aranceles deportivos</p>
        </div>
        <Button onClick={openCreate} variant="secondary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Socio
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <Card
            title={editingMember ? "Editar Socio" : "Nuevo Socio"}
            subtitle={editingMember ? `Modificando datos de ${editingMember.firstName} ${editingMember.lastName}` : "Completa los datos del nuevo socio"}
          >
            <MemberForm
              member={editingMember}
              onSubmit={editingMember ? handleEdit : handleAdd}
              onCancel={closeForm}
              isLoading={isSubmitting}
              error={formError}
            />
          </Card>
        </div>
      )}

      {/* Gestión de Aranceles por Socio */}
      <div className="mb-8">
        <MemberFeesManager />
      </div>

      <Card>
        <MemberList
          members={members}
          isLoading={isLoading}
          error={error}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </Card>
    </div>
  );
}
