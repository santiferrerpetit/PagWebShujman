import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDisciplines } from "../hooks/useDisciplines";
import { useMembers } from "@/features/members/hooks/useMembers";
import { getUsersApi, type User } from "@/features/auth/api/authApi";
import DisciplineForm from "../components/DisciplineForm";
import ClassForm from "../components/ClassForm";
import ClassEnrollmentManager from "../components/ClassEnrollmentManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Users, Calendar, Clock as ClockIcon, BookOpen } from "lucide-react";
import type { Discipline, GroupClass, CreateDisciplineInput, CreateClassInput } from "../api/disciplinesApi";

export default function DisciplinesPage() {
  const {
    disciplines,
    isLoading: isLoadingDiscs,
    error: discsError,
    addDiscipline,
    editDiscipline,
    removeDiscipline,
    classes,
    isLoadingClasses,
    classesError,
    addClass,
    editClass,
    removeClass,
    enroll,
    unenroll,
  } = useDisciplines();

  const { members } = useMembers();

  // State for professors
  const [professors, setProfessors] = useState<User[]>([]);
  const [isLoadingProfs, setIsLoadingProfs] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<"classes" | "disciplines">("classes");
  const [showDiscForm, setShowDiscForm] = useState(false);
  const [editingDisc, setEditingDisc] = useState<Discipline | null>(null);
  
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<GroupClass | null>(null);
  const [activeClassForEnrollment, setActiveClassForEnrollment] = useState<GroupClass | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProfessors() {
      setIsLoadingProfs(true);
      try {
        const users = await getUsersApi();
        // Filter users that have role "Professor" or "Administrator"
        const filtered = users.filter((u) => u.role.name === "Professor" || u.role.name === "Administrator");
        setProfessors(filtered);
      } catch (err) {
        console.error("Error loading professors", err);
      } finally {
        setIsLoadingProfs(false);
      }
    }
    loadProfessors();
  }, []);

  // Sync the active class detail if the classes array changes (after enroll/unenroll)
  useEffect(() => {
    if (activeClassForEnrollment) {
      const updated = classes.find((c) => c.id === activeClassForEnrollment.id);
      if (updated) {
        setActiveClassForEnrollment(updated);
      }
    }
  }, [classes, activeClassForEnrollment]);

  // --- Discipline Actions ---
  const handleDiscSubmit = async (data: CreateDisciplineInput) => {
    setIsSubmitting(true);
    setFormError(null);
    let result;
    if (editingDisc) {
      result = await editDiscipline(editingDisc.id, data);
    } else {
      result = await addDiscipline(data);
    }
    setIsSubmitting(false);
    if (result) {
      setShowDiscForm(false);
      setEditingDisc(null);
    } else {
      setFormError(discsError || "Error al procesar disciplina");
    }
  };

  const handleDiscDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta disciplina?")) return;
    await removeDiscipline(id);
  };

  // --- Class Actions ---
  const handleClassSubmit = async (data: CreateClassInput) => {
    setIsSubmitting(true);
    setFormError(null);
    let result;
    if (editingClass) {
      result = await editClass(editingClass.id, data);
    } else {
      result = await addClass(data);
    }
    setIsSubmitting(false);
    if (result) {
      setShowClassForm(false);
      setEditingClass(null);
    } else {
      setFormError(classesError || "Error al procesar clase");
    }
  };

  const handleClassDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta clase?")) return;
    await removeClass(id);
  };

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Clases y Disciplinas</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestiona deportes, horarios, profesores e inscripciones</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted rounded-lg p-1 self-start">
          <button
            onClick={() => {
              setActiveTab("classes");
              setActiveClassForEnrollment(null);
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "classes"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Clases Grupales
          </button>
          <button
            onClick={() => {
              setActiveTab("disciplines");
              setActiveClassForEnrollment(null);
            }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "disciplines"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Deportes/Disciplinas
          </button>
        </div>
      </div>

      {activeTab === "disciplines" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Area */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  {editingDisc ? "Editar Disciplina" : "Nueva Disciplina"}
                </CardTitle>
                <CardDescription>
                  {editingDisc ? `Modificando ${editingDisc.name}` : "Crea una nueva disciplina deportiva del club"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DisciplineForm
                  key={editingDisc ? editingDisc.id : "new-disc"}
                  discipline={editingDisc}
                  onSubmit={handleDiscSubmit}
                  onCancel={() => {
                    setEditingDisc(null);
                    setFormError(null);
                  }}
                  isLoading={isSubmitting}
                  error={formError}
                />
              </CardContent>
            </Card>
          </div>

          {/* List Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                {isLoadingDiscs ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">Cargando disciplinas...</div>
                ) : disciplines.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                    No hay disciplinas registradas. Créalas en el panel de la izquierda.
                  </div>
                ) : (
                  <div className="border rounded-md overflow-hidden bg-card">
                    <table className="w-full text-sm">
                      <thead className="bg-muted text-muted-foreground font-medium border-b text-left">
                        <tr>
                          <th className="p-3">Nombre</th>
                          <th className="p-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {disciplines.map((d) => (
                          <tr key={d.id} className="hover:bg-muted/40 transition-colors">
                            <td className="p-3 font-medium">{d.name}</td>
                            <td className="p-3 text-right flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingDisc(d);
                                  setFormError(null);
                                }}
                              >
                                <Edit2 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDiscDelete(d.id)}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "classes" && (
        <div className="flex flex-col gap-6">
          {/* Action button */}
          {!showClassForm && !activeClassForEnrollment && (
            <Button
              onClick={() => {
                setEditingClass(null);
                setShowClassForm(true);
                setFormError(null);
              }}
              variant="outline"
              className="self-start"
            >
              <Plus className="size-4 mr-2" />
              Nueva Clase Grupal
            </Button>
          )}

          {/* Collapsible Forms */}
          <AnimatePresence>
            {showClassForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      {editingClass ? "Editar Clase Grupal" : "Nueva Clase Grupal"}
                    </CardTitle>
                    <CardDescription>
                      Asigna un deporte, un profesor/entrenador, y define los días y horarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClassForm
                      key={editingClass ? editingClass.id : "new-class"}
                      groupClass={editingClass}
                      disciplines={disciplines}
                      professors={professors}
                      onSubmit={handleClassSubmit}
                      onCancel={() => {
                        setShowClassForm(false);
                        setEditingClass(null);
                        setFormError(null);
                      }}
                      isLoading={isSubmitting}
                      error={formError}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Classes Grid */}
            <div className={`${activeClassForEnrollment ? "lg:col-span-2" : "lg:col-span-3"} flex flex-col gap-4`}>
              {isLoadingClasses || isLoadingProfs ? (
                <div className="text-center py-12 text-muted-foreground text-sm bg-card border rounded-lg">
                  Cargando clases y profesores...
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-lg bg-card">
                  No hay clases grupales creadas. Crea una nueva para comenzar.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((c) => {
                    const isSelected = activeClassForEnrollment?.id === c.id;
                    return (
                      <Card
                        key={c.id}
                        className={`hover:shadow-md transition-all flex flex-col ${
                          isSelected ? "border-primary ring-1 ring-primary" : ""
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                              {c.discipline.name}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingClass(c);
                                  setShowClassForm(true);
                                  setFormError(null);
                                }}
                                className="h-7 w-7 p-0"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClassDelete(c.id);
                                }}
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg font-medium mt-3">
                            Clase #{c.id} - {c.discipline.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Prof: {c.user.firstName} {c.user.lastName}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                          <div className="space-y-2 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-4 text-muted-foreground/70" />
                              <span>{c.days}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="size-4 text-muted-foreground/70" />
                              <span>{c.schedule}</span>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Users className="size-4" />
                              <span>{c._count?.memberGroups || 0} alumnos</span>
                            </div>
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setActiveClassForEnrollment(isSelected ? null : c);
                                setShowClassForm(false);
                              }}
                            >
                              Alumnos
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar Enrollment Manager */}
            {activeClassForEnrollment && (
              <div className="lg:col-span-1">
                <Card className="sticky top-20 border-primary/45 shadow-lg">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          Alumnos Inscriptos
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {activeClassForEnrollment.discipline.name} ({activeClassForEnrollment.days} | {activeClassForEnrollment.schedule})
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveClassForEnrollment(null)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ClassEnrollmentManager
                      groupClass={activeClassForEnrollment}
                      members={members}
                      onEnroll={enroll}
                      onUnenroll={unenroll}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
