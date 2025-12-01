import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Você pode registrar o erro em um serviço de relatório de erros
    console.error('ErrorBoundary capturou um erro:', error);
    console.error('Informações do erro:', errorInfo);

    // Verifica se é um erro relacionado ao JWT
    if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('atob')) {
      console.error('Erro relacionado a JWT detectado. Limpando token...');
      localStorage.removeItem('authToken');
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    // Limpa o erro e tenta recarregar
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleClearAndReload = () => {
    // Limpa localStorage e recarrega a página
    localStorage.clear();
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 p-2 rounded-full">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <CardTitle className="text-2xl text-red-700">
                    Oops! Algo deu errado
                  </CardTitle>
                  <CardDescription>
                    Ocorreu um erro inesperado na aplicação
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Detalhes do erro:</p>
                <pre className="text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error?.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-3">
                    <summary className="text-xs font-medium text-gray-600 cursor-pointer hover:text-gray-900">
                      Stack trace (clique para expandir)
                    </summary>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-60 mt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Sugestões para resolver o problema:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Recarregue a página</li>
                  <li>Limpe o cache do navegador</li>
                  <li>Faça logout e login novamente</li>
                  <li>Se o problema persistir, contate o suporte</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  🔄 Tentar Novamente
                </Button>
                <Button
                  onClick={this.handleClearAndReload}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Limpar Dados e Relogar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
