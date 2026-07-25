import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2, ArrowRight } from "lucide-react";
import type { Group } from "@/features/disciplines/api/disciplinesApi";
import { Link } from "react-router-dom";

interface GroupListProps {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  onEdit: (group: Group) => void;
  onDelete: (id: number) => void;
}

export default function GroupList({ groups, isLoading, error, onEdit, onDelete }: GroupListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
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

  if (groups.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        <p className="font-medium">No hay grupos registrados</p>
        <p className="text-xs mt-1">Agregá un nuevo grupo para comenzar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Horario</TableHead>
            <TableHead>Días</TableHead>
            <TableHead>Profesor</TableHead>
            <TableHead>Socios</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">{group.schedule}</TableCell>
              <TableCell>{group.days}</TableCell>
              <TableCell>{group.user?.firstName} {group.user?.lastName}</TableCell>
              <TableCell>{group._count?.memberGroups ?? 0}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link to={`/groups/${group.id}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight data-icon="inline-start" />
                      Ver
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(group)}>
                    <Pencil data-icon="inline-start" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(group.id)}
                  >
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
