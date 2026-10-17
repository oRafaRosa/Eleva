# Backend ELEVA

Projeto `xtplovndgwimijqjfdmn`, organização **Eleva the club**, região São Paulo. As migrações foram aplicadas, os dois buckets são privados e o cron editorial está ativo. Consulte [estado de produção](../docs/production.md) para as etapas pendentes de Auth/SMTP e administradoras.

## Migrações

Os arquivos em `migrations` são aplicados em ordem. O trigger do Auth cria perfil e plano FREE sem aceitar plano/papel dos metadados. RLS exige PRO ativo ou papel admin para conteúdo e atividade; banimento sempre bloqueia. `user_access` não aceita escrita do cliente. As RPCs administrativas validam a administradora, geram auditoria e protegem contas admin.

O cliente usa somente chave publicável. Nenhuma credencial de serviço deve entrar no aplicativo ou no Git. `eleva-content` e `eleva-avatars` são privados; conteúdo publicado usa links assinados de 60 segundos.

## Testes

```bash
npm ci
npm run test:sql
```

Três suítes criam bancos PGlite descartáveis, com Auth/Storage simulados. Cobrem permissões, perfis, arquivos, cadastro FREE, PRO, banimento, gestão administrativa e auditoria. Não executar fixtures em produção. Não substituem testes reais de Auth, e-mail, upload, concorrência de inscrições ou dispositivos.
