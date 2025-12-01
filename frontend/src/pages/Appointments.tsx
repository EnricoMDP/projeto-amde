import { useEffect, useState, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Search, ArrowUpDown, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { getAgendamentos, deleteAgendamento, AgendamentoDTO } from "@/services/agendamentos";
import AppointmentModal from "@/components/AppointmentModal";

const Appointments = () => {
  const [appointments, setAppointments] = useState<AgendamentoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"dataInicio" | "nomePaciente" | "status">("dataInicio");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AgendamentoDTO | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAgendamentos();
      // Garante que sempre temos um array
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Falha ao carregar agendamentos");
      setAppointments([]); // Define array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteAgendamento(id);
      toast.success("Agendamento removido");
      fetchData(); // Recarrega a lista
    } catch (e: unknown) {
      toast.error("Erro ao deletar agendamento", { description: e instanceof Error ? e.message : "Erro desconhecido" });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado": return "bg-blue-100 text-blue-800";
      case "Concluído": return "bg-green-100 text-green-800";
      case "Cancelado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const visibleAppointments = useMemo(() => {
    let list = [...appointments];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((a) =>
        a.nomePaciente.toLowerCase().includes(q) ||
        a.nomeFuncionario.toLowerCase().includes(q) ||
        a.tipoAgendamento.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let comp = 0;
      if (sortKey === "dataInicio") {
        comp = a.dataInicio.localeCompare(b.dataInicio);
      } else if (sortKey === "nomePaciente") {
        comp = a.nomePaciente.localeCompare(b.nomePaciente);
      } else if (sortKey === "status") {
        comp = a.status.localeCompare(b.status);
      }
      return sortDir === "asc" ? comp : -comp;
    });

    return list;
  }, [appointments, search, sortKey, sortDir]);

  return (
    <div className="p-6 space-y-6">
      {/* Header e Botão */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-2 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
            <p className="text-gray-600">Gerencie todas as consultas e compromissos</p>
          </div>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white" onClick={() => { setSelectedAppointment(null); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      {/* Tabela de Agendamentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg font-semibold">Lista de Consultas</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar paciente ou médico..."
                  className="pl-8"
                />
              </div>
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
                  <TableHead><button onClick={() => setSortKey("dataInicio")}>Data/Hora</button></TableHead>
                  <TableHead><button onClick={() => setSortKey("nomePaciente")}>Paciente</button></TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead><button onClick={() => setSortKey("status")}>Status</button></TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && <TableRow><TableCell colSpan={7} className="text-center py-6">Carregando...</TableCell></TableRow>}
                {!loading && error && <TableRow><TableCell colSpan={7} className="text-center py-6 text-red-600">{error}</TableCell></TableRow>}
                {!loading && !error && visibleAppointments.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-6 text-gray-500">Nenhum agendamento encontrado</TableCell></TableRow>}
                
                {!loading && !error && visibleAppointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <span className="font-medium">{format(parseISO(a.dataInicio), "dd/MM/yyyy")}</span>
                          <div className="text-xs text-gray-500">{format(parseISO(a.dataInicio), "HH:mm")} - {format(parseISO(a.dataFinal), "HH:mm")}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{a.nomePaciente}</TableCell>
                    <TableCell className="text-gray-600">{a.nomeFuncionario}</TableCell>
                    <TableCell className="text-gray-600">{a.cargoFuncionario || "-"}</TableCell>
                    <TableCell>{a.tipoAgendamento}</TableCell>
                    <TableCell>
                       <Badge className={getStatusColor(a.status)}>
                         {a.status}
                       </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" title="Editar" onClick={() => { setSelectedAppointment(a); setModalOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Excluir"><Trash2 className="w-4 h-4 text-red-600" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Agendamento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a consulta de {a.nomePaciente} em {format(parseISO(a.dataInicio), "dd/MM/yyyy")}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(a.id)} className="bg-red-600 hover:bg-red-700">Remover</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal de CRUD */}
      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        appointment={selectedAppointment}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Appointments;