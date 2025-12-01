/**
 * Valida e limpa tokens JWT armazenados no localStorage
 * Este módulo deve ser executado no início da aplicação
 */

/**
 * Valida se uma string é um JWT válido (formato básico)
 */
export function isValidJWTFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Remove espaços em branco
  const cleanToken = token.trim();

  // JWT deve ter exatamente 3 partes separadas por pontos
  const parts = cleanToken.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Cada parte deve ser base64 válida (contém apenas caracteres base64)
  const base64Regex = /^[A-Za-z0-9_-]+$/;
  return parts.every(part => part.length > 0 && base64Regex.test(part));
}

/**
 * Limpa e valida o token do localStorage
 * Remove tokens inválidos e retorna o token limpo se válido
 */
export function validateAndCleanStoredToken(): string | null {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return null;
    }

    const cleanToken = token.trim();

    if (!isValidJWTFormat(cleanToken)) {
      console.warn('Token JWT inválido encontrado no localStorage. Removendo...');
      localStorage.removeItem('authToken');
      return null;
    }

    // Se o token foi limpo (tinha espaços), atualiza no localStorage
    if (cleanToken !== token) {
      console.info('Token JWT foi limpo (remoção de espaços)');
      localStorage.setItem('authToken', cleanToken);
    }

    return cleanToken;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    localStorage.removeItem('authToken');
    return null;
  }
}

/**
 * Inicializa a validação de token
 * Deve ser chamado ao iniciar a aplicação
 */
export function initTokenValidation(): void {
  validateAndCleanStoredToken();
}
