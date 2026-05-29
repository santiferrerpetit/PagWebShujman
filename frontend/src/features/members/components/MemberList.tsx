import type { Member } from "../api/membersApi";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-lg font-medium">No hay socios registrados</p>
        <p className="text-sm mt-1">Agrega un nuevo socio para comenzar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="pb-3 text-slate-400 font-medium text-sm">Nombre</th>
            <th className="pb-3 text-slate-400 font-medium text-sm">DNI</th>
            <th className="pb-3 text-slate-400 font-medium text-sm">Contacto</th>
            <th className="pb-3 text-slate-400 font-medium text-sm">Cuota</th>
            <th className="pb-3 text-slate-400 font-medium text-sm">Deuda</th>
            <th className="pb-3 text-slate-400 font-medium text-sm text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
              <td className="py-4 text-white font-medium">
                {member.firstName} {member.lastName}
              </td>
              <td className="py-4 text-slate-300">{member.dni}</td>
              <td className="py-4 text-slate-300">{member.contact || "—"}</td>
              <td className="py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.socialFeePaid ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {member.socialFeePaid ? "Pagada" : "Pendiente"}
                </span>
              </td>
              <td className="py-4">
                {Number(member.accumulatedDebt) === 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                    Al día
                  </span>
                ) : (
                  <span className="text-slate-300">${Number(member.accumulatedDebt).toFixed(2)}</span>
                )}
              </td>
              <td className="py-4 text-right space-x-2">
                <Button variant="ghost" size="sm" onClick={() => onEdit(member)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(member.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
