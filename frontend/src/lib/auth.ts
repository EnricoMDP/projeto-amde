import { getToken as getStoredToken, setToken as setStoredToken } from "@/lib/http";

export type Role = "ADMINISTRADOR" | "MEDICO" | "PACIENTE";

type JwtPayload = {
  sub?: string;
  exp?: number;
  role?: string;
  uid?: number | string;
  email?: string;
  name?: string;
  [k: string]: any;
};

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload | null): boolean {
  if (!payload || typeof payload.exp !== "number") return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp <= nowSec;
}

function normalizeRole(value?: string | null): Role | null {
  if (!value) return null;
  const r = value.toUpperCase();
  return r === "ADMINISTRADOR" || r === "MEDICO" || r === "PACIENTE" ? (r as Role) : null;
}

function toNumberOrNull(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function getAuth() {
  let token = getStoredToken();
  let role: Role | null = null;
  let uid: number | null = null;
  let email: string | null = null;
  let name: string | null = null;

  if (token) {
    const payload = decodeJwt(token);
    if (isExpired(payload)) {
      setStoredToken(null);
      token = null;
    } else if (payload) {
      role = normalizeRole(payload.role ?? null);
      uid = toNumberOrNull(payload.uid);
      email = payload.email || payload.sub || null;
      name = typeof payload.name === "string" ? payload.name : null;
    }
  }

  const username = name || email || null;
  return { token, role, uid, email, name, username };
}

export function isAuthenticated() {
  return !!getAuth().token;
}

export function hasAnyRole(roles: Role[]) {
  const { role } = getAuth();
  return !!role && roles.includes(role);
}
