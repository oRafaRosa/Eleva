# Revisão mobile da ELEVA

14/10/2026. Código de produto revisado: `2b9fac542e952afe3c2cd7476b3757596d1b5b4e`.

Leio a ELEVA como uma plataforma de conteúdo, bem-estar e comunidade para mulheres, usada em sessões curtas no celular, com identidade editorial e navegação simples, primeiro em Safari e Chrome móveis.

Base: skills locais `mobile-design` e `mobile-native`, instruções do projeto, PRODUCT.md e DESIGN.md. Intensidade escolhida: identidade 5/10, motion 3/10 e densidade 5/10. Isso significa preservar bordô, rosa, marfim e fontes, usar movimento como resposta às ações e aproximar o conteúdo sem diminuir áreas de toque.

Esta é uma revisão, não uma implementação. Nenhuma tela foi alterada. A evidência é a leitura do código de todas as rotas e componentes compartilhados. Não houve navegação em browser, captura atual de telas ou teste em dispositivos. Os prints enviados por Rafa mostram uma versão anterior aos filtros recolhidos, por isso não foram tratados como retratos do código atual. Não há orientação de API específica de versão nesta revisão.

## Cinco prioridades

1. Mostrar na leitura os campos que a admin preenche. Parte do devocional e do treino hoje desaparece entre o editor e a tela da integrante.
2. Proteger alterações no perfil e validar formulários com teclado aberto. Simplificar uma tela não pode significar perder o que a pessoa digitou.
3. Reduzir o cabeçalho e as escolhas simultâneas no admin mobile. É a área que mais mantém a lógica de painel desktop.
4. Dar aos comentários uma navegação própria e mostrar o período dos desafios. A pessoa precisa saber onde está e o que está em andamento.
5. Completar o padrão compartilhado de toque, imagens e recuperação de erro. O layout deve continuar estável quando algo demora ou falha.

## Achados e correções mínimas

### 1. Conteúdo cadastrado não chega inteiro à integrante

**[P1] MD-004 · bloqueio · confirmado no código.**

Evidências: `src/components/admin/PublicationEditor.tsx:84` grava os detalhes como texto; `:153` preserva esses valores no rascunho. `:469` oferece aplicação e oração; `:475` oferece objetivo, duração, nível, equipamentos, exercícios, orientações e profissional. Já `app/content/[id].tsx:47` lê apenas o versículo, e `:76` só mostra exercícios quando o valor é um array.

Efeito: um treino digitado no campo de exercícios pode aparecer sem os exercícios. Oração, aplicação e informações que ajudam a decidir se um treino serve para a pessoa não são renderizadas. A prévia do editor mostra esses campos (`PublicationEditor.tsx:326`), dando à admin uma impressão diferente da publicação final.

Correção mínima: renderizar os detalhes de cada formato com uma hierarquia curta e consistente; aceitar o formato de exercícios efetivamente salvo pelo editor. Mostrar duração, nível e equipamentos como metadados úteis, não como cartões separados. Fazer a prévia usar a mesma estrutura da leitura real. Não resolver isso acrescentando texto explicativo à tela.

### 2. Perfil perde alterações ao sair; teclado exige validação

**[P2] MD-005 · descarte de edição pendente · confirmado no código.**

Evidências: `app/profile-edit.tsx:20` mantém alterações apenas em estado local; `:168` usa o Voltar compartilhado, que executa `router.back()` em `src/components/ui.tsx:132`. O editor de conteúdo já protege o descarte (`PublicationEditor.tsx:89`), mas o perfil não segue esse padrão. Cancelar é uma ação explícita de desistência; sua ausência de confirmação, isoladamente, não comprova defeito.

Efeito: uma foto preparada ou dados digitados são descartados ao voltar, sem aviso. Correção mínima: proteger a navegação de retorno quando houver edição pendente, oferecendo Continuar editando ou Descartar. Não confirmar quando nada foi alterado e não tratar toda ação de Cancelar como acidente.

**[P2] MD-003 · usabilidade · risco de teclado ainda não validado.**

Evidências: `src/components/ui.tsx:122` fornece rolagem e persistência de taps, mas não explicita ajuste ao teclado nem foco entre campos. Os dois editores têm modal com altura máxima de 94%, cabeçalho fora da rolagem e formulário rolável (`PublicationEditor.tsx:248`, `:273`, `:614`; `ChallengeEditor.tsx:149`, `:160`, `:292`). Perfil e login não definem avanço entre campos. Isso não prova que o teclado cobre os campos no navegador atual.

Correção mínima: testar foco e envio em tela pequena antes de escolher um ajuste técnico. Garantir que o campo focado e a ação de salvar fiquem alcançáveis; permitir avanço de foco onde fizer sentido. No perfil, a foto é cortada no centro automaticamente (`profile-edit.tsx:93`): manter a prévia e permitir reposicionar o recorte se fotos reais mostrarem rostos cortados. É risco de enquadramento, não falha comprovada em toda foto.

### 3. Admin ainda apresenta escolhas demais antes da tarefa

**[P2] MD-003 · usabilidade · estrutura confirmada; impacto no primeiro viewport não medido.**

Evidências: `app/admin.tsx:369` coloca logo e quatro controles de navegação antes do título; `:395` acrescenta título em 44px e ação de criação; `:491` começa a barra de listagem. A navegação quebra em linhas quando necessário. No editor, sete opções de formato e três de pilar antecedem o título (`PublicationEditor.tsx:357`, `:374`, `:390`). O título recebe foco automaticamente, podendo abrir o teclado logo na entrada.

Efeito provável: em telefone, a admin precisa atravessar várias linhas de controles antes de ver a primeira publicação ou começar a escrever. A integrante já ganhou cabeçalhos compactos, mas o admin ainda ocupa mais espaço com a estrutura do painel.

Correção mínima: cabeçalho mobile único com título curto, ação de criação e acesso secundário à plataforma. Manter Conteúdos, Calendário e Desafios, sem tratar Plataforma como uma quarta seção equivalente. No editor, priorizar Título e texto; deixar formato/pilar selecionados em uma linha compacta que expande ao editar. Recolher agendamento até a ação Agendar, mantendo o horário escolhido visível quando ativo.

Datas e horários são digitados em formatos técnicos (`PublicationEditor.tsx:452`, `:514`; `ChallengeEditor.tsx:197`; `app/admin.tsx:573`). Usar seleção de data/mês e rótulos em formato familiar reduziria erros. A confirmação e o horário de Brasília devem permanecer, sem o identificador técnico de fuso como texto principal.

### 4. Comunidade e desafios precisam de contexto de navegação

**[P2] MD-006 · usabilidade · confirmado no código.**

Evidências: `app/(tabs)/connect.tsx:28` guarda a publicação aberta em `selected`; `:197` e `:375` trocam esse estado sem mudar a rota; `:239` implementa um Voltar local. A rolagem pertence à mesma Page e não há reposicionamento explícito ao abrir comentários.

Efeito: o histórico do navegador não representa a entrada nos comentários. Atualizar a página perde a seleção; o Voltar do navegador não pode desfazer essa seleção como uma etapa própria. A posição em que os comentários começam a aparecer precisa ser testada, pois não há controle explícito no código.

Correção mínima: detalhe da publicação com rota própria, retornando à lista e preservando a posição de leitura. Colocar comentário e respostas no mesmo fluxo, sem duplicar o título Comentários nem usar um botão de largura inteira para voltar quando um controle de cabeçalho resolve. Manter coração, comentários e opções de moderação separados.

**[P2] MD-004 · usabilidade · confirmado no código.**

Evidências: `ChallengeEditor.tsx:197` cadastra início e fim, mas `app/(tabs)/live.tsx:39` exibe título, descrição e ações sem o período.

Efeito: a integrante não vê se o desafio está começando, em andamento ou já terminou. Correção mínima: mostrar período em uma linha, junto do título. O link Abrir no GymRats está bem nomeado e não deve virar uma inscrição fictícia dentro da ELEVA.

### 5. Toque, capas e erros ainda não seguem o mesmo contrato

**[P2] MD-001 · usabilidade · área de toque insuficiente confirmada no componente.**

Evidências: `src/components/ui.tsx:198` torna a ação de Section clicável sem altura mínima, padding ou área ampliada; o texto tem 15px (`:476`). A Home usa esse controle para Ver todos (`app/(tabs)/home.tsx:41`). Chips, busca, filtros, ações sociais e checklists já reservam 48px ou mais.

Correção mínima: manter o texto discreto, ampliando somente a área clicável para o padrão de 48px do projeto. Não aumentar toda a seção nem tirar rótulos em favor de ícones.

**[P2] MD-008 · usabilidade · ausência de reserva de espaço confirmada; salto visual não medido.**

Evidências: `src/components/ui.tsx:274` começa a capa sem URL, `:278` a limpa ao mudar o caminho e `:316` retorna nada até a resolução. Quando aparece, recebe 84px, 128px ou 240px. A falha de resolução é ignorada em `:293`, e a Image não tem estado de erro próprio.

Efeito possível: título e texto mudam de posição quando a capa aparece. Correção mínima: reservar a área prevista para capas presentes, usar um fundo simples durante a espera e resolver falha sem insistir em imagem quebrada. Preservar miniatura na listagem e imagem maior no detalhe. Não transformar toda publicação em um banner. A prévia do editor usa 180px e recorte cover para imagem recém-selecionada (`PublicationEditor.tsx:295`), mas o detalhe usa 240px e contain (`ui.tsx:303`): alinhar a prévia ao destino evita surpresa de enquadramento.

**[P2] MD-004 · usabilidade · distinção de erro ausente nas telas.**

Evidências: Aprender consome só publicações e loading (`app/(tabs)/learn.tsx:17`); Viver só os dados de atividades (`live.tsx:22`); Meu ELEVA não consome loading/error (`profile.tsx:15`). Apenas Home mostra o erro global (`home.tsx:31`). Comunidade mostra notice, mas não oferece Recarregar quando refresh falha (`connect.tsx:55`, `:227`).

O fluxo global também precisa de atenção: `src/state/AppProvider.tsx:141` limpa os dados e a identidade em qualquer falha de refresh, e `app/(tabs)/_layout.tsx:9` redireciona quando a identidade fica vazia. Uma falha de conteúdo não deve ser tratada automaticamente como saída da conta. A autenticação inválida precisa continuar protegida.

Correção mínima: diferenciar lista vazia, lista filtrada sem resultados, falha de carregamento e sessão inválida; oferecer Tentar novamente junto do erro de dados. Não adicionar um aviso permanente em todas as páginas. Em Meu ELEVA, calcular o vazio a partir dos conteúdos salvos que ainda existem, não apenas de `favorites.length` (`profile.tsx:67`, `:72`).

## Cobertura das rotas

| Tela                  | O que manter                                                                      | O que revisar                                                                                                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                   | Identidade editorial e uma ação de entrada                                        | Logo da Page mais wordmark do hero repetem a marca; CTA vem depois de título 48px e bloco introdutório. Enxugar para entrada mais rápida, sem descaracterizar a marca (`app/index.tsx:10`, `:20`, `:26`, `:33`).                      |
| `/login`              | Marina e Rebeca identificadas por papel, sem senha falsa                          | Os exemplos estão explicitados uma vez. Formulário real é condicional; validar teclado e recuperação desse fluxo quando backend existir (`app/login.tsx:58`, `:85`).                                                                  |
| Início                | Saudação forte e devocional destacado antes de conteúdo secundário                | Ver todos com alvo pequeno; seção de encontro aparece mesmo se não há evento (`home.tsx:52`). Não acrescentar banners de apresentação.                                                                                                |
| Aprender              | Busca/filtros recolhidos, estado expandido, critérios ativos e Limpar visíveis    | Erro distinto de vazio; validar título e dois controles em largura pequena e fonte ampliada. Não reabrir filtros por padrão (`learn.tsx:30`, `:79`).                                                                                  |
| Viver                 | Desafios antes dos encontros; progresso confirmado e link externo claro           | Período ausente; todas as etapas de todos os desafios ficam expandidas (`live.tsx:31`, `:65`). Se houver vários, mostrar progresso e expandir etapas sob demanda.                                                                     |
| Conectar              | Feed sem regras no topo; coração/comentário com área de 48px; moderação recolhida | Rota de comentários, retorno à lista e erro com retry. Autoria visível por nome, sem exigir avatar em cada mensagem.                                                                                                                  |
| Meu ELEVA             | Identidade, Editar perfil e salvos nessa ordem                                    | Vazio dos salvos indisponíveis; conta e acesso admin ficam depois de toda a lista, potencialmente distantes se houver muitos salvos (`profile.tsx:75`). Dar acesso compacto a ações da conta, sem outro painel.                       |
| `/profile-edit`       | Quatro dados úteis, preview da foto e estados Preparando/Salvando                 | Proteção de edição, teclado e recorte de foto. A nota sobre onde os dados da prévia ficam é pertinente à privacidade, não precisa virar banner.                                                                                       |
| `/content/[id]`       | Leitura em parágrafos, título claro, capa contida e ação de material              | Campos omitidos e fidelidade da prévia. Favoritar apenas ao fim dificulta salvar sem ler tudo (`content/[id].tsx:95`); considerar ação compacta perto do título, mantendo conclusão ao fim.                                           |
| `/event/[id]`         | Data, horário, lugar e capacidade agrupados; inscrição explícita                  | Botão não expõe espera/disabled durante ação (`event/[id].tsx:78`). Cancelamento é direto: proteger ou oferecer recuperação, especialmente quando houver vagas limitadas.                                                             |
| `/admin` Conteúdos    | Listagem por separadores; editar direto; ações extras recolhidas                  | Cabeçalho mobile e critérios ativos identificados só como ativo (`admin.tsx:504`); resumo curto dos critérios ao recolher.                                                                                                            |
| `/admin` Calendário   | Lista cronológica e indicação dos dias sem devocional                             | Seleção manual de mês; chips de todos os dias pendentes em bloco (`admin.tsx:597`). Agrupar a pendência sem perder atalhos por dia.                                                                                                   |
| `/admin` Desafios     | Datas/status visíveis e edição separada                                           | Hierarquia compacta do mesmo cabeçalho; não transformar link externo em uma métrica interna.                                                                                                                                          |
| Editor de publicação  | Rascunho, prévia, confirmação de publicação e proteção ao descarte                | Ordem dos campos, data/hora, preview fiel, foco e teclado. Não adicionar novas etapas desnecessárias para uma edição simples.                                                                                                         |
| Editor de desafio     | Link opcional, limites e confirmação de arquivamento                              | Datas amigáveis e teclado. As proteções de descarte já existem.                                                                                                                                                                       |
| Página não encontrada | Mensagem curta com saída clara                                                    | Voltar ao início sempre leva à apresentação (`app/+not-found.tsx:9`); se houver sessão, levar ao Início da integrante.                                                                                                                |
| Shell e abas          | Cinco destinos com rótulos, troca sem slide e safe area superior                  | Três ícones de abas são variações de círculos (`app/(tabs)/_layout.tsx:31`); diferenciar com desenhos simples do mesmo conjunto, sem remover os rótulos. Fonte ampliada, tab bar de 72px e inset inferior exigem dispositivo (`:21`). |

## Acessibilidade, motion e superfície web

O texto compartilhado tem 17px, inputs também, e não foi encontrado bloqueio de ampliação por `allowFontScaling={false}`. Há contraste forte entre bordô e marfim e nenhuma necessidade de mudar a paleta. A borda real é `#E7DDD7` (`src/theme.ts:9`), diferente da documentada, e é próxima do marfim. Validar se inputs/foco continuam identificáveis sem depender de uma linha quase invisível; não declarar aprovação de contraste integral sem medir todos os estados.

Botões respondem ao pressionar, e motion está limitado a transform/opacity na maior parte dos componentes. MotionBlock tem deslocamento de 7px e redução de movimento (`MotionBlock.tsx:22`); ilustrações fazem um único ciclo curto e interrompem ao sair/background (`Illustration.tsx:31`, `:40`). Esses pontos estão alinhados à direção minimalista. Não recomendo aumentar a animação. Em listas grandes, cada ilustração e bloco entra ao focar a aba; limitar às áreas realmente visíveis se medição mostrar custo. Aprender, comunidade, salvos e admin usam map em ScrollView sem limite de tamanho: risco de escala futuro, não prova de lentidão na prévia.

O HTML exportado local em `dist/index.html` contém viewport com `width=device-width, initial-scale=1, shrink-to-fit=no`, sem proibir zoom. Não contém `viewport-fit=cover` nem theme-color nesse artefato. Isso não demonstra conteúdo sob notch no navegador atual, e não se deve adicionar insets duplicados sem testar a SafeAreaView existente. Definir chrome/status bar e bordas da janela em teste real antes do PWA/app instalado.

## Validação real necessária

- Safari iPhone e Chrome Android: primeira publicação visível nas telas principais, abertura e retorno dos comentários, teclado nos três formulários e seleção de imagens.
- Telefone estreito e paisagem: títulos longos, ações que quebram linha, cinco abas, imagem vertical e imagem horizontal. Ampliar texto e zoom sem perder controles.
- VoiceOver/TalkBack: navegação por rótulos, coração selecionado, filtros expandidos, erros anunciados e retorno de foco após modal. O código tem várias semânticas corretas, mas isso não equivale a validação com leitor.
- Estados: falha de carregar, salvar e abrir link; imagem que falha; lista sem conteúdo; filtro sem resultado; favorito de publicação removida; saída com edição pendente.
- Redução de movimento ligada: conteúdo aparece imediatamente e progresso continua compreensível. Nas listas grandes, medir rolagem antes de trocar componentes ou adicionar bibliotecas.

Não rodei build nem testes novos: esta revisão não mudou o produto e não substitui os testes já executados na publicação. Builds nativos, modo instalado, teclado físico e comportamento dos insets inferiores ficam explicitamente não validados.

## Revisão e ajustes de interface — 17/10/2026

Nesta rodada houve implementação, a pedido de Rafa, preservando a identidade e os fluxos existentes.

- Apresentação: retrato encostado no cabeçalho, máscara de transparência gradual no trecho inferior, card sobreposto em 56 px no celular, título “Bem-vinda ao ELEVA” e pilares em linha. O PNG original permanece intacto e o parallax conserva a preferência por movimento reduzido.
- Componentes compartilhados: títulos dos cards com escala mais contida, metadados de 14 px, títulos de seção flexíveis, ações limitadas à largura disponível e margens laterais de 20 px.
- Formulários de acesso, cadastro, recuperação, confirmação, plano e perfil: largura máxima de 560 px. Recuperação, confirmação e página inexistente têm espaçamento explícito entre os elementos. Login distingue ações principais de recuperação e reenvio.
- Leitura de conteúdo, encontro e conversa: coluna limitada a 728 px. Data do encontro na home pode ceder espaço à ilustração.
- Abas: rótulos personalizados permitem duas linhas sem reticências; a altura acompanha telas estreitas e escala de fonte.

### Evidência desta rodada

Revisão de código abrangeu todas as rotas em app/, componentes compartilhados, navegação e editores administrativos. Navegador Chromium em viewport simulada, sem aparelho físico:

| Área                                                                              | Verificação                                                                                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Apresentação                                                                      | Imagem e degradê em 390 px e desktop 1280 px; pilares com a mesma coordenada vertical em 320 px; sem overflow horizontal do documento |
| Login                                                                             | Screenshot em 320 px, ações de recuperação visíveis e hierarquia revista                                                              |
| Início, Aprender e Viver                                                          | Screenshots em 320 px, cards, títulos, encontro e navegação                                                                           |
| Conteúdo e encontro                                                               | Navegação real a partir dos cards; texto e ações presentes                                                                            |
| Conectar                                                                          | Estado vazio e formulário de publicação sem enviar dados                                                                              |
| Meu ELEVA e edição                                                                | Screenshot, campos e rótulo completo em duas linhas                                                                                   |
| Administração                                                                     | Screenshot da lista e editor de conteúdo em 320 px; abas de calendário/desafios e busca de integrantes                                |
| Cadastro, confirmação, recuperação, plano, convite, conversa e página inexistente | Revisão de código e componentes; não houve percurso visual completo de cada estado                                                    |

As telas restritas foram abertas em cópia temporária local, com o repositório de demonstração e sem conexão ao Supabase. Nenhum dado de produção foi alterado. A cópia de demonstração não faz parte do commit. Teclado virtual, VoiceOver/TalkBack, Safari em iPhone e Android físicos continuam fora desta validação.

### Ajuste de posição após os prints de Rafa

O card de boas-vindas passou a ficar a 64 px do topo do retrato no desktop, em vez de centralizado verticalmente. No celular, a sobreposição acompanha 22% da altura da foto, coincidindo com o início da máscara em 78%; substitui os 56 px fixos anteriores. Conferido no navegador em 1280 px e 390 px. Em 390 px, início do degradê e topo do card coincidem em 565,53 px, sem overflow horizontal. Typecheck e build web passaram.
