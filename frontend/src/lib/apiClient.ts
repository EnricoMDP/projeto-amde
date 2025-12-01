import axios from 'axios';

// Cria uma instância do Axios com a URL base da sua API
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Lê a URL base do .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona um "interceptor" que roda ANTES de cada requisição ser enviada
apiClient.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    let token = localStorage.getItem('authToken');
    // Se o token existir, limpa e adiciona o cabeçalho Authorization
    if (token) {
      token = token.trim(); // Remove espaços e quebras de linha
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Continua com a requisição modificada
  },
  (error) => {
    // Se houver erro na configuração da requisição
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratar erros de forma padronizada
apiClient.interceptors.response.use(
  (response) => {
    // Se a resposta for uma string (como um token JWT), limpa espaços
    if (typeof response.data === 'string') {
      response.data = response.data.trim();
    }
    return response;
  },
  (error) => {
    // Se o erro for 401 (não autorizado), limpa o token e redireciona para login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Só redireciona se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Se a resposta tiver dados de erro customizados do backend
    if (error.response?.data?.message) {
      // Substitui a mensagem de erro padrão pela mensagem do backend
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export default apiClient;