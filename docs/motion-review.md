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
