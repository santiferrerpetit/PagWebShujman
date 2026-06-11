import { useParams, Link } from "react-router-dom";
import { useGroup } from "@/features/disciplines/hooks/useDisciplines";
import { useMembers } from "@/features/members/hooks/useMembers";
import AssignMemberDialog from "@/features/disciplines/components/AssignMemberDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = id ? Number(id) : null;

  const { group, isLoading, error, assignMember, removeMember } = useGroup(groupId);
  const { members } = useMembers();

  const handleAssign = async (memberId: number) => {
    await assignMember({ memberId });
  };

  const handleRemove = async (memberId: number) => {
    if (!confirm("¿Estás seguro de quitar este socio del grupo?")) return;
    await removeMember(memberId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
        <p className="text-destructive">{error || "Grupo no encontrado"}</p>
        <Link to="/disciplines" className="text-sm text-muted-foreground hover:underline mt-2 inline-block">
          <ArrowLeft data-icon="inline-start" />
          Volver a disciplinas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <Link
          to={`/disciplines/${group.disciplineId}`}
          className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft data-icon="inline-start" />
          Volver a {group.discipline.name}
        </Link>
        <h1 className="text-3xl font-light tracking-tight">Grupo {group.schedule}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {group.discipline.name} — {group.days} — Profesor: {group.user.firstName} {group.user.lastName}
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div />
        <AssignMemberDialog
          members={members}
          onAssign={handleAssign}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Socios asignados</CardTitle>
          <CardDescription>
            {group.memberGroups.length === 0
              ? "No hay socios asignados a este grupo"
              : `${group.memberGroups.length} socio${group.memberGroups.length > 1 ? "s" : ""} inscripto${group.memberGroups.length > 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {group.memberGroups.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <p className="font-medium">No hay socios asignados</p>
              <p className="text-xs mt-1">Usá el botón "Asignar socio" para agregar uno</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Socio</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.memberGroups.map((mg) => (
                    <TableRow key={mg.id}>
                      <TableCell className="font-medium">
                        {mg.member.firstName} {mg.member.lastName}
                      </TableCell>
                      <TableCell>{mg.member.dni}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemove(mg.member.id)}
                        >
                          <Trash2 data-icon="inline-start" />
                          Quitar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
