# Brain Agriculture API

API REST desenvolvida para o teste técnico **Brain Agriculture - Teste Técnico v2**, com foco no gerenciamento de produtores rurais, propriedades rurais, safras, culturas plantadas e dashboard agrícola.

O projeto foi desenvolvido com **Node.js**, **NestJS**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Docker**, **Swagger/OpenAPI** e testes automatizados.

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Requisitos atendidos](#requisitos-atendidos)
- [Arquitetura](#arquitetura)
- [Modelo de dados](#modelo-de-dados)
- [Fluxos principais](#fluxos-principais)
- [Decisões técnicas](#decisões-técnicas)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Seed de dados](#seed-de-dados)
- [Testes](#testes)
- [Documentação da API](#documentação-da-api)
- [Endpoints principais](#endpoints-principais)
- [Observabilidade e logs](#observabilidade-e-logs)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Possíveis evoluções](#possíveis-evoluções)

---

## Sobre o projeto

A aplicação permite gerenciar produtores rurais e suas propriedades, registrando informações como:

- CPF ou CNPJ do produtor
- Nome do produtor
- Nome da fazenda/propriedade
- Cidade
- Estado
- Área total da fazenda em hectares
- Área agricultável
- Área de vegetação
- Safras
- Culturas plantadas por fazenda e safra

Também disponibiliza um dashboard com dados agregados para visualização de:

- Total de fazendas cadastradas
- Total de hectares registrados
- Distribuição por estado
- Distribuição por cultura plantada
- Distribuição por uso do solo

---

## Tecnologias utilizadas

- Node.js
- TypeScript
- NestJS
- PostgreSQL
- Prisma ORM
- Docker
- Docker Compose
- Swagger/OpenAPI
- Jest
- Supertest
- class-validator
- class-transformer
- Joi

---

## Requisitos atendidos

### Produtores rurais

- Cadastro de produtores rurais
- Edição de produtores rurais
- Inativação de produtores rurais
- Validação de CPF/CNPJ
- Bloqueio de CPF/CNPJ duplicado
- Um produtor pode estar associado a nenhuma, uma ou várias propriedades rurais

### Propriedades rurais

- Cadastro de propriedades por produtor
- Edição de propriedades
- Inativação de propriedades
- Validação da regra de área:

```txt
área agricultável + área de vegetação <= área total
```

### Safras e culturas

- Cadastro de safras
- Edição de safras
- Inativação de safras
- Cadastro de culturas
- Edição de culturas
- Inativação de culturas
- Registro de culturas plantadas por fazenda e safra
- Uma propriedade rural pode ter nenhuma, uma ou várias culturas plantadas por safra

### Dashboard

- Total de fazendas cadastradas
- Total de hectares registrados
- Dados agrupados por estado
- Dados agrupados por cultura plantada
- Dados agrupados por uso do solo

### Qualidade técnica

- API REST
- Docker
- PostgreSQL
- Prisma ORM
- Swagger/OpenAPI
- Testes unitários
- Testes e2e/integrados
- Dados mockados via seed
- Logs
- Health check
- Request ID
- Exception filter global
- Paginação e filtros nas listagens

---

## Arquitetura

A aplicação foi organizada em camadas, separando responsabilidades entre entrada HTTP, validação, regras de negócio e persistência.

```mermaid
flowchart TD
    Client[Cliente / Frontend / Swagger] --> API[NestJS API]
    API --> Controllers[Controllers]
    Controllers --> DTOs[DTOs e ValidationPipe]
    Controllers --> Services[Services]
    Services --> Domain[Regras de domínio]
    Services --> Prisma[Prisma ORM]
    Prisma --> Postgres[(PostgreSQL)]
```

### Camadas

```txt
Controller
  Responsável por receber requisições HTTP e delegar para os services.

DTO
  Responsável pela validação e contrato de entrada da API.

Service
  Responsável por regras de negócio e orquestração.

Domain validators
  Regras puras e testáveis, sem dependência de framework ou banco.

PrismaService
  Camada de acesso ao banco de dados.

PostgreSQL
  Persistência relacional dos dados.
```

Exemplo aplicado na regra de área da fazenda:

```txt
FarmsController
  -> FarmsService
    -> farm-area.validator
      -> valida regra de área
    -> PrismaService
      -> PostgreSQL
```

---

## Modelo de dados

```mermaid
erDiagram
    Producer ||--o{ Farm : owns
    Farm ||--o{ PlantedCrop : has
    Harvest ||--o{ PlantedCrop : groups
    Crop ||--o{ PlantedCrop : planted_as

    Producer {
        string id
        string document
        string documentType
        string name
        string status
        datetime inactiveAt
        datetime createdAt
        datetime updatedAt
    }

    Farm {
        string id
        string producerId
        string name
        string city
        string state
        decimal totalArea
        decimal agriculturalArea
        decimal vegetationArea
        string status
        datetime inactiveAt
        datetime createdAt
        datetime updatedAt
    }

    Harvest {
        string id
        string name
        string status
        datetime inactiveAt
        datetime createdAt
        datetime updatedAt
    }

    Crop {
        string id
        string name
        string status
        datetime inactiveAt
        datetime createdAt
        datetime updatedAt
    }

    PlantedCrop {
        string id
        string farmId
        string harvestId
        string cropId
        string status
        datetime inactiveAt
        datetime createdAt
        datetime updatedAt
    }
```

### Relacionamentos

```txt
Producer 1:N Farm

Farm 1:N PlantedCrop

Harvest 1:N PlantedCrop

Crop 1:N PlantedCrop
```

Cada registro em `PlantedCrop` representa uma cultura plantada em uma determinada fazenda durante uma determinada safra.

Exemplo:

```txt
Fazenda Boa Vista
  Safra 2021
    Soja
    Milho

  Safra 2022
    Café
```

---

## Fluxos principais

### Cadastro de produtor

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant API as NestJS API
    participant ProducerService as ProducersService
    participant Validator as CPF/CNPJ Validator
    participant DB as PostgreSQL

    Client->>API: POST /producers
    API->>ProducerService: create(dto)
    ProducerService->>Validator: normaliza e valida CPF/CNPJ
    ProducerService->>DB: verifica documento duplicado
    ProducerService->>DB: cria produtor
    DB-->>ProducerService: produtor criado
    ProducerService-->>API: produtor
    API-->>Client: 201 Created
```

### Cadastro de fazenda

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant API as NestJS API
    participant FarmService as FarmsService
    participant Domain as Farm Area Validator
    participant DB as PostgreSQL

    Client->>API: POST /producers/:producerId/farms
    API->>FarmService: create(producerId, dto)
    FarmService->>DB: verifica produtor ativo
    FarmService->>Domain: valida áreas da fazenda
    FarmService->>DB: cria fazenda
    DB-->>FarmService: fazenda criada
    FarmService-->>API: fazenda
    API-->>Client: 201 Created
```

### Registro de cultura plantada

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant API as NestJS API
    participant Service as PlantedCropsService
    participant DB as PostgreSQL

    Client->>API: POST /farms/:farmId/planted-crops
    API->>Service: create(farmId, harvestId, cropId)
    Service->>DB: verifica fazenda ativa
    Service->>DB: verifica safra ativa
    Service->>DB: verifica cultura ativa
    Service->>DB: verifica duplicidade ACTIVE
    Service->>DB: cria planted_crop
    DB-->>Service: registro criado
    Service-->>API: cultura plantada
    API-->>Client: 201 Created
```

### Dashboard

```mermaid
sequenceDiagram
    participant Client as Cliente
    participant API as NestJS API
    participant Dashboard as DashboardService
    participant DB as PostgreSQL

    Client->>API: GET /dashboard/summary
    API->>Dashboard: getSummary()
    Dashboard->>DB: total de fazendas
    Dashboard->>DB: soma de hectares
    Dashboard->>DB: agrupamento por estado
    Dashboard->>DB: agrupamento por cultura
    Dashboard-->>API: resumo consolidado
    API-->>Client: 200 OK
```

---

## Decisões técnicas

### Soft delete

Em vez de remover fisicamente os registros, a aplicação utiliza inativação lógica com os campos:

```txt
status: ACTIVE | INACTIVE
inactiveAt: DateTime
```

Isso permite preservar histórico, evitar perda de dados e manter consistência nos relacionamentos.

Exemplo:

```txt
DELETE /producers/:id
```

não remove o produtor do banco. Ele altera:

```txt
status = INACTIVE
inactiveAt = data atual
```

O mesmo padrão foi aplicado em:

- Producers
- Farms
- Harvests
- Crops
- PlantedCrops

---

### CPF/CNPJ

Os documentos são normalizados antes de serem salvos.

Exemplo:

```txt
529.982.247-25
```

é salvo como:

```txt
52998224725
```

A validação verifica:

- tamanho do documento
- dígitos verificadores
- bloqueio de sequências repetidas
- identificação entre CPF e CNPJ

Isso evita duplicidade causada por diferença de pontuação.

---

### Validação de área

A regra:

```txt
área agricultável + área de vegetação <= área total
```

foi extraída para uma função pura de domínio:

```txt
src/farms/domain/farm-area.validator.ts
```

Essa decisão facilita:

- teste unitário
- manutenção
- baixo acoplamento
- separação de responsabilidades

---

### Paginação

As listagens principais possuem paginação para evitar retorno excessivo de dados.

Exemplo:

```txt
GET /producers?page=1&limit=10
```

Formato da resposta:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

Também foi definido limite máximo por página para evitar consultas muito grandes.

---

### Dashboard

O backend entrega os dados agregados para que o frontend possa montar gráficos de pizza sem precisar buscar todos os registros e calcular no client-side.

O dashboard considera apenas registros ativos.

---

### API Contracts

A API utiliza DTOs, validação global com `ValidationPipe` e documentação Swagger/OpenAPI.

Isso ajuda a manter contratos claros entre backend, frontend e possíveis consumidores externos da API.

---

## Como rodar o projeto

### Deploy

A API também pode ser publicada em ambiente cloud usando Docker.

Neste projeto, o deploy pode ser feito como Web Service no Render, utilizando:

- Dockerfile multi-stage
- PostgreSQL gerenciado
- Variável `DATABASE_URL`
- `prisma migrate deploy` no start da aplicação
- Health check em `/health`

Após o deploy, a documentação Swagger fica disponível em:

```txt
https://URL_DA_API/docs
```

E o health check em:

```txt
https://URL_DA_API/health
```

### Pré-requisitos

- Docker
- Docker Compose
- Node.js, caso queira rodar comandos localmente

---

### Subir aplicação com Docker

```bash
docker compose up --build
```

A API ficará disponível em:

```txt
http://localhost:3333
```

Swagger:

```txt
http://localhost:3333/docs
```

Health check:

```txt
http://localhost:3333/health
```

---

### Rodar localmente sem Docker

Suba apenas o PostgreSQL:

```bash
docker compose up -d postgres
```

Instale dependências:

```bash
npm install
```

Rode as migrations:

```bash
DATABASE_URL="postgresql://brain:brain@localhost:5434/brain_agriculture_db?schema=public" npx prisma migrate dev
```

Inicie a API:

```bash
npm run start:dev
```

### Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Exemplo:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://brain:brain@localhost:5434/brain_agriculture_db?schema=public
```

---

## Seed de dados

Para popular o banco com dados mockados:

```bash
docker compose --profile seed run --rm seed
```

Esse comando executa as migrations e roda o seed:

```bash
npx prisma migrate deploy && npm run seed
```

Esse comando cria exemplos de:

- produtores
- fazendas
- safras
- culturas
- culturas plantadas

Após rodar o seed, teste o dashboard:

```bash
curl http://localhost:3333/dashboard/summary
```

---

## Testes

O projeto possui testes unitários e e2e cobrindo controllers, services, DTOs, validators, filters, middlewares, módulos e fluxos principais da API.

Cobertura atual:

- Statements: 99%+
- Lines: 99%+
- Functions: 100%
- Branches: 97%+

### Testes unitários

```bash
npm run test
```

### Testes com coverage

```bash
npm run test:cov
```

### Testes e2e

```bash
npm run test:e2e
```

### Testes via Docker

Antes de rodar os testes e2e pela primeira vez, crie o banco de teste:

```bash
docker compose up -d postgres
docker exec -it brain_agriculture_postgres psql -U brain -d brain_agriculture_db -c "CREATE DATABASE brain_agriculture_test_db;"
```

Se o banco já existir, o comando pode retornar erro informando que `brain_agriculture_test_db` já existe. Nesse caso, pode ignorar.

Depois rode os testes e2e via Docker:

```bash
docker compose --profile test run --rm test
```

Esse comando executa as migrations no banco de teste e roda os testes e2e:

```bash
npx prisma migrate deploy && npm run test:e2e
```

Os testes e2e utilizam um banco separado:

```txt
brain_agriculture_test_db
```

### Estratégia de testes

Os testes unitários cobrem principalmente regras puras e utilitários:

- Validação de CPF/CNPJ
- Validação de áreas da fazenda
- Paginação
- Request ID
- DashboardService

Os testes e2e cobrem fluxos reais da API:

- Producers
- Farms
- Planted Crops
- Dashboard

---

## Documentação da API

A documentação OpenAPI é gerada automaticamente pelo Swagger.

Swagger UI:

```txt
http://localhost:3333/docs
```

OpenAPI JSON:

```txt
http://localhost:3333/docs-json
```

---

## Endpoints principais

### Health

```txt
GET /health
```

---

### Producers

```txt
POST   /producers
GET    /producers
GET    /producers/:id
PATCH  /producers/:id
DELETE /producers/:id
```

Filtros:

```txt
GET /producers?page=1&limit=10&search=joao
```

---

### Farms

```txt
POST   /producers/:producerId/farms
GET    /producers/:producerId/farms
GET    /farms/:id
PATCH  /farms/:id
DELETE /farms/:id
```

Filtros:

```txt
GET /producers/:producerId/farms?page=1&limit=10&state=SP&search=boa
```

---

### Harvests

```txt
POST   /harvests
GET    /harvests
GET    /harvests/:id
PATCH  /harvests/:id
DELETE /harvests/:id
```

Filtros:

```txt
GET /harvests?page=1&limit=10&search=2021
```

---

### Crops

```txt
POST   /crops
GET    /crops
GET    /crops/:id
PATCH  /crops/:id
DELETE /crops/:id
```

Filtros:

```txt
GET /crops?page=1&limit=10&search=soja
```

---

### Planted Crops

```txt
POST   /farms/:farmId/planted-crops
GET    /farms/:farmId/planted-crops
GET    /planted-crops/:id
DELETE /planted-crops/:id
```

Filtros:

```txt
GET /farms/:farmId/planted-crops?page=1&limit=10&cropId=:cropId&harvestId=:harvestId
```

---

### Dashboard

```txt
GET /dashboard/summary
```

Exemplo de resposta:

```json
{
  "totalFarms": 4,
  "totalHectares": 5900,
  "farmsByState": [
    {
      "state": "GO",
      "total": 1
    },
    {
      "state": "MG",
      "total": 1
    },
    {
      "state": "MT",
      "total": 1
    },
    {
      "state": "SP",
      "total": 1
    }
  ],
  "farmsByCrop": [
    {
      "crop": "Algodão",
      "total": 1
    },
    {
      "crop": "Café",
      "total": 1
    },
    {
      "crop": "Milho",
      "total": 2
    },
    {
      "crop": "Soja",
      "total": 4
    }
  ],
  "landUse": {
    "agriculturalArea": 4050,
    "vegetationArea": 1350
  }
}
```

---

## Observabilidade e logs

A aplicação possui recursos básicos de observabilidade:

- Health check com validação de conexão com PostgreSQL
- Request ID por requisição
- Header `x-request-id` na resposta
- Exception filter global
- Logs de operações principais
- Logs de erros HTTP e erros inesperados

Exemplo de resposta de erro:

```json
{
  "statusCode": 400,
  "message": "CPF ou CNPJ inválido.",
  "error": "Bad Request",
  "path": "/producers",
  "method": "POST",
  "timestamp": "2026-05-19T00:00:00.000Z",
  "requestId": "request-id"
}
```

---

## Estrutura de pastas

```txt
src/
  common/
    dto/
    filters/
    middlewares/
    utils/
    validators/
  config/
  crops/
  dashboard/
  farms/
    domain/
    dto/
  harvests/
  health/
  planted-crops/
  prisma/
  producers/
prisma/
  migrations/
  schema.prisma
  seed.ts
test/
  helpers/
  producers.e2e-spec.ts
  farms.e2e-spec.ts
  planted-crops.e2e-spec.ts
  dashboard.e2e-spec.ts
```

## Preparação para ambiente corporativo

Além da execução local com Docker, o projeto inclui arquivos de apoio para cenários corporativos e cloud-native.

### CI com GitHub Actions

O projeto possui workflow em:

```txt
.github/workflows/ci.yml
```

Esse workflow executa:

- instalação de dependências
- geração do Prisma Client
- migrations em PostgreSQL de teste
- lint
- testes unitários com coverage
- testes e2e
- build da aplicação

### Jenkins, SonarQube e Nexus

O projeto também inclui:

```txt
Jenkinsfile
sonar-project.properties
```

O `Jenkinsfile` representa uma pipeline corporativa compatível com ambientes que usam Bitbucket + Jenkins, contemplando estágios de lint, testes, build, análise SonarQube, build de imagem Docker e publicação em registry Nexus.

O `sonar-project.properties` deixa o projeto preparado para análise de qualidade com SonarQube, usando o relatório de cobertura gerado pelo Jest.

### Kubernetes/EKS

O projeto possui manifests Kubernetes em:

```txt
infra/k8s/
```

Arquivos incluídos:

- `namespace.yaml`
- `deployment.yaml`
- `service.yaml`
- `ingress.yaml`

Esses manifests preparam a aplicação para execução em Kubernetes, incluindo readiness probe, liveness probe, service interno e ingress compatível com AWS Load Balancer Controller.

Em uma arquitetura AWS, a API poderia ser executada no EKS, exposta por um Application Load Balancer provisionado pelo AWS Load Balancer Controller. Caso necessário, o AWS API Gateway poderia ficar na frente do Load Balancer usando VPC Link, adicionando uma camada extra de governança, roteamento e controle de entrada.

---

## Possíveis evoluções

Algumas melhorias possíveis para evolução futura:

- Autenticação e autorização
- Migração do deploy para AWS EKS
- Exposição pública via AWS API Gateway integrado ao Application Load Balancer
- Publicação real de imagem Docker em registry Nexus
- Execução de quality gate real com SonarQube em ambiente corporativo
- Cache para dashboard
- Métricas com Prometheus
- Logs estruturados em JSON
- Índices únicos parciais no PostgreSQL para reforçar regras com soft delete
- Filtros avançados no dashboard
- Versionamento de API
