import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMembers } from "@/features/members/hooks/useMembers";
import MemberList from "@/features/members/components/MemberList";
import MemberForm from "@/features/members/components/MemberForm";
import MemberFeesManager from "@/features/fees/components/MemberFeesManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import type { Member, CreateMemberInput, UpdateMemberInput } from "@/features/members/api/membersApi";

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
          <h1 className="text-3xl font-light tracking-tight">Gestión de Socios</h1>
          <p className="text-muted-foreground mt-1 text-sm">Administra los socios y sus aranceles deportivos</p>
        </div>
        <Button onClick={openCreate} variant="outline">
          <Plus data-icon="inline-start" />
          Nuevo Socio
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  {editingMember ? "Editar Socio" : "Nuevo Socio"}
                </CardTitle>
                <CardDescription>
                  {editingMember
                    ? `Modificando datos de ${editingMember.firstName} ${editingMember.lastName}`
                    : "Completa los datos del nuevo socio"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemberForm
                  member={editingMember}
                  onSubmit={editingMember ? handleEdit : handleAdd}
                  onCancel={closeForm}
                  isLoading={isSubmitting}
                  error={formError}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <MemberFeesManager />
      </div>

      <Card>
        <CardContent className="pt-6">
          <MemberList
            members={members}
            isLoading={isLoading}
            error={error}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
