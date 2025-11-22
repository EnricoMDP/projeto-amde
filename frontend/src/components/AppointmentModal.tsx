import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createAgendamento, updateAgendamento, type AgendamentoDTO, type AgendamentoCadastroPayload, type AgendamentoAtualizacaoPayload } from "@/services/agendamentos";
import { getPacientes, getUsuarios, type UsuarioDTO } from "@/services/users";

export interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  appointment?: AgendamentoDTO | null; // Se null, cria novo
}

export default function AppointmentModal({ open, onOpenChange, onSuccess, appointment }: AppointmentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [pacientes, setPacientes] = useState<UsuarioDTO[]>([]);
  const [medicos, setMedicos] = useState<UsuarioDTO[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [form, setForm] = useState({
    idPaciente: "",
    idFuncionario: "",
    dataInicio: "",
    horaInicio: "",
    dataFinal: "",
    horaFinal: "",
    tipoAgendamento: "Consulta",
    status: "Agendado",
  });

  const isEdit = !!appointment;

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [pacientesData, usuariosData] = await Promise.all([
          getPacientes(),
          getUsuarios(),
        ]);
        setPacientes(pacientesData);
        // Filtrar apenas médicos e administradores
        setMedicos(usuariosData.filter(u => u.nivelAcesso === "MEDICO" || u.nivelAcesso === "ADMINISTRADOR"));
      } catch (error) {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoadingData(false);
      }
    }
    if (open) loadData();
  }, [open]);

  useEffect(() => {
    if (appointment) {
      // Preencher formulário com dados do agendamento existente
      const dataInicioObj = new Date(appointment.dataInicio);
      const dataFinalObj = new Date(appointment.dataFinal);
      
      setForm({
        idPaciente: String(appointment.idPaciente),
        idFuncionario: String(appointment.idFuncionario),
        dataInicio: dataInicioObj.toISOString().split('T')[0],
        horaInicio: dataInicioObj.toTimeString().substring(0, 5),
        dataFinal: dataFinalObj.toISOString().split('T')[0],
        horaFinal: dataFinalObj.toTimeString().substring(0, 5),
        tipoAgendamento: appointment.tipoAgendamento,
        status: appointment.status,
      });
    } else {
      // Resetar formulário para criar novo
      setForm({
        idPaciente: "",
        idFuncionario: "",
        dataInicio: "",
        horaInicio: "",
        dataFinal: "",
        horaFinal: "",
        tipoAgendamento: "Consulta",
        status: "Agendado",
      });
    }
  }, [appointment, open]);

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.idPaciente) return toast.error("Selecione um paciente");
    if (!form.idFuncionario) return toast.error("Selecione um profissional");
    if (!form.dataInicio) return toast.error("Data de início é obrigatória");
    if (!form.horaInicio) return toast.error("Hora de início é obrigatória");
    if (!form.dataFinal) return toast.error("Data final é obrigatória");
    if (!form.horaFinal) return toast.error("Hora final é obrigatória");
    if (!form.tipoAgendamento) return toast.error("Tipo de agendamento é obrigatório");

    const dataInicio = `${form.dataInicio}T${form.horaInicio}:00`;
    const dataFinal = `${form.dataFinal}T${form.horaFinal}:00`;

    try {
      setSubmitting(true);
      
      if (isEdit && appointment) {
        const payload: AgendamentoAtualizacaoPayload = {
          idPaciente: parseInt(form.idPaciente),
          idFuncionario: parseInt(form.idFuncionario),
          dataInicio,
          dataFinal,
          tipoAgendamento: form.tipoAgendamento,
          status: form.status,
        };
        await updateAgendamento(appointment.id, payload);
        toast.success("Agendamento atualizado");
      } else {
        const payload: AgendamentoCadastroPayload = {
          idPaciente: parseInt(form.idPaciente),
          idFuncionario: parseInt(form.idFuncionario),
          dataInicio,
          dataFinal,
          tipoAgendamento: form.tipoAgendamento,
        };
        await createAgendamento(payload);
        toast.success("Agendamento criado");
      }
      
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(isEdit ? "Erro ao atualizar" : "Erro ao criar", {
        description: err instanceof Error ? err.message : "Erro desconhecido"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Atualize os dados do agendamento" : "Preencha os dados para criar um novo agendamento"}
          </DialogDescription>
        </DialogHeader>
        
        {loadingData ? (
          <div className="py-8 text-center text-gray-500">Carregando...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paciente *</Label>
                <Select value={form.idPaciente} onValueChange={(v) => setField("idPaciente", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map(p => (
                      <SelectItem key={p.idUsuario} value={String(p.idUsuario)}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Profissional *</Label>
                <Select value={form.idFuncionario} onValueChange={(v) => setField("idFuncionario", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicos.map(m => (
                      <SelectItem key={m.idUsuario} value={String(m.idUsuario)}>
                        {m.nome} {m.cargo && `- ${m.cargo}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Input
                  type="date"
                  required
                  value={form.dataInicio}
                  onChange={(e) => setField("dataInicio", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora de Início *</Label>
                <Input
                  type="time"
                  required
                  value={form.horaInicio}
                  onChange={(e) => setField("horaInicio", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Final *</Label>
                <Input
                  type="date"
                  required
                  value={form.dataFinal}
                  onChange={(e) => setField("dataFinal", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora Final *</Label>
                <Input
                  type="time"
                  required
                  value={form.horaFinal}
                  onChange={(e) => setField("horaFinal", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Agendamento *</Label>
                <Select value={form.tipoAgendamento} onValueChange={(v) => setField("tipoAgendamento", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Exame">Exame</SelectItem>
                    <SelectItem value="Avaliação">Avaliação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isEdit && (
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select value={form.status} onValueChange={(v) => setField("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Agendado">Agendado</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar Agendamento"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
