# Produção ELEVA

Projeto Supabase `xtplovndgwimijqjfdmn`, organização **Eleva the club**, conta conectada **Eleva**, região São Paulo. Criado em 17/10/2026. Aplicadas as sete migrações do repositório. Todas as 15 tabelas públicas têm RLS; buckets de conteúdo e avatar são privados. O cron `eleva-publish-due` publica conteúdos agendados a cada minuto.

## Acesso

O trigger do Auth cria perfil e acesso **FREE** para todo cadastro novo. Metadados enviados pelo usuário nunca concedem plano, papel ou permissões. FREE só acessa a tela de contratação. PRO permite conteúdos e comunidade. Banimento tem precedência sobre PRO e é verificado nas políticas, mesmo com token já emitido. O cliente consulta novamente ao voltar ao app e a cada minuto enquanto ativo. Links de conteúdo já assinados duram no máximo 60 segundos.

O app de produção usa a URL e a chave **publicável** de `src/services/production.ts`; elas são públicas por definição. Variáveis Expo podem substituí-las. Nenhuma chave secreta foi colocada no cliente. A demonstração foi removida do login e a sessão antiga de demonstração é ignorada com backend configurado.

Administradoras podem buscar todas as contas por nome/e-mail, consultar o plano e liberar PRO, retornar para FREE, banir e remover banimento. Cada mudança gera uma linha de auditoria. As funções validam o papel no banco; o cliente não escreve diretamente em `user_access`. O painel impede alteração do próprio acesso e de contas administradoras. Criação de outras administradoras depende de operação confiável.

## Configuração de e-mail pendente no painel

O conector atual cria banco, mas não oferece configuração de Auth/SMTP. O painel pediu login e apresentou CAPTCHA depois da entrada pelo formulário seguro. Sem concluir esta etapa, não considerar cadastro, confirmação e recuperação validados para lançamento público.

- Site URL: `https://eleva-the-club.vercel.app/`.
- Redirect URLs: `https://eleva-the-club.vercel.app/auth/` e `https://eleva-the-club.vercel.app/reset-password/`.
- Manter confirmação de e-mail habilitada. Configurar provedor SMTP próprio para envio a novas usuárias; o remetente padrão tem restrições.
- Verificar nos modelos de confirmação e recuperação se o link respeita o `redirect_to` enviado pelo aplicativo.
- Configurar senha mínima de 10 caracteres no Auth, em acordo com o formulário.
- Validar um cadastro real com e-mail controlado pela equipe, confirmação, login, logout, recuperação, FREE, liberação PRO e banimento.
- Informar os e-mails das primeiras administradoras. Elas devem criar e confirmar suas próprias contas; não gerar senhas compartilhadas.

Após verificar a identidade da administradora e substituir o e-mail, uma pessoa com acesso confiável ao banco pode usar:

```sql
update public.user_access
set role='admin',plan='pro',active=true,banned=false,expires_at=null,updated_at=now()
where user_id=(select id from auth.users where lower(email)=lower('EMAIL_CONFIRMADO_DA_ADMINISTRADORA') and email_confirmed_at is not null);
```

Não promover automaticamente a primeira pessoa cadastrada, domínio inteiro ou endereço passado pelo cliente. Ainda não há contas reais nem administradoras cadastradas neste projeto.

## Contratação e domínio

A contratação é manual por WhatsApp. Até a equipe informar o número comercial, `salesWhatsapp` usa o link do grupo VIP já existente na página oficial. Substituir por uma URL `https://wa.me/55...` via código ou `EXPO_PUBLIC_SALES_WHATSAPP_URL` após receber o número. O app não cobra, não simula pagamento e não libera PRO ao clicar no botão.

O app foi publicado em `https://eleva-the-club.vercel.app/` pela Vercel. O domínio `elevatheclub.com.br` foi associado à Vercel, mas ainda não teve DNS alterado porque a autenticação de dois fatores do Registro.br não foi concluída. Ao migrar, configurar domínio na hospedagem, `EXPO_PUBLIC_SITE_URL`, redirecionamentos do Auth e publicar novamente. SMTP próprio pode exigir registros DNS separados do domínio do app.

## Verificação realizada

TypeScript, 71 testes de comportamento, build GitHub Pages e três suítes SQL em PGlite descartável passaram. A nova suíte cobre provisionamento FREE, metadados maliciosos, leitura privada, promoção indevida, listagem admin, PRO, revogação, banimento e auditoria. No Supabase remoto, verificadas estrutura, grants, trigger, cron e buckets por consultas somente de leitura. Auditor de segurança: nenhum alerta. Auditor de desempenho: índices ainda sem uso e políticas permissivas sobrepostas, sem falha de segurança detectada.

A revisão automática rejeitou a tentativa de inserir fixtures no banco remoto, mesmo com rollback. Nenhum usuário ou conteúdo de teste foi persistido. Testes com credenciais reais, e-mails e dispositivos continuam pendentes. Não afirmar validação no Safari/iPhone ou em build nativo.
