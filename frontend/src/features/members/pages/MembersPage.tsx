import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMembers } from "@/features/members/hooks/useMembers";
import MemberList from "@/features/members/components/MemberList";
import MemberForm from "@/features/members/components/MemberForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Users } from "lucide-react";
import type { Member, CreateMemberInput } from "@/features/members/api/membersApi";

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

export default function MembersPage() {
  const { members, isLoading, error, addMember, toggleActive } = useMembers();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleAdd = async (data: CreateMemberInput) => {
    setIsSubmitting(true);
    setFormError(null);
    const result = await addMember(data);
    setIsSubmitting(false);
    if (result) {
      setShowForm(false);
    } else {
      setFormError(error || "Error al crear socio");
    }
  };

  const handleToggleActive = async (id: number) => {
    await toggleActive(id);
  };

  const openCreate = () => {
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError(null);
  };

  const filtered = members.filter((m) => {
    const matchesSearch =
      `${m.firstName} ${m.lastName} ${m.dni}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? m.isActive
        : !m.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Socios</h1>
          <p className="text-muted-foreground mt-1 text-sm">Gestiona los socios del club</p>
        </div>
        <Button onClick={openCreate} variant="outline">
          <Plus data-icon="inline-start" />
          Nuevo Socio
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Nuevo Socio</CardTitle>
                <CardDescription>Completa los datos del nuevo socio</CardDescription>
              </CardHeader>
              <CardContent>
                <MemberForm
                  onSubmit={handleAdd}
                  onCancel={closeForm}
                  isLoading={isSubmitting}
                  error={formError}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Lista de Socios</TabsTrigger>
          <TabsTrigger value="status">Estado de Socios</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="pt-6">
              <MemberList
                members={members}
                isLoading={isLoading}
                error={error}
                onToggleActive={handleToggleActive}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Estado de Socios</CardTitle>
              <CardDescription>
                Vista global de cuotas sociales, aranceles deportivos y deuda total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o DNI..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Estado">
                      {statusFilter === "all" ? "Todos" : statusFilter === "active" ? "Activos" : "Inactivos"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : error ? (
                <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <Users className="size-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium">No se encontraron socios</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>DNI</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Cuota Social</TableHead>
                        <TableHead>Deuda Total</TableHead>
                        <TableHead className="text-right">Detalle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((member) => {
                        const socialStatus = getCurrentMonthSocialFeeStatus(member);
                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              {member.firstName} {member.lastName}
                            </TableCell>
                            <TableCell>{member.dni}</TableCell>
                            <TableCell><Badge variant="outline">{member.category || "—"}</Badge></TableCell>
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
                                <span className="text-sm text-destructive font-medium">
                                  ${Number(member.accumulatedDebt).toFixed(2)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedMember(member)}>
                                Ver historial
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedMember?.firstName} {selectedMember?.lastName}
                </DialogTitle>
                <DialogDescription>
                  DNI: {selectedMember?.dni} · Categoría: {selectedMember?.category} · Estado: {selectedMember?.isActive ? "Activo" : "Inactivo"}
                </DialogDescription>
              </DialogHeader>

              {selectedMember && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Cuota Social</h4>
                    {selectedMember.memberSocialFees && selectedMember.memberSocialFees.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Período</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMember.memberSocialFees.map((msf) => (
                            <TableRow key={msf.id}>
                              <TableCell>{msf.periodMonth}/{msf.periodYear}</TableCell>
                              <TableCell>${Number(msf.amount).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={msf.paid ? "secondary" : "destructive"}>
                                  {msf.paid ? "Pagada" : "Pendiente"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin registros de cuota social</p>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
