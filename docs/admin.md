# Painel editorial

A rota `/admin` reúne conteúdos e calendário. O acesso real é consultado pelo repositório, com papel administrativo e acesso ativo; a proteção definitiva fica nas políticas RLS. Dados de perfil editáveis não concedem permissão. A demonstração tem acesso local separado e não envia alterações ao servidor.

## Publicações

O editor oferece devocional, treino, aula, mensagem, material, podcast e publicação livre. Devocionais têm data de referência, versículo, reflexão, aplicação e oração. Treinos têm objetivo, duração, nível, equipamentos, exercícios, orientações e profissional responsável. Mensagens aceitam autoria. Os demais formatos usam título, resumo, conteúdo e link de mídia.

Os textos são campos simples com parágrafos. Upload, editor com formatação, gestão de profissionais, eventos e integrantes ainda não estão disponíveis neste painel. Links de mídia aceitam HTTPS. A prévia apresenta a leitura; não envia dados nem reproduz mídia automaticamente.

Salvar rascunho, publicar e agendar aguardam o repositório. Publicação e agendamento têm confirmação com título e consequência. Arquivar retira o item da distribuição. Cancelar agendamento devolve o item a rascunho e limpa o horário. Sair do editor com alterações oferece continuar ou descartar. Na web, Tab permanece no diálogo, Escape aciona essa verificação e a página pede confirmação ao fechar com alterações pendentes.

A lista filtra por status, formato e título/resumo. A agenda organiza o mês escolhido. Os dias pendentes são datas de hoje em diante sem devocional publicado ou agendado. Um dia com rascunho continua pendente e abre o conteúdo existente para edição.

## Horário

Datas são informadas como `AAAA-MM-DD` e horários como `HH:MM`. O fuso mostrado é `America/Sao_Paulo`; o instante é convertido com a base IANA e enviado em UTC. A validação rejeita datas inexistentes, horários inválidos e agendamentos passados. O backend repete as regras essenciais e impede devocionais duplicados por data.

Na demonstração, o horário fica salvo no navegador, mas não existe publicação automática em segundo plano. Em produção, essa execução depende da implantação do serviço agendado documentado no backend.

## Layout e motion

Navegação lateral a partir de 900 px; controles compactos abaixo disso. Listas, calendário e leitura permanecem estáveis. O diálogo usa entrada por opacidade de 180 ms via Reanimated, com redução de movimento do sistema. Botões recebem o feedback compartilhado da aplicação. Não há contadores animados, entradas por linha nem espera artificial antes do retorno.

## Validação pendente em dispositivos

Verificar teclado, foco, Tab/Escape, ampliação de texto e rolagem do diálogo no Safari móvel e Chrome. Build web e TypeScript não substituem essa validação. Verificar também a experiência em builds nativos antes das lojas.
