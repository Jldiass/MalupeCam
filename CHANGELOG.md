# Changelog — Malupe Cam Front-end

## [Não lançado] — 2026-09-05

### Adicionado

- **Mosaicos**: listagem (layout, nome, capacidade, câmeras, usuários, estado), cadastro em wizard de 3 etapas (Dados básicos → Usuários → Câmeras) suportando de 1 a 36 posições, e tela de visualização com os streams HLS ao vivo.
- **Visão geral**: contadores de câmeras online/instável/offline, histórico de mudanças de estado por câmera (com duração) e exportação de relatório em CSV.
- **Usuários e permissões**: CRUD de usuários com atribuição de perfis; CRUD de perfis com permissões agrupadas por área (mosaicos, câmeras, eventos, relatórios, usuários, permissões, sistema).
- **Autenticação completa**: primeiro acesso (`/register`, habilitado só enquanto não existe usuário), login, recuperação e redefinição de senha, refresh automático de sessão.
- Toda a navegação e as ações da interface agora são condicionadas pelas permissões devolvidas por `/auth/me` (`can(permission)` em `src/auth/useAuth.ts`).

### Corrigido

- `vite.config.ts`: a autenticação básica do servidor de preview (usada quando o front é exposto via túnel Cloudflare) comparava o cabeçalho `Authorization` com `===`, suscetível a timing attack. Substituído por `crypto.timingSafeEqual`.

### Contrato de API esperado do backend

Endpoints novos consumidos por este front-end (ver `README.md` para a lista completa):

| Área | Endpoints |
|---|---|
| Mosaicos | `GET/POST /mosaics`, `GET/PATCH/DELETE /mosaics/{id}`, `GET /mosaics/{id}/view` |
| Usuários | `GET/POST /users`, `PATCH/DELETE /users/{id}` |
| Perfis | `GET/POST /roles`, `PATCH/DELETE /roles/{id}`, `GET /permissions` |
| Conectividade | `GET /camera-status/summary`, `GET /camera-status/history`, `GET /camera-status/report` |
| Sessão | `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password` |

**Pendências para a equipe de backend:**

- Confirmar que `POST /auth/register` é rejeitado (409/403) assim que já existir ao menos um usuário ativo — o front-end não impõe essa regra, apenas assume que o backend a garante.
- Definir onde e por quanto tempo as gravações (segmentos do MediaMTX) ficam armazenadas — ainda não documentado/implementado (ver discussão em andamento sobre Cloudflare R2 com retenção de 1 hora).
