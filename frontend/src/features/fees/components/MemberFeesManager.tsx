import { useState } from "react";
import { useMemberFees, useFees } from "@/features/fees/hooks/useFees";
import { useMembers } from "@/features/members/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Receipt } from "lucide-react";

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

  const selectedMember = members.find((m) => String(m.id) === selectedMemberId);
  const selectedFee = fees.find((f) => String(f.id) === selectedFeeId);

  const availableFees = fees.filter(
    (fee) =>
      !memberFees.some((mf) => mf.feeId === fee.id) &&
      fee.category === selectedMember?.category
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="flex flex-col gap-2">
          <Label htmlFor="memberSelect">Socio</Label>
          <Select value={selectedMemberId} onValueChange={(v) => { setSelectedMemberId(v ?? ""); setSelectedFeeId(""); }}>
            <SelectTrigger id="memberSelect">
              <SelectValue placeholder="Seleccionar socio...">
                {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName} (${selectedMember.dni})` : "Seleccionar socio..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.firstName} {m.lastName} ({m.dni})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="feeSelect">Arancel a asignar</Label>
          <Select value={selectedFeeId} onValueChange={(v) => setSelectedFeeId(v ?? "")} disabled={!selectedMemberId || availableFees.length === 0}>
            <SelectTrigger id="feeSelect">
              <SelectValue placeholder={
                !selectedMemberId
                  ? "Primero selecciona un socio"
                  : availableFees.length === 0
                  ? "No hay aranceles para su categoría"
                  : "Seleccionar arancel..."
              }>
                {selectedFee
                  ? `${selectedFee.name} - $${Number(selectedFee.amount).toFixed(2)}`
                  : !selectedMemberId
                  ? "Primero selecciona un socio"
                  : availableFees.length === 0
                  ? "No hay aranceles para su categoría"
                  : "Seleccionar arancel..."}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableFees.map((fee) => (
                <SelectItem key={fee.id} value={String(fee.id)}>
                  {fee.name} - ${Number(fee.amount).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAssign}
          disabled={!selectedMemberId || !selectedFeeId}
          variant="outline"
        >
          Asignar Arancel
        </Button>
      </div>

      {selectedMemberId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Aranceles del Socio</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : memberFees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                <Receipt className="size-8 mb-2 opacity-40" />
                <p>Este socio no tiene aranceles asignados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arancel</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberFees.map((mf) => (
                      <TableRow key={mf.id}>
                        <TableCell className="font-medium">
                          {mf.fee.name}
                          {mf.fee.discipline && (
                            <span className="text-muted-foreground text-xs block">
                              {mf.fee.discipline.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>${Number(mf.fee.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={mf.paid ? "secondary" : "destructive"}>
                            {mf.paid ? "Pagado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
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
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemove(mf.feeId)}
                            >
                              Quitar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
