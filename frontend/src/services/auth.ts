import apiClient from "@/lib/apiClient";

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  email: string;
  senha: string;
  nome: string;
  nivelAcesso: "PACIENTE" | "MEDICO" | "ADMINISTRADOR";
  cpf?: string; // CPF para PACIENTE
  dataNasc?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  rua?: string;
  numCelular?: string;
  descPaciente?: string; // usado quando PACIENTE
  grauSuporte?: number; // 1, 2 ou 3 - usado quando PACIENTE
  crm?: string; // CRM para MEDICO
  cargo?: string; // Especialidade (MEDICO)
}

export async function login(payload: LoginPayload): Promise<string> {
  const { data } = await apiClient.post<string>("/api/usuarios/login", payload, {
    responseType: "text" as any,
  });
  // Armazena o token no mesmo local lido pelo apiClient
  localStorage.setItem("authToken", data);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post("/api/usuarios/register", payload);
  return data;
}

export function logout() {
  localStorage.removeItem("authToken");
}
