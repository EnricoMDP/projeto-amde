import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE_URL não definido. Configure em .env.local");
}

const tokenKey = "amde.jwt";

export function getToken(): string | null {
  try {
    return localStorage.getItem(tokenKey);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(tokenKey, token);
    } else {
      localStorage.removeItem(tokenKey);
    }
  } catch {
    // ignore storage errors
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
});

// Aplica o Bearer automaticamente
http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    const headers: Record<string, string> = (config.headers as any) ?? {};
    headers["Authorization"] = `Bearer ${token}`;
    config.headers = headers as any;
  }
  return config;
});

// Propaga erros com uma mensagem amigável
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    // Se não autorizado ou proibido, encerra sessão e redireciona
    if (status === 401 || status === 403) {
      try {
        setToken(null);
      } catch {}
      // Evita loop em chamadas simultâneas
      if (typeof window !== "undefined") {
        const current = window.location.pathname + window.location.search;
        if (!current.startsWith("/login")) {
          window.location.replace("/login");
        }
      }
    }
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Erro de comunicação com o servidor";

    class HttpError extends Error { status?: number; raw?: unknown }
    const err = new HttpError(message);
    err.status = status;
    err.raw = error;
    return Promise.reject(err);
  }
);

export default http;
