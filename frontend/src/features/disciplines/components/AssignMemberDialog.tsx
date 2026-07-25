import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus } from "lucide-react";
import type { Member } from "@/features/members/api/membersApi";

interface AssignMemberDialogProps {
  members: Member[];
  onAssign: (memberId: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function AssignMemberDialog({ members, onAssign, isLoading, error }: AssignMemberDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const selectedMember = members.find((m) => String(m.id) === selectedMemberId);

  const availableMembers = members;

  const handleAssign = async () => {
    if (!selectedMemberId) return;
    setSubmitting(true);
    setLocalError(null);
    try {
      await onAssign(Number(selectedMemberId));
      setOpen(false);
      setSelectedMemberId("");
    } catch (err: any) {
      setLocalError(err.message || "Error al asignar socio");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          <UserPlus data-icon="inline-start" />
          Asignar socio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar socio al grupo</DialogTitle>
          <DialogDescription>Seleccioná un socio para agregarlo al grupo de práctica.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Select value={selectedMemberId} onValueChange={(v) => setSelectedMemberId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar socio">
                {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName} (${selectedMember.dni})` : "Seleccionar socio"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableMembers.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.firstName} {m.lastName} ({m.dni})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(error || localError) && (
            <Alert variant="destructive">
              <AlertDescription>{localError || error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleAssign} disabled={!selectedMemberId || submitting || isLoading}>
            {submitting && <Loader2 data-icon="inline-start" className="animate-spin" />}
            Asignar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
