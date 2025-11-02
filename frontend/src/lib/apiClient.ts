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
    const token = localStorage.getItem('authToken');
    // Se o token existir, adiciona o cabeçalho Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Continua com a requisição modificada
  },
  (error) => {
    // Se houver erro na configuração da requisição
    return Promise.reject(error);
  }
);

// Você pode adicionar interceptors de resposta aqui também, se precisar (ex: para tratar 401 globalmente)

export default apiClient;