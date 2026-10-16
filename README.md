# MRB Fidelidade

Sistema web de fidelização de clientes da MRB. O cliente faz login e acessa uma carteira virtual com saldo de bônus, pontos, nível, missões e os cupons das promoções da empresa.

- **client/**: React 19 + Vite + React Router (SPA responsiva)
- **server/**: Node.js + Express 5 (API REST com autenticação JWT)

## Requisitos

- Node.js 22 ou superior
- npm 10 ou superior

## Como rodar

```bash
npm install          # instala as dependências da raiz, do server e do client
cp server/.env.example server/.env   # opcional: ajuste porta e segredo do JWT
npm run dev          # sobe a API (http://localhost:3001) e o front (http://localhost:5173)
```

Acesse http://localhost:5173 e entre com o usuário de demonstração:

- **E-mail:** `mariana@mrb.com.br` (ou CPF `123.456.789-09`)
- **Senha:** `123456`

O Vite encaminha as chamadas `/api` para a API, então não é preciso configurar CORS em desenvolvimento.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | API e front juntos, com recarga automática |
| `npm test` | Testes da API (`node --test`) |
| `npm run build` | Build de produção do front em `client/dist` |
| `npm start` | Sobe só a API |

## Telas

| Rota | Conteúdo |
| --- | --- |
| `/login` | Login por e-mail ou CPF, com "manter conectado" |
| `/carteira` | Saldo de bônus, pontos, cupons ativos, nível, campanha da semana, promoções, atividade recente e missões |
| `/promocoes` | Promoções com filtro por categoria, busca e ativação de cupom |
| `/cupons` | Cupons ativados, com código e botão de copiar |

## API

Todas as rotas, exceto `POST /api/auth/login` e `GET /api/health`, exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/login` | `{ login, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Usuário da sessão |
| GET | `/api/wallet` | Resumo: saldo, pontos, nível, cupons ativos |
| GET | `/api/wallet/transactions?limit=10` | Atividade da carteira |
| GET | `/api/wallet/missions` | Missões do mês |
| GET | `/api/wallet/coupons` | Cupons ativados, com código |
| GET | `/api/promotions?category=&q=` | Promoções vigentes |
| GET | `/api/promotions/categories` | Categorias disponíveis |
| GET | `/api/promotions/campaign` | Campanha em destaque |
| POST | `/api/promotions/:id/activate` | Ativa o cupom da promoção |
| DELETE | `/api/promotions/:id/activate` | Desativa o cupom |

## Dados

Os dados ficam em memória (`server/src/data/seed.js`) e voltam ao estado inicial a cada reinício da API. Para usar um banco de dados, substitua `server/src/data/store.js` por uma implementação com as mesmas funções; as rotas não precisam mudar.

## Próximos passos sugeridos

- Banco de dados (PostgreSQL, por exemplo) e cadastro de clientes
- Recuperação de senha e cadastro com o cupom de boas-vindas
- Extrato completo com filtros e paginação
- Painel administrativo para a MRB cadastrar promoções e campanhas
