import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDisciplines } from "@/features/disciplines/hooks/useDisciplines";
import { useAttendance } from "../hooks/useAttendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Calendar, Users, CheckSquare, Square } from "lucide-react";
import AttendanceStats from "../components/AttendanceStats";

export default function AttendancePage() {
  const { user } = useAuth();
  const isProfessor = user?.role?.name === "Professor";

  // Use useDisciplines hook to get classes.
  // If user is a Professor, only fetch their classes by passing their ID.
  const { classes, isLoadingClasses } = useDisciplines(isProfessor ? user.id : undefined);
  
  const {
    attendanceList,
    setAttendanceList,
    isLoading,
    error,
    fetchAttendanceList,
    saveAttendance,
  } = useAttendance();

  // Page layout state
  const [activeTab, setActiveTab] = useState<"take" | "reports">("take");
  
  // Selection state
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  
  const [isSaving, setIsSaving] = useState(false);

  // Set default class if available
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(String(classes[0].id));
    }
  }, [classes, selectedClassId]);

  // Load attendance list when class or date changes
  useEffect(() => {
    if (selectedClassId) {
      fetchAttendanceList(Number(selectedClassId), selectedDate);
    } else {
      setAttendanceList([]);
    }
  }, [selectedClassId, selectedDate, fetchAttendanceList, setAttendanceList]);

  // Handle checking/unchecking a student
  const handleTogglePresent = (memberId: number) => {
    setAttendanceList((prev) =>
      prev.map((r) => (r.memberId === memberId ? { ...r, present: !r.present } : r))
    );
  };

  // Toggle all students (Present / Absent)
  const handleToggleAll = (present: boolean) => {
    setAttendanceList((prev) => prev.map((r) => ({ ...r, present })));
  };

  // Submit attendance list to database
  const handleSave = async () => {
    if (!selectedClassId) return;

    setIsSaving(true);
    const records = attendanceList.map((r) => ({
      memberId: r.memberId,
      present: r.present,
    }));

    const success = await saveAttendance(Number(selectedClassId), selectedDate, records);
    setIsSaving(false);

    if (success) {
      toast.success("Asistencia registrada correctamente");
    } else {
      toast.error(error || "Error al guardar la asistencia");
    }
  };

  const selectedClassDetails = classes.find((c) => String(c.id) === selectedClassId);

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Registro de Asistencia</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isProfessor
              ? "Toma asistencia para tus clases y consulta reportes"
              : "Administra asistencias generales del club deportivo"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted rounded-lg p-1 self-start">
          <button
            onClick={() => setActiveTab("take")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "take"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Toma de Asistencia
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === "reports"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Estadísticas / Reportes
          </button>
        </div>
      </div>

      {activeTab === "take" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Configuración de Clase</CardTitle>
                <CardDescription>Selecciona la clase y la fecha correspondiente</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Class selector */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="classSelect">Clase</Label>
                  {isLoadingClasses ? (
                    <div className="text-sm text-muted-foreground">Cargando clases...</div>
                  ) : classes.length === 0 ? (
                    <div className="text-sm text-destructive font-medium">
                      No tienes clases asignadas.
                    </div>
                  ) : (
                    <select
                      id="classSelect"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.discipline.name} - #{c.id} ({c.days})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Date Selector */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dateSelect">Fecha</Label>
                  <div className="relative">
                    <input
                      id="dateSelect"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                {/* Details Section */}
                {selectedClassDetails && (
                  <div className="mt-4 pt-4 border-t text-sm space-y-2">
                    <h4 className="font-medium">Información de la Clase</h4>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profesor:</span>
                      <span className="font-medium">
                        {selectedClassDetails.user.firstName} {selectedClassDetails.user.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Horario:</span>
                      <span className="font-medium">{selectedClassDetails.schedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alumnos inscriptos:</span>
                      <span className="font-medium">{attendanceList.length}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* List/Checking Column */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium">Listado de Socios</CardTitle>
                  <CardDescription>Marca los socios presentes para el día seleccionado</CardDescription>
                </div>
                {attendanceList.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAll(true)}
                      className="text-xs h-8"
                    >
                      Todos Presente
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleAll(false)}
                      className="text-xs h-8 text-muted-foreground"
                    >
                      Todos Ausente
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 pt-4 flex flex-col justify-between">
                <div className="flex-1">
                  {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      Cargando listado de asistencia...
                    </div>
                  ) : !selectedClassId ? (
                    <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-lg">
                      Selecciona una clase para visualizar los alumnos.
                    </div>
                  ) : attendanceList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-lg">
                      No hay alumnos inscriptos en esta clase. 
                      {!isProfessor && " Agrégalos en la sección de Clases y Disciplinas."}
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-hidden bg-card">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground font-medium border-b text-left">
                          <tr>
                            <th className="p-3 w-12 text-center">Presente</th>
                            <th className="p-3">Socio</th>
                            <th className="p-3">DNI</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {attendanceList.map((row) => (
                            <tr
                              key={row.memberId}
                              onClick={() => handleTogglePresent(row.memberId)}
                              className="hover:bg-muted/40 cursor-pointer transition-colors"
                            >
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleTogglePresent(row.memberId)}
                                  className="text-primary hover:opacity-85 transition-opacity"
                                >
                                  {row.present ? (
                                    <CheckSquare className="size-5" />
                                  ) : (
                                    <Square className="size-5 text-muted-foreground" />
                                  )}
                                </button>
                              </td>
                              <td className="p-3 font-medium">
                                {row.firstName} {row.lastName}
                              </td>
                              <td className="p-3 text-muted-foreground">{row.dni}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {attendanceList.length > 0 && (
                  <div className="mt-6 pt-4 border-t flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Resumen:{" "}
                      <span className="font-semibold text-foreground">
                        {attendanceList.filter((r) => r.present).length} presentes
                      </span>{" "}
                      de {attendanceList.length} totales (
                      {Math.round(
                        (attendanceList.filter((r) => r.present).length / attendanceList.length) * 100
                      )}
                      %)
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
                      {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                      Guardar Asistencia
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Reportes de Actividad</CardTitle>
            <CardDescription>
              Concurrencia agregada y tasa de asistencia de cada clase grupal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceStats />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
