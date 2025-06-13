# Projeto AMDE - Sistema de Gestão Clínica

Este repositório é um **monorepo** que contém o projeto backend (Spring Boot) e futuramente o frontend (React ou Angular) do sistema de gestão da **Associação Amigos dos Deficientes (AMDE)**.

---

## 📂 Estrutura do Projeto
- `backend`: Contém toda a aplicação backend desenvolvida em Java com Spring Boot.
- `frontend`: Contém a aplicação frontend, que será desenvolvida em React.

---

## 📦 Estrutura dos Pacotes (Backend)

- `controller`: Endpoints REST da aplicação que se comunicam com o frontend.
- `service`: Camada que contém toda a lógica de negócio do sistema.
- `model`: Entidades JPA que representam as tabelas do banco de dados.
- `repository`: Interfaces do Spring Data JPA para acesso e manipulação dos dados.
- `dto`: Objetos de Transferência de Dados (Data Transfer Objects) para a comunicação entre camadas.
- `config`: Configurações gerais da aplicação (CORS, Swagger, Segurança, etc).
- `security`: Configurações de autenticação e autorização, incluindo filtros JWT.
- `exception`: Classes para tratamento centralizado de erros e exceções.
- `util`: Classes utilitárias, como `JwtUtil` para geração e validação de tokens.

---

## 💡 Arquitetura e Fluxo do Projeto

Esta seção serve como um manual para entender a arquitetura atual e o fluxo de dados entre o frontend e o backend.

### Tecnologias Atuais (Stack)

* **Backend (gestao-clinica)**
    * **Framework**: Spring Boot (Java)
    * **Principais Funções**: Fornecer uma API RESTful para o frontend consumir, gerenciar a lógica de negócio e persistir dados no banco de dados.

* **Frontend (frontend)**
    * **Framework**: React
    * **Principais Funções**: Fornecer a interface de usuário (UI), gerenciar o estado local e se comunicar com o backend via requisições HTTP.

### 👤 Jornada do Usuário

#### 1. Cadastro de Usuário
- **Frontend**: O usuário acessa a tela de cadastro (`Register.tsx`) e preenche seus dados.
- **Requisição**: Ao submeter, o frontend envia os dados para o endpoint `POST /api/usuarios/register`.
- **Backend**:
    1.  O `UsuarioController` recebe a requisição.
    2.  A `UsuarioService` valida se o e-mail já existe no banco.
    3.  A senha do usuário é criptografada.
    4.  O novo usuário é salvo no banco de dados através do `UsuarioRepository`.
    5.  Retorna um DTO (`UsuarioDTO`) com os dados do usuário recém-criado (sem a senha).

#### 2. Login de Usuário
- **Frontend**: O usuário preenche e-mail e senha na tela de `Login.tsx`.
- **Requisição**: Os dados são enviados para o endpoint `POST /api/usuarios/login`.
- **Backend**:
    1.  O `UsuarioController` recebe as credenciais.
    2.  A `UsuarioService` busca o usuário pelo e-mail e verifica se a senha criptografada corresponde à informada.
    3.  Se as credenciais estiverem corretas, o `JwtUtil` gera um **token JWT**.
    4.  O token é retornado ao frontend.

#### 3. Sessão Autenticada
- **Frontend**: O token JWT recebido é armazenado (geralmente em `localStorage` ou `sessionStorage`).
- **Requisição**: Para acessar rotas protegidas (ex: painel de administração), o frontend envia o token JWT no cabeçalho `Authorization` de cada requisição (ex: `Authorization: Bearer <token>`).
- **Backend**:
    1.  Um filtro de segurança intercepta a requisição.
    2.  O `JwtUtil` valida a assinatura e a data de expiração do token usando a chave secreta (`SECRET_KEY`).
    3.  Se o token for válido, o acesso à rota protegida é concedido.

### 🔑 O Papel do JWT
O **JWT (JSON Web Token)** é o núcleo da nossa estratégia de autenticação. Ele funciona como um "crachá digital" que o backend entrega ao usuário no momento do login. O usuário apresenta esse crachá em cada requisição para provar quem ele é, eliminando a necessidade de enviar e-mail e senha repetidamente. A **chave secreta (`SECRET_KEY`)** garante que esses crachás não possam ser falsificados.

### 🔄 Camadas e a Jornada dos Dados
O backend segue uma arquitetura em camadas para organizar responsabilidades:

1.  **Controller**: A porta de entrada. Recebe requisições HTTP, desempacota os dados em DTOs e chama a camada de serviço. Não contém lógica de negócio.
2.  **Service**: O cérebro da aplicação. Orquestra a lógica de negócio, realiza validações e decide como os dados devem ser manipulados, utilizando os `repositories`.
3.  **Repository**: As mãos que tocam o banco de dados. Interfaces que executam operações de Create, Read, Update e Delete (CRUD).
4.  **Model (Entity)**: O esqueleto dos dados. Mapeia as tabelas do banco de dados para objetos Java.
5.  **DTO (Data Transfer Object)**: O mensageiro. Objetos "limpos" usados para transportar dados entre o frontend e o backend, evitando expor detalhes internos das entidades do banco.

### ➡️ Exemplo de Fluxo: Listando Usuários
Veja como as camadas interagem quando o usuário solicita a lista de usuários cadastrados:

1.  **Frontend (React)**: O usuário clica para ver a lista de usuários, disparando uma requisição `HTTP GET /api/usuarios`.
2.  **Controller (`UsuarioController`)**: Recebe a requisição GET e chama o método `listarTodos()` do `UsuarioService`.
3.  **Service (`UsuarioService`)**: Chama o método `findAll()` do `UsuarioRepository`.
4.  **Repository (`UsuarioRepository`)**: Executa a consulta SQL `SELECT * FROM usuario` no banco de dados e retorna uma lista de entidades `Usuario`.
5.  **Service (`UsuarioService`)**: Recebe a lista de entidades e a converte para uma lista de `UsuarioDTO`.
6.  **Controller (`UsuarioController`)**: Recebe a lista de DTOs e a retorna como uma resposta JSON para o frontend.
7.  **Frontend (React)**: Recebe o JSON, atualiza seu estado e renderiza a lista de usuários na tela.

---

## 🧭 Como contribuir com o desenvolvimento

1.  Faça fork ou clone deste repositório:
    ```bash
    git clone [https://github.com/EnricoMDP/projeto-amde.git](https://github.com/EnricoMDP/projeto-amde.git)
    ```

2.  Navegue até o diretório do backend:
    ```bash
    cd backend/gestao-clinica
    ```

3.  Crie uma nova branch (usando Git Flow ou manualmente):
    ```bash
    git checkout -b feature/nome-da-sua-feature
    ```

4.  Após implementar sua funcionalidade:
    ```bash
    git add .
    git commit -m "feat: descrição clara da feature"
    git push origin feature/nome-da-sua-feature
    ```

---

## 🧑‍💻 Uso do Gitflow

Para manter o versionamento organizado, utilizamos o Git Flow.

🛠️ **Exemplo de uso prático:**

```bash
# Iniciar uma nova funcionalidade (ex: cadastro-paciente)
git flow feature start cadastro-paciente

# Após finalizar e commitar suas alterações
git flow feature finish cadastro-paciente
