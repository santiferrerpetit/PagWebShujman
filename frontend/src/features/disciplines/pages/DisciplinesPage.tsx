import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useDisciplines, useTeachers } from "@/features/disciplines/hooks/useDisciplines";
import DisciplineList from "@/features/disciplines/components/DisciplineList";
import DisciplineForm from "@/features/disciplines/components/DisciplineForm";
import { setupDiscipline } from "@/features/disciplines/api/disciplinesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Users, Clock, ArrowRight, Dumbbell, Loader2 } from "lucide-react";
import type { Discipline } from "@/features/disciplines/api/disciplinesApi";

function getTotalMembers(discipline: Discipline): number {
  return discipline.groupClasses.reduce((sum, g) => sum + (g._count?.memberGroups ?? 0), 0);
}

export default function DisciplinesPage() {
  const { disciplines, isLoading, error, editDiscipline, removeDiscipline, fetchDisciplines } = useDisciplines();
  const { teachers } = useTeachers();
  const [showForm, setShowForm] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [editName, setEditName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetup = async (data: {
    name: string;
    category: string;
    schedule: string;
    days: string;
    userId: number;
    amount: number;
  }) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      await setupDiscipline(data);
      await fetchDisciplines();
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message || "Error al crear disciplina");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingDiscipline || !editName.trim()) return;
    setIsSubmitting(true);
    setFormError(null);
    const result = await editDiscipline(editingDiscipline.id, { name: editName.trim() });
    setIsSubmitting(false);
    if (result) {
      setEditingDiscipline(null);
      setShowForm(false);
    } else {
      setFormError(error || "Error al actualizar disciplina");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta disciplina? Se eliminarán también sus grupos y aranceles.")) return;
    await removeDiscipline(id);
  };

  const openCreate = () => {
    setEditingDiscipline(null);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
    setEditName(discipline.name);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDiscipline(null);
    setFormError(null);
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Disciplinas</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gestiona los deportes, grupos de práctica y aranceles del club
          </p>
        </div>
        <Button onClick={openCreate} variant="outline">
          <Plus data-icon="inline-start" />
          Nueva Disciplina
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
                  {editingDiscipline ? "Editar Disciplina" : "Nueva Disciplina"}
                </CardTitle>
                <CardDescription>
                  {editingDiscipline
                    ? `Modificando: ${editingDiscipline.name}`
                    : "Completá los datos de la disciplina, grupo y arancel"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingDiscipline ? (
                  <div className="flex flex-col gap-4 max-w-md">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="edit-name">Nombre</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    {formError && (
                      <Alert variant="destructive">
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="flex gap-3">
                      <Button onClick={handleEdit} disabled={isSubmitting} className="flex-1">
                        {isSubmitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={closeForm} className="flex-1">Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <DisciplineForm
                    teachers={teachers}
                    onSubmit={handleSetup}
                    onCancel={closeForm}
                    isLoading={isSubmitting}
                    error={formError}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : disciplines.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Dumbbell className="size-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No hay disciplinas registradas</p>
          <p className="text-xs mt-1">Agregá una nueva disciplina para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((discipline) => {
            const totalMembers = getTotalMembers(discipline);
            const totalGroups = discipline.groupClasses.length;
            const feesConfigured = discipline.sportsFees?.length ?? 0;
            return (
              <Link
                key={discipline.id}
                to={`/disciplines/${discipline.id}`}
                className="group"
              >
                <Card className="h-full transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                        {discipline.name}
                      </CardTitle>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="size-4" />
                        <span>{totalMembers} socios</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-4" />
                        <span>{totalGroups} grupos</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {discipline.sportsFees?.map((fee) => (
                        <Badge key={fee.id} variant="outline" className="text-xs">
                          {fee.category} ${Number(fee.amount).toFixed(0)}
                        </Badge>
                      ))}
                      {feesConfigured === 0 && (
                        <Badge variant="secondary" className="text-xs">Sin aranceles</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <DisciplineList
          disciplines={disciplines}
          isLoading={isLoading}
          error={error}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
