import apiClient from "@/lib/apiClient";

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
  grauSuporte?: number; // 1, 2 ou 3 - apenas para pacientes
  cargo?: string; // Especialidade (MEDICO) ou Cargo (ADMINISTRADOR)
  cpf?: string;
  crm?: string;
}

// ATUALIZADO: Reflete o novo ProntuarioDTO do Java
export interface ProntuarioDTO {
  idRegistro: number;          // Antes era idProntuario
  tituloDocumento: string;     // Novo
  nomeArquivoOriginal: string; // Novo (o que mostramos na tela)
  dataRegistro: string;        // Antes era dataAtualizacao (ISO)
  
  idCategoria: number;         // Novo
  nomeCategoria: string;       // Novo
  
  // Campos antigos (opcionais ou removidos, dependendo da sua limpeza no Java)
  // displayName?: string; // Podemos remover se usarmos nomeArquivoOriginal
}

export interface PerfilPacienteDTO {
  usuario: UsuarioDTO;
  descricao: string | null;
  grauSuporte?: number;
  prontuarios: ProntuarioDTO[];
}

export async function getUsuarios(): Promise<UsuarioDTO[]> {
  const { data } = await apiClient.get<UsuarioDTO[]>("/api/usuarios");
  // Garante que sempre retornamos um array
  return Array.isArray(data) ? data : [];
}

export async function getPacientes(): Promise<UsuarioDTO[]> {
  const { data } = await apiClient.get<UsuarioDTO[]>("/api/usuarios/pacientes");
  // Garante que sempre retornamos um array
  return Array.isArray(data) ? data : [];
}

export async function getPerfilPaciente(idUsuario: number): Promise<PerfilPacienteDTO> {
  const { data } = await apiClient.get<PerfilPacienteDTO>(`/api/usuarios/${idUsuario}/perfil`);
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
  dataNasc?: string;
  nivelAcesso?: "PACIENTE" | "MEDICO" | "ADMINISTRADOR";
  descPaciente?: string;
  grauSuporte?: number; // 1, 2 ou 3 - usado quando PACIENTE
  cpf?: string;
  crm?: string;
}

export async function updateUsuario(id: number, payload: UsuarioUpdatePayload): Promise<UsuarioDTO> {
  const { data } = await apiClient.put<UsuarioDTO>(`/api/usuarios/${id}`, payload);
  return data;
}

export async function deleteUsuario(id: number): Promise<void> {
  await apiClient.delete(`/api/usuarios/${id}`);
}

// --- ATUALIZADO: Upload com novos campos ---
export async function uploadProntuario(
  idPaciente: number, 
  file: File, 
  idCategoria: number, 
  titulo?: string
) {
  const form = new FormData();
  form.append("idPaciente", String(idPaciente));
  form.append("file", file);
  form.append("idCategoria", String(idCategoria));
  if (titulo) {
    form.append("titulo", titulo);
  }

  const { data } = await apiClient.post<ProntuarioDTO>("/api/prontuarios/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// --- ATUALIZADO: Download usa idRegistro ---
export async function downloadProntuario(idRegistro: number, overrideFilename?: string) {
  const response = await apiClient.get(`/api/prontuarios/${idRegistro}/download`, {
    responseType: "blob",
  });

  let filename = overrideFilename || `documento-${idRegistro}.pdf`;
  
  // Tenta pegar o nome real do header (que configuramos no Controller Java)
  const disposition = (response as any).headers?.["content-disposition"] as string | undefined;
  if (!overrideFilename && disposition) {
    try {
      const matchStar = disposition.match(/filename\*=(?:UTF-8''|)([^;\r\n]+)/i);
      const matchPlain = disposition.match(/filename="?([^";]+)"?/i);
      if (matchStar && matchStar[1]) {
        filename = decodeURIComponent(matchStar[1]);
      } else if (matchPlain && matchPlain[1]) {
        filename = matchPlain[1];
      }
    } catch {}
  }

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// --- ATUALIZADO: Delete usa idRegistro ---
export async function deleteProntuario(idRegistro: number) {
  await apiClient.delete(`/api/prontuarios/${idRegistro}`);
}