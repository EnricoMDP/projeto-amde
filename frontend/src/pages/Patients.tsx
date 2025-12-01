import { useEffect, useMemo, useState } from "react";
import { Users, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import PatientDetailsModal from "@/components/PatientDetailsModal";
import { format, parseISO } from "date-fns";
import { AxiosError } from "axios";

const Patients = () => {
  const [users, setUsers] = useState<UsuarioDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [selected, setSelected] = useState<UsuarioDTO | null>(null);
  // Controles de busca/ordenacao/filtro (mantidos idênticos)
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"id" | "nome" | "nivel">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filterNivel, setFilterNivel] = useState<"ALL" | "PACIENTE" | "MEDICO" | "ADMINISTRADOR">("ALL");

  // Busca usando apiClient (token via interceptor)
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<UsuarioDTO[]>("/api/usuarios/pacientes");
      // Garante que sempre temos um array
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      let errorMessage = "Falha ao carregar pacientes.";
      if (err instanceof AxiosError && err.response) {
        if (err.response.status === 403) {
          errorMessage = "Você não tem permissão para acessar esta lista.";
        } else if ((err.response.data as any)?.message) {
          errorMessage = (err.response.data as any).message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setUsers([]); // Define array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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

  const getGrauSuporteColor = (grau: number | null | undefined) => {
    switch (grau) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getGrauSuporteLabel = (grau: number | null | undefined) => {
    if (!grau) return "Não informado";
    return `Nível ${grau}`;
  };

  const visibleUsers = useMemo(() => {
    let list = [...users];
    // filtro por nivel (a lista só contém pacientes, mas mantemos o controle idêntico)
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
      {/* Header (sem botão de adicionar) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-600">Visualize os pacientes cadastrados</p>
          </div>
        </div>
      </div>

      {/* Filtros e tabela (sem coluna de ações) */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg font-semibold">Lista de Pacientes</CardTitle>
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
                  <TableHead className="font-semibold text-gray-700">Grau de Suporte</TableHead>
                  <TableHead className="font-semibold text-gray-700">Data de Nascimento</TableHead>
                  <TableHead className="font-semibold text-gray-700">País</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Cidade</TableHead>
                  <TableHead className="font-semibold text-gray-700">Rua</TableHead>
                  <TableHead className="font-semibold text-gray-700">Celular</TableHead>
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
                      Nenhum paciente encontrado
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
                      <TableCell
                        className="font-medium text-primary-700 hover:underline cursor-pointer"
                        onClick={() => { setSelected(user); setOpenDetails(true); }}
                      >
                        {user.nome}
                      </TableCell>
                      <TableCell className="text-gray-600">{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(user.nivelAcesso)}`}>
                          {getAccessLevelLabel(user.nivelAcesso)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getGrauSuporteColor(user.grauSuporte)}>
                          {getGrauSuporteLabel(user.grauSuporte)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{birth}</TableCell>
                      <TableCell className="text-gray-600">{user.pais ?? "-"}</TableCell>
                      <TableCell className="text-gray-600">{user.estado ?? "-"}</TableCell>
                      <TableCell className="text-gray-600">{user.cidade ?? "-"}</TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">{rua}</TableCell>
                      <TableCell className="text-gray-600">{user.numCelular ?? "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <PatientDetailsModal open={openDetails} onOpenChange={setOpenDetails} patient={selected} />
    </div>
  );
};

export default Patients;

// Modal de detalhes
// Render fora do return principal para manter o código limpo
