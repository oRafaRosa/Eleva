# ELEVA: experiência da integrante e movimento nas cinco abas

Data: 17/10/2026

## Intenção e critérios de sucesso

A área logada deve ajudar a integrante a retomar conteúdos, encontrar o formato desejado e localizar encontros em que confirmou presença. A interface deve continuar editorial, acolhedora e compacta no celular. A troca de abas deve ganhar um carimbo que percorre a navegação inferior como uma gota e pousa sobre a aba selecionada. O movimento deve orientar a navegação sem atrasar a leitura, repetir-se bem em uso frequente e respeitar a preferência de redução de movimento.

O trabalho cobre Início, Aprender, Viver, Conectar, Meu ELEVA e a barra de abas. Não altera autenticação, permissões, banco, modo demo, inscrição no GymRats, publicação administrativa nem conteúdo editorial.

## Fonte dos dados e limites de significado

`AppProvider` já fornece publicações, favoritos, conclusões, eventos e inscrições para contas autorizadas. Todas as novas seleções derivam desses dados em memória, tanto no modo demo quanto no Supabase. Nenhuma ação será simulada. “Retomar” significa abrir um conteúdo salvo que ainda não foi marcado como concluído; o app não mede posição de leitura nem presume qual foi o último conteúdo aberto. “Sua agenda” significa encontros publicados presentes na lista de inscrições da conta; inscrições não são inferidas de cliques no cartão.

Itens removidos ou indisponíveis não aparecem nas listas derivadas. Falha de carregamento mantém o padrão atual de erro e tentativa de atualização, sem transformar erro em estado vazio. Conclusões e inscrições só mudam visualmente depois da confirmação do serviço existente.

## Comportamento por área

### Início

Depois do devocional do dia, mostrar uma seção pequena de retomada apenas quando houver publicações salvas e não concluídas. Exibir no máximo duas linhas compactas, com título, formato e ação de abrir; manter o devocional como foco principal. Ordenar de forma determinística pela ordem editorial já recebida, sem prometer recência de leitura. Se não houver itens elegíveis, omitir a seção. As seções existentes de semana e encontro continuam acessíveis.

### Aprender

Adicionar `Formato` aos filtros recolhidos. A escolha padrão é Todos; as opções exibidas correspondem aos formatos presentes nas publicações carregadas, com rótulos de `typeLabels`. Busca textual, pilar e formato se combinam por interseção. O resumo de critérios e a ação Limpar mostram o filtro ativo mesmo com o painel fechado. A lista sem resultados mantém mensagem de busca vazia, distinta do erro de carregamento. Os controles opcionais podem ocupar mais altura somente quando a integrante abre Filtros.

### Viver

Manter Desafios primeiro. Em seguida, quando houver encontros futuros confirmados, mostrar `Sua agenda` em linhas compactas, ordenadas por data. `Próximos encontros` mostra os demais encontros futuros, sem duplicar os confirmados; cada linha abre os detalhes existentes. A data é interpretada em `America/Sao_Paulo` como nas telas atuais. Encontros passados não ocupam a agenda principal. Estado vazio e erro preservam as mensagens e ações de recuperação existentes.

### Meu ELEVA

Preservar identidade, edição de perfil e Conta no topo. A área de conteúdos oferece alternância acessível entre `Salvos` e `Concluídos`, com contagem e listas compactas em vez de cartões grandes. A lista inicial é Salvos. Cada item abre a leitura; não cria nova ação de conclusão fora da página de conteúdo. Uma lista vazia informa como preenchê-la. Itens ausentes das publicações disponíveis não aparecem.

### Composição e controles

Criar uma apresentação compartilhada de linha de conteúdo para as listas secundárias, com área de toque mínima de 48 px, título que pode quebrar linha, metadado discreto e separador. Manter a capa apenas onde contribui para o destaque editorial; evitar repetir imagem, painel, margem e padding em cada item. Afinar o espaçamento vertical das novas seções sem diminuir alvos de toque. Usar `controlLine` para limites de controles e foco claramente visível; divisórias decorativas podem permanecer suaves. Não reduzir a escala de texto para caber em 320 px nem esconder rótulos das cinco abas.

## Navegação e linguagem de movimento

A personalidade é calma e editorial. Usar a curva de entrada existente como assinatura, feedback rápido de 120–160 ms e entradas de 220–300 ms. Títulos e primeiro bloco de Viver, Conectar e Meu ELEVA entram uma vez ao foco, com opacidade e deslocamento vertical de até 7 px. Listas inteiras, textos de leitura, calendário e dados não entram em cascata. Início e Aprender conservam seu movimento pontual, harmonizado com esses tempos.

O carimbo será uma única imagem decorativa sobre a barra, posicionada atrás dos ícones e rótulos. O componente da barra recebe o índice ativo do Expo Router, mede a largura útil e calcula o centro de cada uma das cinco abas. Na primeira montagem, posiciona o carimbo sem travessia. Ao trocar de aba, anima `translateX` entre os centros; um alongamento horizontal discreto durante o trajeto e a volta à forma circular criam a sensação de gota. A animação é interrompível: um novo toque começa da posição visual atual e segue para a nova aba. A duração considera a distância, com limite para não arrastar a navegação; a aba e seu conteúdo respondem imediatamente ao toque. O carimbo usa `pointerEvents="none"`, não transmite estado por si só e nunca cobre texto ou área clicável. O estado selecionado continua identificado por cor, ícone e semântica acessível.

No movimento reduzido, a posição muda imediatamente, sem deformação, deslocamento animado ou entrada espacial de conteúdo. Não há loop automático, salto, flash, som ou vibração. A animação usa apenas transformações e opacidade via Reanimated já instalado; a skill `motion-design` orienta tempo, curva, densidade e revisão, sem exigir runtime Lottie.

## Estrutura técnica

As seleções de conteúdo e agenda ficam em funções puras pequenas, usadas pelas rotas e testadas com dados de exemplo. Um componente de linha compacta em `src/components/` evita duplicar estilo e semântica. Um componente próprio para o carimbo e a barra fica separado das telas e recebe o estado da navegação; deve preservar o comportamento do `BottomTabBar`, inclusive labels, safe area, teclado, links e acessibilidade. `MotionBlock` continua sendo a primitiva de entrada e pode ganhar apenas os parâmetros necessários para consistência. As rotas mantêm o estado local de filtros e alternância. Não se adiciona dependência de produto.

## Verificação e aceitação

- Funções puras cobrem salvos não concluídos, itens concluídos disponíveis, interseção de filtros e eventos futuros confirmados sem duplicação.
- TypeScript, lint, testes existentes e build web passam; alterações não devem introduzir falhas em SQL ou autenticação.
- Em 320 px, 390 px e largura desktop, título, filtros e cinco rótulos ficam legíveis e os alvos de toque mantêm pelo menos 48 px.
- Trocas rápidas entre abas não deixam o carimbo parado na aba errada; redimensionamento e carregamento inicial também o posicionam corretamente.
- Com redução de movimento, todo conteúdo e o carimbo aparecem imediatamente na posição final.
- A revisão visual em navegador verifica densidade e contraste. Safari/iPhone e Android nativo exigem validação posterior em aparelho; build web ou simulador não serão apresentados como prova desses dispositivos.
