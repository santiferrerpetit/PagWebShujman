import { useEffect, useMemo, useState } from "react";
import { Loader2, TrendingUp, Users, CalendarCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAttendance } from "../hooks/useAttendance";
import type { ReportFilters } from "../api/attendanceApi";

type ClassOption = { id: number; discipline: { id: number; name: string }; days: string };

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function rateColor(rate: number) {
  if (rate >= 80) return "bg-emerald-500";
  if (rate >= 50) return "bg-amber-500";
  return "bg-destructive";
}

function formatDay(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AttendanceReports({ classes }: { classes: ClassOption[] }) {
  const { report, isLoadingReport, reportError, fetchReport } = useAttendance();
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [disciplineId, setDisciplineId] = useState("");
  const [groupClassId, setGroupClassId] = useState("");

  const disciplines = useMemo(() => {
    const map = new Map<number, string>();
    classes.forEach((c) => map.set(c.discipline.id, c.discipline.name));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [classes]);

  const classOptions = classes.filter((c) => !disciplineId || String(c.discipline.id) === disciplineId);

  useEffect(() => {
    const filters: ReportFilters = {
      from: from || undefined,
      to: to || undefined,
      disciplineId: disciplineId ? Number(disciplineId) : undefined,
      groupClassId: groupClassId ? Number(groupClassId) : undefined,
    };
    fetchReport(filters);
  }, [from, to, disciplineId, groupClassId, fetchReport]);

  const invalidRange = !!from && !!to && from > to;

  const exportCsv = () => {
    if (!report) return;
    downloadCsv(`asistencia_${from || "inicio"}_${to || "hoy"}.csv`, [
      ["Disciplina", "Días", "Horario", "Clases dictadas", "Registros", "Presentes", "Asistencia %"],
      ...report.byClass.map((c) => [c.disciplineName, c.days, c.schedule, c.sessions, c.total, c.presents, c.attendanceRate]),
    ]);
  };

  const maxDiscipline = Math.max(1, ...(report?.byDiscipline.map((d) => d.presents) ?? [1]));
  const maxDay = Math.max(1, ...(report?.byDay.map((d) => d.total) ?? [1]));

  return (
    <div className="flex flex-col gap-6">
      {/* Filtros */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rep-from">Desde</Label>
          <input id="rep-from" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={selectClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rep-to">Hasta</Label>
          <input id="rep-to" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={selectClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rep-discipline">Disciplina</Label>
          <select
            id="rep-discipline"
            value={disciplineId}
            onChange={(e) => {
              setDisciplineId(e.target.value);
              setGroupClassId("");
            }}
            className={selectClass}
          >
            <option value="">Todas</option>
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rep-class">Clase</Label>
          <select id="rep-class" value={groupClassId} onChange={(e) => setGroupClassId(e.target.value)} className={selectClass}>
            <option value="">Todas</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.discipline.name} #{c.id} ({c.days})</option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!report || report.byClass.length === 0} className="col-span-2 lg:col-span-1">
          <Download className="size-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {invalidRange && <p className="text-sm text-destructive">La fecha "desde" no puede ser posterior a "hasta".</p>}
      {reportError && !invalidRange && <p className="text-sm text-destructive font-medium">{reportError}</p>}

      {isLoadingReport && !report ? (
        <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center gap-2">
          <Loader2 className="size-6 animate-spin text-primary" />
          Cargando reportes...
        </div>
      ) : report && report.summary.totalRecords === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-lg">
          No hay registros de asistencia en el período y filtros seleccionados.
        </div>
      ) : report ? (
        <div className={`flex flex-col gap-8 transition-opacity ${isLoadingReport ? "opacity-60" : ""}`}>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, value: `${report.summary.attendanceRate}%`, label: "Tasa de asistencia" },
              { icon: CalendarCheck, value: report.summary.sessions, label: "Clases dictadas" },
              { icon: Users, value: report.summary.averagePerSession, label: "Concurrencia promedio por clase" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="border rounded-xl p-5 bg-card flex items-center gap-4 shadow-sm">
                <div className="p-3 rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></div>
                <div>
                  <div className="text-2xl font-semibold tracking-tight">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Concurrencia por disciplina */}
          <section>
            <h3 className="text-sm font-medium mb-3">Concurrencia por disciplina</h3>
            <div className="flex flex-col gap-3">
              {report.byDiscipline.map((d) => (
                <div key={d.disciplineId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-muted-foreground">
                      {d.presents} presentes · {d.attendanceRate}% · prom. {d.averagePerSession}/clase
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${rateColor(d.attendanceRate)}`} style={{ width: `${(d.presents / maxDiscipline) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Evolución diaria */}
          <section>
            <h3 className="text-sm font-medium mb-3">Evolución diaria (presentes sobre inscriptos registrados)</h3>
            <div className="overflow-x-auto pb-2">
              <div className="flex items-end gap-1.5 h-40 min-w-fit">
                {report.byDay.map((d) => (
                  <div key={d.date} className="flex flex-col items-center gap-1 w-8 shrink-0 h-full justify-end" title={`${formatDay(d.date)}: ${d.presents}/${d.total} (${d.attendanceRate}%)`}>
                    <div className="w-full flex flex-col justify-end bg-muted rounded-t-sm overflow-hidden" style={{ height: `${(d.total / maxDay) * 100}%` }}>
                      <div className={rateColor(d.attendanceRate)} style={{ height: `${d.attendanceRate}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{formatDay(d.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Detalle por clase */}
          <section>
            <h3 className="text-sm font-medium mb-3">Detalle por clase</h3>
            <div className="border rounded-md overflow-x-auto bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground font-medium border-b text-left">
                  <tr>
                    <th className="p-3">Disciplina</th>
                    <th className="p-3">Días y horario</th>
                    <th className="p-3 text-center">Clases</th>
                    <th className="p-3 text-center">Presentes</th>
                    <th className="p-3 text-right">Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.byClass.map((c) => (
                    <tr key={c.classId} className="hover:bg-muted/40">
                      <td className="p-3 font-medium">{c.disciplineName} <span className="text-xs font-normal text-muted-foreground">#{c.classId}</span></td>
                      <td className="p-3 text-muted-foreground"><div>{c.days}</div><div className="text-xs">{c.schedule}</div></td>
                      <td className="p-3 text-center">{c.sessions}</td>
                      <td className="p-3 text-center">{c.presents}/{c.total}</td>
                      <td className="p-3 text-right font-semibold">{c.attendanceRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Baja asistencia */}
          {report.lowAttendanceMembers.length > 0 && (
            <section>
              <h3 className="text-sm font-medium mb-1">Socios con baja asistencia</h3>
              <p className="text-xs text-muted-foreground mb-3">Menos del 50% de asistencia con al menos 3 registros en el período.</p>
              <div className="border rounded-md overflow-x-auto bg-card">
                <table className="w-full text-sm">
                  <tbody className="divide-y">
                    {report.lowAttendanceMembers.map((m) => (
                      <tr key={m.memberId}>
                        <td className="p-3 font-medium">{m.name}</td>
                        <td className="p-3 text-muted-foreground">{m.dni}</td>
                        <td className="p-3 text-right text-destructive font-semibold">{m.attendanceRate}% <span className="text-xs font-normal text-muted-foreground">({m.presents}/{m.total})</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  );
}
