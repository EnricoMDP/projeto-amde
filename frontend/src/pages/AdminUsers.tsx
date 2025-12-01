
import { useEffect, useMemo, useState } from "react";
import { Users, Plus, Pencil, Trash2, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UsuarioDTO } from "@/services/users";
import apiClient from "@/lib/apiClient";
import RegisterUserModal from "@/components/RegisterUserModal";
import EditUserModal from "@/components/EditUserModal";
import { deleteUsuario } from "@/services/users";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

const AdminUsers = () => {
  const [users, setUsers] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRegister, setOpenRegister] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioDTO | null>(null);
  // Controles de busca/ordenacao/filtro
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"id" | "nome" | "nivel">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterNivel, setFilterNivel] = useState<"ALL" | "PACIENTE" | "MEDICO" | "ADMINISTRADOR">("ALL");

  const reload = async () => {
    let active = true;
    try {
      setLoading(true);
      const res = await apiClient.get<UsuarioDTO[]>("/api/usuarios");
      // Garante que sempre temos um array
      if (active) setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      if (active) {
        setError(e?.message || "Falha ao carregar usuários");
        setUsers([]); // Define array vazio em caso de erro
      }
    } finally {
      if (active) setLoading(false);
    }
    return () => { active = false; };
  };

  useEffect(() => { reload(); }, []);

  const getAccessLevelColor = (nivel: UsuarioDTO["nivelAcesso"]) => {
    switch (nivel) {
      case "ADMINISTRADOR":
        return "bg-red-100 text-red-800";
      case "MEDICO":
        return "bg-blue-100 text-blue-800";
      case "PACIENTE":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAccessLevelLabel = (nivel: UsuarioDTO["nivelAcesso"]) => {
    switch (nivel) {
      case "ADMINISTRADOR":
        return "Administrador";
      case "MEDICO":
        return "Médico";
      case "PACIENTE":
        return "Paciente";
      default:
        return nivel;
    }
  };

  const stats = useMemo(() => {
    const administradores = users.filter((u) => u.nivelAcesso === "ADMINISTRADOR").length;
    const medicos = users.filter((u) => u.nivelAcesso === "MEDICO").length;
    const pacientes = users.length - administradores - medicos; // pacientes e demais
    return { total: users.length, administradores, medicos, pacientes };
  }, [users]);

  const visibleUsers = useMemo(() => {
    let list = [...users];
    // filtro por nivel
    if (filterNivel !== "ALL") {
      list = list.filter((u) => u.nivelAcesso === filterNivel);
    }
    // busca por nome ou email
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((u) =>
        `${u.nome ?? ""}`.toLowerCase().includes(q) || `${u.email ?? ""}`.toLowerCase().includes(q)
      );
    }
    // ordenação
    list.sort((a, b) => {
      let comp = 0;
      if (sortKey === "id") comp = (a.idUsuario ?? 0) - (b.idUsuario ?? 0);
      if (sortKey === "nome") comp = `${a.nome ?? ""}`.localeCompare(`${b.nome ?? ""}`);
      if (sortKey === "nivel") comp = `${a.nivelAcesso}`.localeCompare(`${b.nivelAcesso}`);
      return sortDir === "asc" ? comp : -comp;
    });
    return list;
  }, [users, filterNivel, search, sortKey, sortDir]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600">Gerencie os usuários do sistema</p>
          </div>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white" onClick={() => setOpenRegister(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.administradores}
                </p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Médicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.medicos}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pacientes}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Controls + Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg font-semibold">Lista de Usuários</CardTitle>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="pl-8"
                />
              </div>
              <Select value={filterNivel} onValueChange={(v) => setFilterNivel(v as any)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os níveis</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  <SelectItem value="MEDICO">Médico</SelectItem>
                  <SelectItem value="PACIENTE">Paciente</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                title={`Ordenação: ${sortDir === "asc" ? "Ascendente" : "Descendente"}`}
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {sortDir === "asc" ? "ASC" : "DESC"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">
                    <button className="inline-flex items-center gap-1" onClick={() => setSortKey("id")}>ID</button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <button className="inline-flex items-center gap-1" onClick={() => setSortKey("nome")}>Nome Completo</button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">Email</TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    <button className="inline-flex items-center gap-1" onClick={() => setSortKey("nivel")}>Nível de Acesso</button>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">Data de Nascimento</TableHead>
                  <TableHead className="font-semibold text-gray-700">País</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Cidade</TableHead>
                  <TableHead className="font-semibold text-gray-700">Rua</TableHead>
                  <TableHead className="font-semibold text-gray-700">Celular</TableHead>
                  <TableHead className="font-semibold text-gray-700">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-gray-500">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && error && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && visibleUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-gray-500">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
                {!loading && !error && visibleUsers.map((user) => {
                  const birth = user.dataNasc ? (() => {
                    try { return format(parseISO(user.dataNasc), "dd/MM/yyyy"); } catch { return "-"; }
                  })() : "-";
                  const rua = user.rua ?? "-";
                  return (
                    <TableRow key={user.idUsuario} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{user.idUsuario}</TableCell>
                      <TableCell className="font-medium text-gray-900">{user.nome}</TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(user.nivelAcesso)}`}>
                          {getAccessLevelLabel(user.nivelAcesso)}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{birth}</TableCell>
                      <TableCell className="text-gray-600">{user.pais ?? "-"}</TableCell>
                      <TableCell className="text-gray-600">{user.estado ?? "-"}</TableCell>
                      <TableCell className="text-gray-600">{user.cidade ?? "-"}</TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">{rua}</TableCell>
                      <TableCell className="text-gray-600">{user.numCelular ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSelectedUser(user); setOpenEdit(true); }}
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Apagar">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o usuário {user.nome}? Esta ação não poderá ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    try {
                                      await deleteUsuario(user.idUsuario);
                                      toast.success("Usuário removido");
                                      reload();
                                    } catch (err: any) {
                                      toast.error("Falha ao remover usuário", { description: err?.message });
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <RegisterUserModal
        open={openRegister}
        onOpenChange={setOpenRegister}
        onSuccess={() => { reload(); }}
      />
      <EditUserModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        user={selectedUser}
        onSuccess={() => { reload(); }}
      />
    </div>
  );
};

export default AdminUsers;
