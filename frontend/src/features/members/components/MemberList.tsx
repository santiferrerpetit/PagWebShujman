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
import { Power, PowerOff, UsersRound } from "lucide-react";

type MemberListProps = {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  onToggleActive: (id: number) => void;
};

function getCurrentMonthSocialFeeStatus(member: Member): { text: string; variant: "secondary" | "destructive" | "outline" } {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const current = member.memberSocialFees?.find(
    (msf) => msf.periodMonth === currentMonth && msf.periodYear === currentYear
  );
  if (!current) return { text: "Sin cuota", variant: "outline" };
  if (current.paid) return { text: "Pagada", variant: "secondary" };
  return { text: "Pendiente", variant: "destructive" };
}

export default function MemberList({ members, isLoading, error, onToggleActive }: MemberListProps) {
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
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Cuota Social</TableHead>
            <TableHead>Deuda Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const socialStatus = getCurrentMonthSocialFeeStatus(member);
            return (
              <TableRow key={member.id} data-inactive={!member.isActive ? "" : undefined}>
                <TableCell className="font-medium">
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>{member.dni}</TableCell>
                <TableCell>{member.email || "—"}</TableCell>
                <TableCell>{member.phone || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{member.category || "—"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={member.isActive ? "secondary" : "outline"}>
                    {member.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={socialStatus.variant}>{socialStatus.text}</Badge>
                </TableCell>
                <TableCell>
                  {Number(member.accumulatedDebt) === 0 ? (
                    <Badge variant="secondary">Al día</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">${Number(member.accumulatedDebt).toFixed(2)}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleActive(member.id)}
                    className={member.isActive ? "text-destructive hover:text-destructive" : "text-emerald-600 hover:text-emerald-600"}
                  >
                    {member.isActive ? (
                      <>
                        <PowerOff data-icon="inline-start" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Power data-icon="inline-start" />
                        Activar
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
