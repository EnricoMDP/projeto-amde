import http from "@/lib/http";

export interface UsuarioDTO {
  idUsuario: number;
  email: string;
  nome: string;
  nivelAcesso: "PACIENTE" | "MEDICO" | "ADMINISTRADOR";
  dataNasc?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  rua?: string;
  numCelular?: string;
}

export interface ProntuarioDTO {
  nomeArquivo: string;
  dataAtualizacao: string; // ISO
}

export interface PerfilPacienteDTO {
  usuario: UsuarioDTO;
  descricao: string | null;
  prontuarios: ProntuarioDTO[];
}

export async function getUsuarios(): Promise<UsuarioDTO[]> {
  const { data } = await http.get<UsuarioDTO[]>("/api/usuarios");
  return data;
}

export async function getPacientes(): Promise<UsuarioDTO[]> {
  const { data } = await http.get<UsuarioDTO[]>("/api/usuarios/pacientes");
  return data;
}

export async function getPerfilPaciente(idUsuario: number): Promise<PerfilPacienteDTO> {
  const { data } = await http.get<PerfilPacienteDTO>(`/api/usuarios/${idUsuario}/perfil`);
  return data;
}

export interface UsuarioUpdatePayload {
  nome?: string;
  email?: string;
  numCelular?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  rua?: string;
  dataNasc?: string; // ISO
  nivelAcesso?: "PACIENTE" | "MEDICO" | "ADMINISTRADOR";
  descPaciente?: string;
}

export async function updateUsuario(id: number, payload: UsuarioUpdatePayload): Promise<UsuarioDTO> {
  const { data } = await http.put<UsuarioDTO>(`/api/usuarios/${id}`, payload);
  return data;
}

export async function deleteUsuario(id: number): Promise<void> {
  await http.delete(`/api/usuarios/${id}`);
}
