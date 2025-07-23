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

---

## 🚀 Guia de Instalação e Execução

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento localmente.

1.  **Clone o repositório:**
    Primeiro, clone o projeto do GitHub para a sua máquina local e entre na pasta criada.
    ```bash
    git clone [https://github.com/EnricoMDP/projeto-amde.git](https://github.com/EnricoMDP/projeto-amde.git)
    cd projeto-amde
    ```

2.  **Suba o banco de dados com Docker:**
    Este comando irá iniciar o container do PostgreSQL em segundo plano (`-d`), que é necessário para o backend funcionar.
    ```bash
    docker compose up -d
    ```

3.  **Execute a aplicação Backend (Spring Boot):**
    Navegue até a pasta do projeto Java e use o Maven para compilar o projeto e iniciar o servidor.
    ```bash
    cd backend/gestao-clinica
    mvn spring-boot:run
    mvn clean install
    ```

4.  **Acesse a documentação da API (Swagger):**
    Após a inicialização completa do Spring Boot, a API estará rodando. Você pode explorar e testar todos os endpoints através do Swagger UI no seu navegador:

    [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

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


## Fluxo de Listagem de Usuários

```
Frontend (React)
   ↓  (1. Usuário acessa tela de usuários)
HTTP GET /api/usuarios
   ↓
Controller (UsuarioController)
   ↓  (2. Recebe requisição, chama service)
Service (UsuarioService)
   ↓  (3. Busca usuários no repository)
Repository (UsuarioRepository)
   ↓  (4. Consulta banco de dados e retorna entidades Usuario)
Service (UsuarioService)
   ↓  (5. Converte entidades Usuario em UsuarioDTO)
Controller (UsuarioController)
   ↓  (6. Retorna lista de UsuarioDTO como JSON)
Frontend (React)
   ↓  (7. Exibe lista de usuários na interface)
Usuário final
```


---

## 🧭 Como contribuir com o desenvolvimento

1. Faça fork ou clone deste repositório:
   ```bash
   git clone [https://github.com/EnricoMDP/projeto-amde.git](https://github.com/EnricoMDP/projeto-amde.git)

2. Navegue até o diretório do backend:

    cd backend/gestao-clinica

3. Crie uma nova branch (usando Git Flow ou manualmente):

    git checkout -b feature/nome-da-sua-feature

4. Após implementar sua funcionalidade:

    git add .
    git commit -m "feat: descrição clara da feature"
    git push origin feature/nome-da-sua-feature

## 🧑‍💻 Uso do gitflow

🛠️ Exemplo de uso prático:

# Criar nova funcionalidade
git flow feature start cadastro-paciente

# Após finalizar
git flow feature finish cadastro-paciente

Ele vai automaticamente fazer:

    Merge na develop

    Remover a branch da feature local
