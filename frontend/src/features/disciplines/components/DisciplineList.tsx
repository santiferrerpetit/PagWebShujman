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
import type { Discipline } from "@/features/disciplines/api/disciplinesApi";
import { Link } from "react-router-dom";

interface DisciplineListProps {
  disciplines: Discipline[];
  isLoading: boolean;
  error: string | null;
  onEdit: (discipline: Discipline) => void;
  onDelete: (id: number) => void;
}

export default function DisciplineList({
  disciplines,
  isLoading,
  error,
  onEdit,
  onDelete,
}: DisciplineListProps) {
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

  if (disciplines.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-sm">
        <p className="font-medium">No hay disciplinas registradas</p>
        <p className="text-xs mt-1">Agregá una nueva disciplina para comenzar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Grupos</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disciplines.map((discipline) => (
            <TableRow key={discipline.id}>
              <TableCell className="font-medium">{discipline.name}</TableCell>
              <TableCell>{discipline.groupClasses?.length ?? 0}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link to={`/disciplines/${discipline.id}`}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight data-icon="inline-start" />
                      Ver
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(discipline)}>
                    <Pencil data-icon="inline-start" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(discipline.id)}
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
