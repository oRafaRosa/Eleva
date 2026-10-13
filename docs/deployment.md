# Publicação da ELEVA

A primeira versão usa Expo para exportar o aplicativo web. O Vercel entrega os arquivos de `dist`; Supabase será responsável por autenticação, dados e tarefas do servidor.

## Build web

```bash
npm ci
npm run build:web
```

O comando deve gerar `dist/index.html`. Esta configuração considera uma aplicação de página única, com `web.output` igual a `single`. A regra em `vercel.json` permite abrir diretamente uma rota, como `/admin`, sem receber um erro 404.

Se o aplicativo passar a exportar uma página HTML por rota (`web.output: static`), remova a regra de fallback e valide os links diretos novamente.

## Ambientes

Use uma branch de trabalho para revisão. Publicações de preview permitem revisar o aplicativo sem substituir a versão de produção. Antes de publicar, confira a equipe, o projeto, a branch e o commit.

O repositório de origem é `oRafaRosa/Eleva`. A equipe Vercel disponível nesta sessão é `orafarosas-projects`. Nenhum projeto existia nessa equipe na inspeção inicial de 13/10/2026.

### Situação da configuração

A criação do projeto `eleva` pela conexão Vercel foi recusada com HTTP 403 e a mensagem `You don't have permission to create the project`. O ambiente local também não tinha credenciais da CLI. Por isso, nenhum projeto ou deployment foi criado nesta etapa.

Para concluir a hospedagem, importe `oRafaRosa/Eleva` na equipe correta, selecione o preset **Other** e mantenha os comandos e a pasta de saída de `vercel.json`. Use a branch de revisão para o primeiro preview; deixe a produção para depois da validação.

Depois que houver um projeto, a conexão poderá ser conferida novamente antes de publicar. Não há um arquivo `.vercel/project.json` neste repositório porque ainda não existe um vínculo confirmado.

## Variáveis públicas

As variáveis com prefixo `EXPO_PUBLIC_` ficam acessíveis no aplicativo compilado. Cadastre somente valores que podem ser públicos:

| Variável                               | Uso                                                                 |
| -------------------------------------- | ------------------------------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`             | Endereço do projeto Supabase                                        |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública usada em conjunto com as políticas de acesso do banco |

Não inclua chave `service_role`, chave secreta do Supabase, token Vercel ou credenciais de outros serviços no aplicativo. As operações administrativas precisam ser autorizadas no servidor e pelas políticas do banco.

O modo de demonstração deve continuar disponível enquanto o backend não estiver configurado. Antes de permitir dados reais, teste login, permissões de integrante e administradora, publicação agendada e acesso aos arquivos.

## Conferência do preview

- Abrir no Chrome e Safari, em telas de celular e computador.
- Abrir uma rota interna diretamente e atualizar a página.
- Verificar o teclado nos formulários e a navegação pelo botão voltar.
- Confirmar que a preferência de reduzir movimento é respeitada.
- Confirmar que o modo de demonstração está identificado.
- Conferir os logs de build e a ausência de credenciais nos arquivos publicados.

## Android e iOS

O build web não gera os aplicativos nativos. Android e iOS serão compilados com EAS Build e enviados às lojas depois da revisão dos fluxos, autenticação, notificações e regras de assinatura. Nenhuma publicação nas lojas está configurada nesta etapa.
