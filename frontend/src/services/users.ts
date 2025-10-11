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
  idProntuario: number;
  nomeArquivo: string;
  dataAtualizacao: string; // ISO
  displayName?: string;
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

// Upload e download de prontuários
export async function uploadProntuario(idPaciente: number, file: File) {
  const form = new FormData();
  form.append("idPaciente", String(idPaciente));
  form.append("file", file);
  const { data } = await http.post<ProntuarioDTO>("/api/prontuarios/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function downloadProntuario(idProntuario: number, overrideFilename?: string) {
  // Busca autenticada (JWT via interceptor) e força download com o nome enviado pelo servidor
  const response = await http.get(`/api/prontuarios/${idProntuario}/download`, {
    responseType: "blob",
  });

  let filename = overrideFilename || `prontuario-${idProntuario}.pdf`;
  if (!overrideFilename) {
    const disposition = (response as any).headers?.["content-disposition"] as string | undefined;
    if (disposition) {
      try {
        // tenta extrair filename*= e filename="..."
        const matchStar = disposition.match(/filename\*=(?:UTF-8''|)([^;\r\n]+)/i);
        const matchPlain = disposition.match(/filename="?([^";]+)"?/i);
        if (matchStar && matchStar[1]) {
          filename = decodeURIComponent(matchStar[1]);
        } else if (matchPlain && matchPlain[1]) {
          filename = matchPlain[1];
        }
      } catch {}
    }
  }
  // garante extensão .pdf
  if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';

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

export async function deleteProntuario(idProntuario: number) {
  await http.delete(`/api/prontuarios/${idProntuario}`);
}
