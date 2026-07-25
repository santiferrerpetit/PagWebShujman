import { useEffect } from "react";
import { useAttendance } from "../hooks/useAttendance";
import { Loader2, TrendingUp, Users, Calendar } from "lucide-react";

export default function AttendanceStats() {
  const { stats, isLoadingStats, statsError, fetchStats } = useAttendance();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoadingStats) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
        <Loader2 className="size-6 animate-spin text-primary" />
        Cargando estadísticas de asistencia...
      </div>
    );
  }

  if (statsError) {
    return <div className="text-sm text-destructive font-medium text-center py-8">{statsError}</div>;
  }

  if (stats.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-lg">
        No hay registros de asistencia suficientes para generar estadísticas.
      </div>
    );
  }

  // Calculate aggregates
  const totalClasses = stats.length;
  const classesWithAttendance = stats.filter((s) => s.totalRecords > 0);
  const averageAttendanceRate =
    classesWithAttendance.length > 0
      ? Math.round(
          classesWithAttendance.reduce((sum, s) => sum + s.attendanceRate, 0) /
            classesWithAttendance.length
        )
      : 0;

  const totalEnrolled = stats.reduce((sum, s) => sum + s.enrolledCount, 0);

  return (
    <div className="flex flex-col gap-8">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="border rounded-xl p-5 bg-card flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">{averageAttendanceRate}%</div>
            <div className="text-xs text-muted-foreground">Tasa de Asistencia Promedio</div>
          </div>
        </div>

        <div className="border rounded-xl p-5 bg-card flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">{totalEnrolled}</div>
            <div className="text-xs text-muted-foreground">Alumnos Totales Inscriptos</div>
          </div>
        </div>

        <div className="border rounded-xl p-5 bg-card flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight">{totalClasses}</div>
            <div className="text-xs text-muted-foreground">Clases Activas Monitoreadas</div>
          </div>
        </div>
      </div>

      {/* Stats Table */}
      <div>
        <h3 className="text-sm font-medium mb-3">Detalle por Clase Grupal</h3>
        <div className="border rounded-md overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground font-medium border-b text-left">
              <tr>
                <th className="p-3">Deporte / Disciplina</th>
                <th className="p-3">Días y Horarios</th>
                <th className="p-3">Profesor</th>
                <th className="p-3 text-center">Inscriptos</th>
                <th className="p-3 text-center">Historial Registrado</th>
                <th className="p-3 text-right">Tasa de Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stats.map((s) => {
                // Determine color for rate
                let rateColor = "text-destructive bg-destructive/10";
                if (s.totalRecords === 0) {
                  rateColor = "text-muted-foreground bg-muted";
                } else if (s.attendanceRate >= 80) {
                  rateColor = "text-emerald-500 bg-emerald-50";
                } else if (s.attendanceRate >= 50) {
                  rateColor = "text-amber-500 bg-amber-50";
                }

                return (
                  <tr key={s.classId} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-semibold text-foreground">
                      {s.disciplineName}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (Clase #{s.classId})
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <div>{s.days}</div>
                      <div className="text-xs">{s.schedule}</div>
                    </td>
                    <td className="p-3 font-medium">{s.professorName}</td>
                    <td className="p-3 text-center">{s.enrolledCount}</td>
                    <td className="p-3 text-center text-muted-foreground">
                      {s.totalRecords > 0 ? `${s.totalRecords} logs` : "Sin registros"}
                    </td>
                    <td className="p-3 text-right">
                      {s.totalRecords > 0 ? (
                        <div className="inline-flex flex-col items-end">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${rateColor}`}>
                            {s.attendanceRate}%
                          </span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {s.presentsCount} presentes
                          </span>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${rateColor}`}>
                          N/A
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
