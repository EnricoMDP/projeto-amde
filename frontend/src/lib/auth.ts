import { jwtDecode } from "jwt-decode";

// Define os tipos de papéis válidos na sua aplicação
export type Role = "ADMINISTRADOR" | "MEDICO" | "PACIENTE";

// Define a estrutura esperada do payload dentro do token JWT
// Ajuste os tipos (ex: uid pode ser string se vier assim do backend)
interface JwtPayload {
  uid: number;       // ID do usuário
  role: Role;        // Papel do usuário
  name: string;      // Nome do usuário
  sub: string;       // Assunto (geralmente o email)
  iat: number;       // Timestamp de emissão (issued at)
  exp: number;       // Timestamp de expiração (expiration time)
}

// Interface para o objeto de autenticação retornado pela getAuth
interface AuthState {
  token: string | null;
  role: Role | null;
  username: string | null; // Usaremos 'name' ou 'sub' (email) como username
  isAuthenticated: boolean;
  uid: number | null; // Incluindo o ID do usuário se precisar
}

/**
 * Função principal para obter os dados de autenticação.
 * Lê o token do localStorage, decodifica com segurança usando jwt-decode
 * e retorna o estado de autenticação atual.
 */
export function getAuth(): AuthState {
  let token = localStorage.getItem("authToken");

  // Se não houver token, retorna estado "deslogado"
  if (!token) {
    return {
      token: null,
      role: null,
      username: null,
      isAuthenticated: false,
      uid: null,
    };
  }

  try {
    // Limpa o token de espaços e quebras de linha
    token = token.trim();
    
    // Valida formato básico de JWT (3 partes separadas por pontos)
    const jwtParts = token.split('.');
    if (jwtParts.length !== 3) {
      throw new Error("Formato de token JWT inválido");
    }
    
    // Decodifica o token usando a biblioteca jwt-decode
    const decoded = jwtDecode<JwtPayload>(token);

    // Verifica se o token expirou (exp é em segundos, Date.now() em milissegundos)
    const isExpired = Date.now() >= decoded.exp * 1000;

    if (isExpired) {
      console.warn("Token JWT expirado.");
      localStorage.removeItem("authToken"); // Limpa o token expirado
      // Dispara evento para notificar o AuthContext, se ele estiver escutando 'storage'
      window.dispatchEvent(new StorageEvent('storage', { key: 'authToken', newValue: null }));
      return {
        token: null,
        role: null,
        username: null,
        isAuthenticated: false,
        uid: null,
      };
    }

    // Se o token é válido e não expirou, retorna os dados
    return {
      token,
      role: decoded.role,
      username: decoded.name || decoded.sub, // Prefere o nome, senão usa o email
      isAuthenticated: true,
      uid: decoded.uid,
    };

  } catch (error) {
    // Se a decodificação falhar (token inválido/malformado)
    console.error("Falha ao decodificar token JWT:", error);
    console.error("Token problemático (primeiros 50 caracteres):", token?.substring(0, 50));
    console.error("Tamanho do token:", token?.length);
    console.error("Número de partes do JWT:", token?.split('.').length);
    
    localStorage.removeItem("authToken"); // Limpa o token inválido
    // Dispara evento para notificar o AuthContext
     window.dispatchEvent(new StorageEvent('storage', { key: 'authToken', newValue: null }));
    return {
      token: null,
      role: null,
      username: null,
      isAuthenticated: false,
      uid: null,
    };
  }
}

// Funções auxiliares que usam getAuth() para conveniência

/**
 * Verifica rapidamente se o usuário está autenticado (possui um token válido e não expirado).
 */
export function isAuthenticated(): boolean {
  return getAuth().isAuthenticated;
}

/**
 * Verifica se o usuário autenticado possui pelo menos um dos papéis especificados.
 * @param roles Array de papéis permitidos.
 */
export function hasAnyRole(roles: Role[]): boolean {
  const { role, isAuthenticated } = getAuth();
  return isAuthenticated && !!role && roles.includes(role);
}

// Funções para manipular o token no localStorage (podem ser usadas pelo AuthContext ou diretamente)

/**
 * Salva o token JWT no localStorage.
 * @param token O token a ser salvo, ou null para remover.
 */
export function setAuthToken(token: string | null): void {
  if (token) {
    // Limpa o token antes de salvar
    const cleanToken = token.trim();
    localStorage.setItem("authToken", cleanToken);
    window.dispatchEvent(new StorageEvent('storage', { key: 'authToken', newValue: cleanToken }));
  } else {
    localStorage.removeItem("authToken");
    window.dispatchEvent(new StorageEvent('storage', { key: 'authToken', newValue: null }));
  }
}

/**
 * Remove o token JWT do localStorage.
 */
export function clearAuthToken(): void {
  setAuthToken(null);
}