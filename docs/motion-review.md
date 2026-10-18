# Revisão de motion e design

Referências aplicadas: expo-animation, animate e Impeccable/reference/animate, instaladas no projeto. A revisão foi feita pelo código e pelas interações previstas. Não houve inspeção visual automatizada de navegador ou teste nativo.

## Diagnóstico

A entrada anterior usava troca de estado com transições CSS logo após montar. Dependendo do momento do primeiro paint, a passagem podia ficar imperceptível. A revisão usa shared values com withTiming explícito. Não foi comprovado um defeito em um navegador específico.

## Ajustes

- Ilustrações: um ciclo breve de deslocamento de 4px e rotação de 2 graus ao entrar na tela. Sem repetição contínua, cancelado ao sair da tela ou enviar o app ao fundo.
- Entradas: até 7px, 280ms; ilustrações até 420ms. Opacidade inicial mantém o conteúdo visível.
- Biblioteca: troca de pilar suaviza o grupo de resultados; digitação não dispara uma animação a cada letra.
- Filtros: cor e borda mudam em 160ms, com área mínima de toque de 48px.
- Desafios: contador estável, barra de 4px e checks em 180ms. Estado visual depende da confirmação do serviço.
- Apresentação: flor junto à marca como ponto de atenção discreto.

Redução de movimento remove deslocamento, escala e rotação. Textos, datas, valores e troca de abas permanecem estáveis. Reanimated atende a interface Expo compartilhada; não foi adicionada uma biblioteca DOM.

## Verificação

Typecheck, 24 testes de comportamento e build Pages passam. A qualidade perceptiva das animações ainda precisa de revisão no Safari/Chrome e em dispositivos reais. Não há texto técnico de revisão nas telas para a equipe ELEVA.

## Navegação e área da integrante — 17/10/2026

O carimbo da barra inferior passou a ser um único elemento decorativo. Ele percorre os centros das cinco abas em 180–320 ms, alonga discretamente durante o trajeto e volta à forma original ao chegar. Uma nova seleção redireciona o movimento; mudança de largura e primeira montagem posicionam o carimbo diretamente. Redução de movimento elimina a travessia. A troca do conteúdo das abas continua sem slide.

Viver, Conectar e Meu ELEVA recebem entrada curta no título e em um primeiro bloco, com até 7 px de deslocamento. Listas completas e texto de leitura não são animados. A revisão seguiu a skill `motion-design` instalada e a referência local `expo-animation`, adaptando a recomendação genérica de não animar abas ao pedido explícito de Rafa por um carimbo móvel.

TypeScript, lint, testes focados e exportação web passaram nesta rodada. A tentativa de abrir a prévia local no navegador do ambiente foi bloqueada por uma verificação administrativa de segurança; por isso, a aparência e a sensação do movimento ainda exigem inspeção no navegador e em aparelhos reais. O build não comprova desempenho ou posição visual final do carimbo em Safari, Android e iOS.
