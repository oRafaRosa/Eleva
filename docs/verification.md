# Verificação da primeira entrega

## Testes de comportamento

Em 13/10/2026, `npm test` passou nos 15 testes de comportamento, sem falhas. O script usa `node --import tsx --test tests/*.test.ts`. O comando direto `tsx --test` não iniciou neste ambiente por restrição de criação de socket IPC (`EPERM`); o carregador de Node executou a mesma suíte sem esse socket. Os testes editoriais cobrem data de São Paulo na virada do dia em UTC, calendário, conversão de horário, horário de verão histórico, horários inexistentes, título e corpo obrigatórios, data de devocional, agendamento futuro e duração de treino.

O teste de horário de verão é uma regressão histórica. Novos agendamentos usam as regras atuais do fuso `America/Sao_Paulo`.

Os testes da prévia cobrem permissão de administração, invisibilidade de rascunhos e agendados para integrantes, cancelamento de agendamento, publicação, arquivo, duplicidade de devocional, persistência entre instâncias, favoritos e conclusões sem duplicação, etapas, inscrição fictícia e recuperação de armazenamento corrompido. Usam um armazenamento em memória injetado no mesmo serviço da aplicação; não dependem de React Native nem acessam uma base real.

## Revisão de código

A revisão encontrou um instante inválido que podia passar na validação de agendamento, dados privados que podiam permanecer no estado após falha de sessão e detalhes de um formato que podiam acompanhar outro formato no editor. Os responsáveis corrigiram os três casos. A suíte confirmou a rejeição de agendamento inválido. A limpeza de sessão e o editor foram revisados no código, sem teste de interação.

Os conteúdos da prévia e as inscrições fictícias devem continuar identificados. A prévia não concede acesso à base configurada. Agendamento automático e limite real de vagas dependem do banco e de sua configuração, não de um temporizador no navegador.

## Limites desta execução

Não houve teste visual nem interação em Safari, Chrome, Android ou iOS. O ambiente não oferece a ferramenta autorizada para esse tipo de teste. Typecheck, exportação web e testes de serviço não substituem essa validação.

O responsável pelo backend executou a migração e `supabase/tests/security.sql` em PGlite 0.3.14, com estruturas mínimas de `auth` e `storage`. As 13 verificações passaram: leitura apenas de publicações permitidas, bloqueio de alteração de acesso e publicação por integrante, propriedade dos favoritos, leitura administrativa, limite de vagas, ausência de acesso inativo e expirado, bloqueio do agendador para cliente, publicação devida sem repetição e restrição de arquivos privados.

Esse teste valida sintaxe e políticas no banco local. Não valida a API Supabase, sessão real, `pg_cron`, geração de URLs assinadas nem duas transações concorrentes disputando uma vaga. Nenhuma migração foi aplicada a um projeto remoto.

## Roteiro de revisão no dispositivo

1. Em Safari no iPhone e Chrome no Android, abrir a página pública e entrar na prévia. Conferir safe area, ampliação de fonte, teclado e botão voltar.
2. Ler e salvar um conteúdo, marcar conclusão, recarregar e conferir persistência. Remover as marcações e repetir.
3. No painel da prévia, salvar rascunho, revisar e agendar. Conferir a data no fuso de São Paulo, cancelar o agendamento e arquivar.
4. Trocar de integrante para administradora e sair. Conferir se nenhuma informação de outra sessão permanece na tela.
5. Após configurar o backend, repetir com contas reais. Confirmar que uma integrante não lê rascunhos nem publica, mesmo por chamada direta à API.
6. No backend, disputar a última vaga de um encontro com duas contas e conferir que apenas uma inscrição é aceita.
7. Com redução de movimento ativada, conferir feedback de toque e modal. Navegar por teclado no computador, abrir e fechar o editor e conferir foco e leitura dos rótulos.

A plataforma está pronta para revisão somente quando os resultados registrados coincidirem com a versão entregue. Este roteiro registra o que ainda precisa ser confirmado no dispositivo.

## Verificação final

Typecheck e exportação Expo Web concluídos. A suíte final tem 15 testes aprovados, incluindo a seleção do devocional pelo dia de São Paulo. O runner reproduzível `npm run test:sql` passou com 13 verificações SQL no PGlite. O cron remoto e as integrações reais continuam pendentes. `EXPO_OFFLINE=1 npx expo install --check` confirmou dependências compatíveis com o SDK; a checagem online falhou por timeout do proxy.
