import apiClient from "@/lib/apiClient";

// --- Interfaces de Dados (DTOs baseados no seu backend) ---

export interface AgendamentoDTO {
  id: number;
  dataInicio: string; // ISO Date String
  dataFinal: string;  // ISO Date String
  status: string;
  tipoAgendamento: string;
  presencaFuncionario: boolean;
  
  nomeFuncionario: string;
  idFuncionario: number;
  cargoFuncionario?: string; // Especialidade do médico
  nomePaciente: string;
  idPaciente: number;
}

export interface AgendamentoCadastroPayload {
  idFuncionario: number;
  dataInicio: string; // ISO Date String (ex: 2025-11-18T10:00:00)
  dataFinal: string;  // ISO Date String
  tipoAgendamento: string;
  idPaciente: number;
}

export interface AgendamentoAtualizacaoPayload {
  idFuncionario: number;
  dataInicio: string;
  dataFinal: string;
  status: string; // Ex: "Concluído", "Cancelado"
  tipoAgendamento: string;
  idPaciente: number;
}

// --- Funções da API (CRUD) ---

// READ ALL
export async function getAgendamentos(): Promise<AgendamentoDTO[]> {
  const { data } = await apiClient.get<AgendamentoDTO[]>("/api/agendamentos");
  // Garante que sempre retornamos um array
  return Array.isArray(data) ? data : [];
}

// CREATE
export async function createAgendamento(payload: AgendamentoCadastroPayload): Promise<AgendamentoDTO> {
  const { data } = await apiClient.post<AgendamentoDTO>("/api/agendamentos", payload);
  return data;
}

// UPDATE
export async function updateAgendamento(id: number, payload: AgendamentoAtualizacaoPayload): Promise<AgendamentoDTO> {
  const { data } = await apiClient.put<AgendamentoDTO>(`/api/agendamentos/${id}`, payload);
  return data;
}

// DELETE
export async function deleteAgendamento(id: number): Promise<void> {
  await apiClient.delete(`/api/agendamentos/${id}`);
}