# GitHub Pages

O workflow `.github/workflows/pages.yml` exporta a versão web após mudanças em main. O comando `npm run build:pages` define `/Eleva` apenas nesse build; a versão Vercel e os aplicativos nativos mantêm seus caminhos normais.

O build inclui `.nojekyll`, caminhos dos arquivos estáticos e uma página 404 com a mesma aplicação. Abrir uma rota interna diretamente pode retornar HTTP 404, mas o aplicativo carrega e o Expo Router abre a tela solicitada. Essa é uma limitação do servidor estático do Pages.

## Ativação inicial

Em Settings → Pages → Build and deployment, selecionar GitHub Actions como Source. A conexão GitHub disponível não oferece alterações administrativas do Pages. Depois de ativar, executar novamente o workflow de publicação.

Endereço esperado após publicação: https://orafarosa.github.io/Eleva/ . A existência desse endereço só é confirmada depois que o workflow termina com sucesso e o site responde.

Esta publicação usa a demonstração identificada. Sem variáveis Supabase no workflow, não conecta ao ambiente real. Não colocar chaves secret ou service_role nas variáveis públicas.
