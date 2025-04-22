# Projeto AMDE - Sistema de Gestão Clínica

Este repositório é um **monorepo** que contém o projeto backend (Spring Boot) e futuramente o frontend (React ou Angular) do sistema de gestão da **Associação Amigos dos Deficientes (AMDE)**.

## 📂 Estrutura do Projeto
- `backend`: Parte do java
- `frontend`: Parte do react


## 📦 Estrutura dos Pacotes

- `controller`: Endpoints REST da aplicação
- `service`: Lógica de negócio
- `model`: Entidades JPA
- `repository`: Interfaces JPA (Spring Data)
- `dto`: Objetos de transferência de dados
- `config`: Configurações gerais (CORS, Swagger, etc)
- `security`: Configuração de autenticação/autorização
- `exception`: Tratamento centralizado de erros
- `util`: Classes utilitárias

## 🧭 Como contribuir com o desenvolvimento

1. Faça fork ou clone deste repositório:
   ```bash
   git clone https://github.com/EnricoMDP/projeto-amde.git

2. Navegue até o diretório do backend:

    cd backend/gestao-clinica

3. Crie uma nova branch (usando Git Flow ou manualmente):

    git checkout -b feature/nome-da-sua-feature

4. Após implementar sua funcionalidade:

    git add .
    git commit -m "feat: descrição clara da feature"
    git push origin feature/nome-da-sua-feature

