# FinControl

Sistema web de gestão financeira empresarial desenvolvido como projeto acadêmico da graduação em Análise e Desenvolvimento de Sistemas.

O FinControl tem como objetivo auxiliar no registro e acompanhamento das movimentações financeiras de uma empresa, centralizando receitas e despesas em uma interface simples e organizada.

## Sobre o projeto

O sistema foi desenvolvido utilizando uma arquitetura composta por front-end, back-end e banco de dados.

Nesta primeira etapa do projeto (AC1), foi implementado o fluxo completo de cadastro de movimentações financeiras, desde o preenchimento das informações na interface até a persistência dos dados no banco de dados.

## Tecnologias utilizadas

### Front-end
- React
- Vite
- JavaScript
- HTML
- CSS

### Back-end
- Java
- Spring Boot
- Spring Web
- Spring Data JPA
- Bean Validation
- Maven

### Banco de dados
- MySQL

## Funcionalidades da AC1

A primeira versão do FinControl permite:

- Cadastrar receitas e despesas;
- Informar descrição, valor, data, tipo e categoria;
- Armazenar os lançamentos no banco de dados MySQL;
- Consultar os lançamentos cadastrados;
- Visualizar o histórico de movimentações;
- Diferenciar visualmente receitas e despesas;
- Definir automaticamente novos lançamentos com status `PENDENTE`;
- Calcular o total de receitas cadastradas;
- Calcular o total de despesas cadastradas;
- Calcular o resultado financeiro previsto.

## Arquitetura

O funcionamento básico da aplicação ocorre da seguinte forma:

```text
React
  ↓
Spring Boot REST API
  ↓
Spring Data JPA
  ↓
MySQL
```

O front-end envia e consulta dados através da API REST desenvolvida em Spring Boot. O back-end processa as requisições e utiliza o Spring Data JPA para realizar a persistência no banco de dados MySQL.

## Endpoints implementados

### Cadastrar lançamento

```http
POST /lancamentos
```

Realiza o cadastro de uma nova movimentação financeira.

### Listar lançamentos

```http
GET /lancamentos
```

Retorna os lançamentos financeiros cadastrados.

## Regra de status

Todo novo lançamento é registrado automaticamente com o status:

```text
PENDENTE
```

O usuário não seleciona o status durante o cadastro. Essa regra é aplicada pelo back-end e prepara o sistema para a implementação de um fluxo de aprovação nas próximas etapas.

## Como executar o projeto

### Pré-requisitos

Para executar o FinControl localmente, é necessário possuir:

- Java 21 ou superior;
- Node.js;
- npm;
- MySQL.

### Banco de dados

Crie o banco:

```sql
CREATE DATABASE fincontrol;
```

A aplicação utiliza o usuário configurado no `application.properties`.

Por segurança, a senha do banco de dados não é armazenada no código-fonte. Ela deve ser fornecida através da variável de ambiente `DB_PASSWORD`.

No PowerShell:

```powershell
$env:DB_PASSWORD="SENHA_DO_MYSQL"
```

### Back-end

Na raiz do projeto, execute:

```powershell
.\mvnw spring-boot:run
```

O back-end será iniciado em:

```text
http://localhost:8080
```

### Front-end

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

O front-end será disponibilizado em:

```text
http://localhost:5173
```

## Estrutura do projeto

```text
fincontrol/
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
│
├── src/
│   ├── main/
│   │   ├── java/com/fincontrol/
│   │   │   ├── controller/
│   │   │   ├── model/
│   │   │   └── repository/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
│
└── pom.xml
```

## Planejamento

O desenvolvimento do FinControl foi dividido em entregas incrementais.

**AC1 — Cadastro e acompanhamento de lançamentos**

Implementação da estrutura inicial do sistema, cadastro de receitas e despesas, persistência dos dados, histórico das movimentações, status inicial e indicadores básicos.

**AC2 — Fluxo de aprovação**

Implementação do processo de aprovação e rejeição de lançamentos financeiros e evolução do gerenciamento das movimentações.

**AC3 — Gerenciamento e consulta**

Implementação de novas ferramentas para gerenciamento, pesquisa e filtragem das movimentações financeiras.

**Entrega Final — Dashboard gerencial**

Consolidação do sistema com dashboard, gráficos, indicadores financeiros e refinamentos finais da aplicação.

## Status do projeto

**AC1 concluída.**

O projeto continuará sendo desenvolvido nas próximas entregas acadêmicas.