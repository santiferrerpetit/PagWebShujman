import { useState } from "react";
import type { GroupClass } from "../api/disciplinesApi";
import type { Member } from "@/features/members/api/membersApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, UserPlus, Loader2 } from "lucide-react";

type ClassEnrollmentManagerProps = {
  groupClass: GroupClass;
  members: Member[];
  onEnroll: (classId: number, memberId: number) => Promise<boolean>;
  onUnenroll: (classId: number, memberId: number) => Promise<boolean>;
};

export default function ClassEnrollmentManager({
  groupClass,
  members,
  onEnroll,
  onUnenroll,
}: ClassEnrollmentManagerProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMemberId, setActionMemberId] = useState<number | null>(null);

  const enrolledIds = new Set(groupClass.memberGroups?.map((mg) => mg.member.id) || []);
  const availableMembers = members
    .filter((m) => !enrolledIds.has(m.id))
    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    setIsSubmitting(true);
    const success = await onEnroll(groupClass.id, Number(selectedMemberId));
    setIsSubmitting(false);

    if (success) {
      setSelectedMemberId("");
    }
  };

  const handleUnenroll = async (memberId: number) => {
    if (!confirm("¿Estás seguro de que querés desinscribir a este socio de la clase?")) return;

    setActionMemberId(memberId);
    await onUnenroll(groupClass.id, memberId);
    setActionMemberId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border rounded-lg p-4 bg-muted/40">
        <form onSubmit={handleEnroll} className="flex flex-col md:flex-row items-end gap-3">
          <div className="flex-1 flex flex-col gap-2">
            <Label htmlFor="enrollMemberSelect">Inscribir Socio a la Clase</Label>
            <select
              id="enrollMemberSelect"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Seleccione un socio para agregar...</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} (DNI: {m.dni})
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={isSubmitting || !selectedMemberId} className="h-9">
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="size-4 mr-2" />
                Inscribir
              </>
            )}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Socios Inscriptos ({groupClass.memberGroups?.length || 0})</h3>
        
        {(!groupClass.memberGroups || groupClass.memberGroups.length === 0) ? (
          <div className="text-center py-6 border rounded-lg border-dashed text-muted-foreground text-sm">
            No hay socios inscriptos en esta clase.
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground font-medium border-b text-left">
                <tr>
                  <th className="p-3">Socio</th>
                  <th className="p-3">DNI</th>
                  <th className="p-3">Contacto</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {groupClass.memberGroups.map((mg) => (
                  <tr key={mg.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-medium">
                      {mg.member.firstName} {mg.member.lastName}
                    </td>
                    <td className="p-3">{mg.member.dni}</td>
                    <td className="p-3 text-muted-foreground">{mg.member.contact || "-"}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnenroll(mg.member.id)}
                        disabled={actionMemberId === mg.member.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {actionMemberId === mg.member.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
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
