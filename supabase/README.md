# Backend ELEVA

## Estado desta entrega

As migrações e o cliente Supabase estão preparados. Nenhum projeto remoto foi alterado. A conta conectada possui outros projetos, mas não um projeto ELEVA. A criação precisa de uma organização escolhida e da confirmação do custo apresentada pelo Supabase.

A demonstração usa dados fictícios e armazenamento local. Não cria contas, inscrições reais ou assinatura. O agendamento da demonstração grava a data; a publicação automática depende do cron do backend.

## Configuração

1. Crie um projeto próprio para a ELEVA ou escolha um ambiente de desenvolvimento dedicado.
2. Aplique as migrações de `supabase/migrations` em ordem, pelo CLI Supabase ou pelo fluxo de migrações da plataforma. A segunda exige a extensão `pg_cron` disponível no projeto.
3. Configure `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nunca coloque uma chave secret/service role no aplicativo.
4. Configure as URLs de redirecionamento do Auth para a web e o esquema nativo. O aplicativo usa e-mail e senha; confirmação de e-mail e recuperação dependem dessas URLs e do SMTP.
5. Após criar as contas, atribua o primeiro acesso administrativo pelo SQL Editor confiável. A tabela `user_access` não aceita escrita dos clientes.

Exemplo, substituindo o UUID de uma conta já existente:

```sql
insert into public.user_access(user_id,role,active)
values ('UUID_DA_CONTA'::uuid,'admin',true)
on conflict(user_id) do update set role='admin',active=true;
```

As integrantes precisam de `active=true` e `expires_at` vazio ou no futuro. O faturamento e o webhook que concederá esses direitos ainda não foram implementados. Cadastro no Auth, sozinho, não libera conteúdo.

## Conteúdo e arquivos

Devocionais exigem uma data de referência. Apenas um devocional publicado ou agendado é permitido para cada dia. O horário de publicação deve ser enviado em ISO UTC, convertido a partir de America/Sao_Paulo pela interface. O job `eleva-publish-due` verifica pendências a cada minuto; atraso esperado de até um minuto, além do tempo de execução.

O bucket `eleva-content` é privado. Use caminhos no formato `<publication_uuid>/arquivo.pdf`. A integrante acessa somente arquivos vinculados a publicações já publicadas e com acesso ativo. Administradoras podem criar e substituir arquivos. Links assinados devem ter prazo curto; remover o acesso não invalida imediatamente um link assinado existente.

Publicações usam corpo em texto simples, preservando quebras de linha. Não renderize HTML recebido do banco sem sanitização. `media_url` está preparado, mas uma política de provedores e streaming deve ser definida antes de publicar vídeos restritos. Não use links públicos como proteção de conteúdo.

## Verificação

`supabase/tests/security.sql` é uma transação reversível para um banco local descartável, após aplicar as migrações. Não rode em produção. Cobre segredo de rascunhos, bloqueio de escrita das integrantes, proteção dos papéis, propriedade dos favoritos, acesso inativo e lotação do evento.

Para reproduzir o teste embarcado, instale as dependências do repositório e execute:

```bash
npm ci
node supabase/tests/run-security.mjs
```

O runner usa `@electric-sql/pglite` na versão fixa `0.3.14`, com estruturas de Auth e Storage definidas em `supabase/tests/platform-shim.sql`. Cada execução cria um banco descartável, aplica a migração principal e roda 13 verificações de segurança. Não conecta ao Supabase remoto nem aplica a migração de cron.

A migração principal e esses testes passaram no Postgres embarcado PGlite com estruturas de Auth e Storage simuladas. Isso verifica SQL e RLS, mas não substitui testes no Supabase real, envio de e-mail, cron, API REST, uploads, concorrência de inscrições ou autenticação em dispositivos.

O job de notificações, faturamento, auditoria editorial completa e moderação de comunidade ficam para uma próxima entrega. O cron publica conteúdo; não envia mensagens.
