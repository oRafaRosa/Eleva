# Publicação da ELEVA na Vercel

Repositório: `oRafaRosa/Eleva`. Equipe conectada: `orafarosas-projects`, ID `team_cZywE7XZ9eDswWZXKErLw2gJ`. Nome do projeto: `eleva-the-club`.

## Estado

Publicado em **https://eleva-the-club.vercel.app/** em 17/10/2026. Projeto `eleva-the-club`, equipe `orafarosas-projects`, branch `main`. Primeiro deployment `dpl_2LBsM9FqGpxXeco1LSxhCtcENtUJ`, commit `7e0ac0f0084ed8c09cccc1ded048395cc0d7b66c`. A criação pelo conector retornou 403; a importação pelo painel autenticado foi concluída.

O workflow GitHub agora executa apenas validação, sem publicar Pages. O site antigo ainda não foi despublicado: a proteção de credenciais do navegador bloqueou a observação da página de configurações. Não há mais jobs que publiquem Pages. O Supabase ainda pede login no painel para Site URL, redirects e SMTP; não afirmar validação de confirmação e recuperação de e-mail.

## Importação

Importar o repositório na equipe acima, preset **Other**, Node 24, instalação `npm ci`, build `npm run build:vercel`, saída `dist`. Conectar a branch de produção `main`. Habilitar as variáveis de sistema da Vercel. A origem canônica padrão é `https://eleva-the-club.vercel.app`, já verificada. Após concluir o DNS do domínio próprio, configurar `EXPO_PUBLIC_SITE_URL=https://elevatheclub.com.br` na Vercel e redeployar. A origem precisa usar HTTPS e não ter subpasta. Um domínio ainda sem DNS não deve substituir os links de autenticação.

O build da Vercel usa caminhos na raiz, preserva os ícones para a Tela de Início e gera a prévia de e-mail com imagens na nova hospedagem. A versão do modelo pronta para copiar ao Supabase fica em `/email/confirmation-template.html`. Essa publicação de arquivo não aplica o modelo ao Auth.

A URL e a chave publicável Supabase têm valores padrão em `src/services/production.ts`. Não adicionar chave secreta ou `service_role` ao cliente. A implantação não muda os planos ou permissões do banco.

## Depois da publicação

1. Verificar status READY, commit correto, página pública, foto completa, login, cadastro, convite e rota interna atualizada diretamente.
2. Conferir `/site.webmanifest`, `/icons/eleva-seal-180-v3.png` e `/email/confirmation-preview.html`, com imagens carregadas. No iPhone, atalhos existentes precisam ser removidos e adicionados novamente para atualizar o ícone da tela inicial.
3. Configurar a Site URL e os redirects `/auth/` e `/reset-password/` no Supabase para a origem definitiva. Ainda dependem de acesso ao painel; SMTP próprio e primeiros e-mails admin continuam pendentes.
4. Atualizar o modelo no Supabase com o endereço novo. Não desativar a hospedagem antiga enquanto algum modelo ativo depender das imagens de lá.
5. Após a verificação, remover o disparo automático de `.github/workflows/pages.yml` e desativar o Pages nas configurações do repositório, conforme autorizado por Rafa. O repositório continua sendo a fonte de código.

Em 17/10/2026, Rafa autorizou a configuração de `elevatheclub.com.br`. O domínio foi associado à produção na Vercel. Registro exigido pelo painel: A, nome @, valor `216.198.79.1`. DNS ainda não alterado: o Registro.br pediu chave de acesso de 8 dígitos enviada para `elevatheclub@…`, e essa validação não foi concluída. Não registrar credenciais ou códigos nos arquivos. Antes de alterar DNS, inspecionar os registros existentes e preservar MX/TXT e demais serviços. Builds Android/iOS e publicação nas lojas são separados da hospedagem web.
