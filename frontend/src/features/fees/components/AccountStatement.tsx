import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, ChevronDown, ChevronRight, AlertTriangle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getAccountsSummary,
  getMemberAccount,
  type AccountsSummary,
  type MemberAccount,
} from "../api/accountApi";
import { toggleSocialFeePaid } from "../api/socialFeesApi";
import { toggleFeePaid } from "../api/feesApi";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const money = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-AR") : "—");

function MemberDetail({ memberId, onChanged }: { memberId: number; onChanged: () => void }) {
  const [account, setAccount] = useState<MemberAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setAccount(await getMemberAccount(memberId));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar el estado de cuenta");
    }
  }, [memberId]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (key: string, action: () => Promise<unknown>, okMessage: string) => {
    setBusyKey(key);
    try {
      await action();
      toast.success(okMessage);
      await load();
      onChanged();
    } catch (err: any) {
      toast.error(err.message || "No se pudo actualizar el pago");
    } finally {
      setBusyKey(null);
    }
  };

  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  if (!account) return <div className="py-4 flex justify-center"><Loader2 className="size-5 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Pendiente</div><div className="font-semibold">{money(account.balance.pendingTotal)}</div></div>
        <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Vencido</div><div className="font-semibold text-destructive">{money(account.balance.overdueTotal)}</div></div>
        <div className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Pagado</div><div className="font-semibold text-emerald-600">{money(account.balance.paidTotal)}</div></div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Cuotas sociales</h4>
        {account.socialFees.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin cuotas generadas.</p>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {account.socialFees.map((f) => (
                  <tr key={f.id}>
                    <td className="p-2.5 font-medium">{MONTHS[f.periodMonth - 1]} {f.periodYear}</td>
                    <td className="p-2.5 text-muted-foreground hidden sm:table-cell">Vence {date(f.dueDate)}</td>
                    <td className="p-2.5">{money(f.amount)}</td>
                    <td className="p-2.5">
                      {f.paid ? <span className="text-emerald-600 text-xs font-medium">Pagada {date(f.paidAt)}</span>
                        : f.overdue ? <span className="text-destructive text-xs font-medium">Vencida</span>
                        : <span className="text-amber-600 text-xs font-medium">Pendiente</span>}
                    </td>
                    <td className="p-2.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyKey === `s${f.id}`}
                        onClick={() => run(`s${f.id}`, () => toggleSocialFeePaid({ memberSocialFeeId: f.id, paid: !f.paid }), f.paid ? "Pago revertido" : "Pago registrado")}
                      >
                        {f.paid ? "Deshacer" : "Registrar pago"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Aranceles deportivos</h4>
        {account.sportsFees.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin aranceles asignados.</p>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {account.sportsFees.map((f) => (
                  <tr key={f.id}>
                    <td className="p-2.5 font-medium">{f.name} <span className="text-xs font-normal text-muted-foreground">{f.discipline}</span></td>
                    <td className="p-2.5">{money(f.amount)}</td>
                    <td className="p-2.5">
                      {f.paid ? <span className="text-emerald-600 text-xs font-medium">Pagado {date(f.paidAt)}</span>
                        : <span className="text-amber-600 text-xs font-medium">Pendiente</span>}
                    </td>
                    <td className="p-2.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyKey === `f${f.id}`}
                        onClick={() => run(`f${f.id}`, () => toggleFeePaid({ memberId, feeId: f.feeId, paid: !f.paid }), f.paid ? "Pago revertido" : "Pago registrado")}
                      >
                        {f.paid ? "Deshacer" : "Registrar pago"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountStatement() {
  const [summary, setSummary] = useState<AccountsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setSummary(await getAccountsSummary());
      setError(null);
    } catch (err: any) {
      setError(err.message || "Error al cargar estados de cuenta");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (summary?.members ?? []).filter(
      (m) =>
        (!onlyOverdue || m.overdueTotal > 0) &&
        (!q || `${m.firstName} ${m.lastName} ${m.dni}`.toLowerCase().includes(q)),
    );
  }, [summary, search, onlyOverdue]);

  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  if (!summary) return <div className="py-12 flex justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-5 flex items-center gap-3"><Wallet className="size-5 text-muted-foreground" /><div><div className="text-xl font-semibold">{money(summary.totals.pendingTotal)}</div><div className="text-xs text-muted-foreground">Total a cobrar</div></div></CardContent></Card>
        <Card><CardContent className="pt-5 flex items-center gap-3"><AlertTriangle className="size-5 text-destructive" /><div><div className="text-xl font-semibold text-destructive">{money(summary.totals.overdueTotal)}</div><div className="text-xs text-muted-foreground">Vencido</div></div></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="text-xl font-semibold">{summary.totals.debtors}</div><div className="text-xs text-muted-foreground">Socios con deuda vencida</div></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input placeholder="Buscar por nombre o DNI" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} />
          Solo con deuda vencida
        </label>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm border border-dashed rounded-lg">
          {summary.members.length === 0 ? "No hay socios con saldo pendiente." : "Ningún socio coincide con el filtro."}
        </div>
      ) : (
        <div className="border rounded-md divide-y bg-card">
          {rows.map((m) => (
            <div key={m.memberId}>
              <button
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
                onClick={() => setExpanded(expanded === m.memberId ? null : m.memberId)}
              >
                {expanded === m.memberId ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{m.firstName} {m.lastName}</div>
                  <div className="text-xs text-muted-foreground">DNI {m.dni} · {m.pendingCount} pendiente(s){m.overdueCount > 0 ? ` · ${m.overdueCount} vencida(s)` : ""}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{money(m.pendingTotal)}</div>
                  {m.overdueTotal > 0 && <div className="text-xs text-destructive">{money(m.overdueTotal)} vencido</div>}
                </div>
              </button>
              {expanded === m.memberId && (
                <div className="px-4 pb-4 border-t bg-muted/20">
                  <MemberDetail memberId={m.memberId} onChanged={load} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
