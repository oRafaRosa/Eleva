# ELEVA

Primeira versão da plataforma de conteúdos e experiências para mulheres. React Native com Expo, pensada para Safari e Chrome móveis, com preparação para Android e iOS.

## O que funciona nesta entrega

Apresentação pública, login conectado quando configurado, cinco abas da integrante, devocionais, treinos, mensagens, publicações livres, biblioteca com busca e filtros, favoritos, conclusão de conteúdo, etapas de desafios e inscrição de exemplo.

O painel administrativo permite criar e editar sete formatos, visualizar a prévia, salvar rascunhos, publicar, agendar, cancelar agendamento e arquivar. O calendário aponta dias sem devocional.

Sem variáveis Supabase, a experiência usa uma demonstração identificada, com conteúdo fictício e persistência local. As inscrições não são reais. O agendamento grava a programação; a publicação automática depende do servidor configurado.

## Rodar no computador

Requer Node.js 22.13 ou mais recente.

```bash
npm ci
npm run web
```

Na página inicial, escolha Entrar na ELEVA. No login, escolha Jeice para explorar a área da integrante ou Rebeca para entrar no painel administrativo. As duas contas de exemplo não exigem senha.

```bash
npm run typecheck
npm test
npm run test:sql
npm run build:web
```

O build web sai em dist. O teste SQL usa banco descartável PGlite e estruturas simuladas de Auth/Storage; não conecta aos projetos da sua conta.

## Conectar o Supabase

Copie .env.example para .env.local e configure a URL do projeto e a chave publicável. Leia supabase/README.md antes de aplicar as migrações e conceder acessos. Não use chave service_role ou secret no cliente. Nenhum projeto remoto foi criado ou alterado nesta entrega.

## Design e agentes

[Figma da ELEVA](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c). As telas do Figma são referências editáveis, não capturas do aplicativo.

DESIGN.md registra tokens, composição, escrita e motion. PRODUCT.md delimita a entrega. Oito skills estão em .agents/skills, com versões e licenças registradas. .codex/agents tem cinco papéis para trabalhos futuros; todos exigem português BR natural, sem travessões ou slogans genéricos.

## Publicação e próximos passos

vercel.json está preparado para a versão web. A conexão atual retornou 403 ao criar o projeto; não há preview remoto. Leia docs/deployment.md para importar o repositório no Vercel. eas.json prepara perfis de builds nativos, ainda não executados.

Pagamentos, cadastro público, recuperação de senha, envio de notificações, upload de mídia pelo editor, player integrado e publicação nas lojas ficam para etapas seguintes. Link de mídia HTTPS abre externamente nesta versão.

## Verificação

Typecheck, build web, 24 testes de comportamento e 13 verificações SQL passaram. O diagnóstico Expo offline confirmou dependências compatíveis; a checagem online não concluiu por timeout de proxy. Não houve teste de navegador ou dispositivo nesta execução. Veja docs/verification.md para o roteiro pendente.

## GitHub Pages

A publicação pelo Pages está configurada em `.github/workflows/pages.yml`. `npm run build:pages` prepara `/Eleva/`, assets e fallback de rotas internas. Leia docs/github-pages.md para a ativação inicial nas configurações do repositório. O endereço só estará disponível após o workflow publicar com sucesso.

## Comunidade e contas de exemplo

A aba Conectar permite criar publicações, curtir, comentar, denunciar e remover mensagens próprias. Comentários têm rota própria. Rebeca pode moderar. Na demonstração, as conversas ficam no mesmo navegador; alternar contas permite testar as duas identidades. Compartilhamento entre dispositivos exige aplicar a migração do fórum no Supabase configurado. Jeice e Rebeca têm favoritos, progresso e inscrições próprios. A chave interna da integrante permanece estável para preservar os dados já salvos.

As ilustrações leves são vetores do próprio app. Motion usa Reanimated, com entrada discreta, feedback de toque e respeito à redução de movimento. A saudação da página inicial usa Source Sans 3 Bold.
