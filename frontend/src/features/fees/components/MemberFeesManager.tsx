import { useState } from "react";
import { useMemberFees, useFees } from "@/features/fees/hooks/useFees";
import { useMembers } from "@/features/members/hooks/useMembers";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";

export default function MemberFeesManager() {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [selectedFeeId, setSelectedFeeId] = useState<string>("");
  const { members } = useMembers();
  const { fees } = useFees();
  const {
    memberFees,
    isLoading,
    error,
    assignFeeToMember,
    togglePaid,
    removeAssignment,
  } = useMemberFees(selectedMemberId ? Number(selectedMemberId) : null);

  const handleAssign = async () => {
    if (!selectedMemberId || !selectedFeeId) return;
    await assignFeeToMember({
      memberId: Number(selectedMemberId),
      feeId: Number(selectedFeeId),
      paid: false,
    });
    setSelectedFeeId("");
    window.dispatchEvent(new Event("members:refresh"));
  };

  const handleToggle = async (data: { memberId: number; feeId: number; paid: boolean }) => {
    await togglePaid(data);
    window.dispatchEvent(new Event("members:refresh"));
  };

  const handleRemove = async (feeId: number) => {
    await removeAssignment(feeId);
    window.dispatchEvent(new Event("members:refresh"));
  };

  const availableFees = fees.filter(
    (fee) => !memberFees.some((mf) => mf.feeId === fee.id)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Socio</label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          >
            <option value="">Seleccionar socio...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName} ({m.dni})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Arancel a asignar</label>
          <select
            value={selectedFeeId}
            onChange={(e) => setSelectedFeeId(e.target.value)}
            disabled={!selectedMemberId || availableFees.length === 0}
            className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50"
          >
            <option value="">
              {!selectedMemberId
                ? "Primero selecciona un socio"
                : availableFees.length === 0
                ? "No hay aranceles disponibles"
                : "Seleccionar arancel..."}
            </option>
            {availableFees.map((fee) => (
              <option key={fee.id} value={fee.id}>
                {fee.name} - ${Number(fee.amount).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleAssign}
          disabled={!selectedMemberId || !selectedFeeId}
          variant="secondary"
        >
          Asignar Arancel
        </Button>
      </div>

      {selectedMemberId && (
        <Card title="Aranceles del Socio">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <Alert>{error}</Alert>
          ) : memberFees.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Este socio no tiene aranceles asignados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-3 text-slate-400 font-medium text-sm">Arancel</th>
                    <th className="pb-3 text-slate-400 font-medium text-sm">Monto</th>
                    <th className="pb-3 text-slate-400 font-medium text-sm">Estado</th>
                    <th className="pb-3 text-slate-400 font-medium text-sm text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {memberFees.map((mf) => (
                    <tr key={mf.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 text-white font-medium">{mf.fee.name}</td>
                      <td className="py-4 text-slate-300">${Number(mf.fee.amount).toFixed(2)}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            mf.paid
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {mf.paid ? "Pagado" : "Pendiente"}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <Button
                          variant={mf.paid ? "danger" : "primary"}
                          size="sm"
                          onClick={() =>
                            handleToggle({
                              memberId: mf.memberId,
                              feeId: mf.feeId,
                              paid: !mf.paid,
                            })
                          }
                        >
                          {mf.paid ? "Marcar pendiente" : "Marcar pagado"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(mf.feeId)}
                        >
                          Quitar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
