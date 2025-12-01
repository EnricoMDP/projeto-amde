import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

// Define a forma do nosso contexto
interface AuthContextType {
  isAuthenticated: boolean;
  login: (userToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cria o "Provedor" que vai gerenciar o estado
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // O estado começa lendo o token que já pode existir no localStorage
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem('authToken');
    return storedToken ? storedToken.trim() : null;
  });

  const login = (userToken: string) => {
    const cleanToken = userToken.trim();
    localStorage.setItem('authToken', cleanToken);
    setToken(cleanToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    window.location.href = '/login'; // Força o redirecionamento
  };

  // O useMemo otimiza a performance, evitando re-renderizações desnecessárias
  const authContextValue = useMemo(() => ({
    isAuthenticated: !!token, // Converte a string do token (ou null) para true/false
    login,
    logout,
  }), [token]);

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

// Cria um "hook" customizado para facilitar o uso do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};