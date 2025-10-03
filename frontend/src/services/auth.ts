import http, { setToken } from "@/lib/http";

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  email: string;
  senha: string;
  nome: string;
  nivelAcesso: "PACIENTE" | "MEDICO" | "ADMINISTRADOR";
  dataNasc?: string;
  pais?: string;
  estado?: string;
  cidade?: string;
  rua?: string;
  numCelular?: string;
  descPaciente?: string; // usado quando PACIENTE
}

export async function login(payload: LoginPayload): Promise<string> {
  const { data } = await http.post<string>("/api/usuarios/login", payload, {
    responseType: "text" as any,
  });
  // Armazena o token para os próximos requests
  setToken(data);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await http.post("/api/usuarios/register", payload);
  return data;
}

export function logout() {
  setToken(null);
}
