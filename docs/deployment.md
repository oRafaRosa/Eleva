# Publicação da ELEVA na Vercel

Repositório: `oRafaRosa/Eleva`. Equipe conectada: `orafarosas-projects`, ID `team_cZywE7XZ9eDswWZXKErLw2gJ`. Nome proposto para o projeto novo: `eleva-the-club`.

## Estado

Em 17/10/2026, o conector recusou criar o projeto com HTTP 403: `You don't have permission to create the project`. Não existe projeto ELEVA nessa equipe, nem credencial de CLI disponível nesta sessão. Nenhum deployment Vercel foi criado. O GitHub Pages permanece ativo até a nova hospedagem estar verificada.

## Importação

Importar o repositório na equipe acima, preset **Other**, Node 24, instalação `npm ci`, build `npm run build:vercel`, saída `dist`. Conectar a branch de produção `main`. Habilitar as variáveis de sistema da Vercel. O script deriva a URL canônica de `VERCEL_PROJECT_PRODUCTION_URL`; `EXPO_PUBLIC_SITE_URL` pode sobrescrevê-la com uma origem HTTPS sem subpasta.

O build da Vercel usa caminhos na raiz, preserva os ícones para a Tela de Início e gera a prévia de e-mail com imagens na nova hospedagem. A versão do modelo pronta para copiar ao Supabase fica em `/email/confirmation-template.html`. Essa publicação de arquivo não aplica o modelo ao Auth.

A URL e a chave publicável Supabase têm valores padrão em `src/services/production.ts`. Não adicionar chave secreta ou `service_role` ao cliente. A implantação não muda os planos ou permissões do banco.

## Depois da publicação

1. Verificar status READY, commit correto, página pública, foto completa, login, cadastro, convite e rota interna atualizada diretamente.
2. Conferir `/site.webmanifest`, `/icons/eleva-seal-180-v2.png` e `/email/confirmation-preview.html`, com imagens carregadas.
3. Configurar a Site URL e os redirects `/auth/` e `/reset-password/` no Supabase para a origem definitiva. Ainda dependem de acesso ao painel; SMTP próprio e primeiros e-mails admin continuam pendentes.
4. Atualizar o modelo no Supabase com o endereço novo. Não desativar a hospedagem antiga enquanto algum modelo ativo depender das imagens de lá.
5. Após a verificação, remover o disparo automático de `.github/workflows/pages.yml` e desativar o Pages nas configurações do repositório, conforme autorizado por Rafa. O repositório continua sendo a fonte de código.

O domínio `elevatheclub.com.br` será conectado após o desenvolvimento. A migração atual não autoriza mudanças de DNS antes dessa etapa já combinada. Builds Android/iOS e publicação nas lojas são separados da hospedagem web.
