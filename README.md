# ELEVA the club

App de conteúdos e experiências sobre corpo, mente e espírito. React Native, Expo e Supabase, com publicação web no GitHub Pages.

## Acesso e operação

Cadastro com e-mail, confirmação, login, recuperação e logout. Toda conta nova começa FREE e vê apenas a contratação pelo WhatsApp. A equipe libera PRO após a confirmação da contratação. Administradoras gerenciam conteúdos, desafios e usuários, liberam ou retiram PRO e banem contas. As permissões são verificadas no banco, com auditoria das alterações de acesso.

As cinco abas oferecem conteúdos, favoritos, conclusão, desafios, inscrições e comunidade. Arquivos são privados. Conteúdos agendados são publicados pelo cron do Supabase. Não há cobrança automática nesta entrega.

O projeto Supabase já foi criado e as migrações aplicadas na conta Eleva. **Ainda falta concluir Auth/SMTP no painel e identificar as primeiras administradoras para validar o lançamento.** Consulte [docs/production.md](docs/production.md) para estado, configuração e limites verificados.

## Desenvolvimento

Node.js 22.13 ou mais recente. A conexão pública está em `src/services/production.ts`, substituível pelas variáveis de `.env.example`. Nunca usar chave secreta no cliente. O login de produção não oferece acesso demonstrativo.

```bash
npm ci
npm run web
npm run typecheck
npm test
npm run test:sql
npm run build:pages
```

Testes SQL usam bancos PGlite descartáveis, sem conectar à produção. O build sai em `dist`; o workflow `.github/workflows/pages.yml` valida e publica a branch main.

## Referências

[App publicado](https://orafarosa.github.io/Eleva/). [Figma](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c).

DESIGN.md contém identidade e interação; PRODUCT.md, escopo; docs/production.md, operação. Supabase: [supabase/README.md](supabase/README.md). Builds nativos e testes reais em Safari/iPhone e Android ainda pendentes. O domínio próprio será configurado após o desenvolvimento.
