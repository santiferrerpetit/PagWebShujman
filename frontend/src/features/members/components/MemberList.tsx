import type { Member } from "../api/membersApi";
import { Button } from "@/components/ui/button";
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
import { Pencil, Trash2, UsersRound } from "lucide-react";

type MemberListProps = {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
};

export default function MemberList({ members, isLoading, error, onEdit, onDelete }: MemberListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <UsersRound className="size-10 mb-3 opacity-40" />
        <p className="text-sm font-medium">No hay socios registrados</p>
        <p className="text-xs mt-1">Agrega un nuevo socio para comenzar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Cuota</TableHead>
            <TableHead>Deuda</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {member.firstName} {member.lastName}
              </TableCell>
              <TableCell>{member.dni}</TableCell>
              <TableCell>{member.contact || "—"}</TableCell>
              <TableCell>
                <Badge variant={member.socialFeePaid ? "secondary" : "destructive"}>
                  {member.socialFeePaid ? "Pagada" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell>
                {Number(member.accumulatedDebt) === 0 ? (
                  <Badge variant="secondary">Al día</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">${Number(member.accumulatedDebt).toFixed(2)}</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(member)}>
                    <Pencil data-icon="inline-start" />
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDelete(member.id)}>
                    <Trash2 data-icon="inline-start" />
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
