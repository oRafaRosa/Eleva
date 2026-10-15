# Convite de lançamento

Página pública em `/convite/`, sem login. Há um acesso na apresentação do app. A exportação cria um HTML próprio com título e descrição para compartilhamento no GitHub Pages, sem depender do fallback 404.

## Direção

Base: artes enviadas por Rafa em 15/10/2026. Envelope rosa, lacre bordô com E, carta marfim e logotipo oficial. As capturas ficam em `assets/invitation`; os enquadramentos SVG usam apenas trechos da arte, sem os controles do Instagram. O papel e a aba articulada são camadas de código, não um vídeo nem uma troca entre duas fotos.

O texto da carta segue a arte. A única data informada é 24 de outubro. Não foram inventados horário, endereço, preço, inscrição ou confirmação. “Quero saber mais” abre o perfil `elevatheclub` no Instagram.

## Motion

As skills instaladas `animate` e `framer-motion` orientam esta superfície de apresentação, de uso ocasional. O propósito é mostrar fisicamente a abertura do convite. Motion fica restrito ao componente `.web.tsx`; o aplicativo nativo mantém uma alternativa de leitura em React Native.

Rolagem nativa alimenta MotionValues, sem renderização de React a cada quadro. Mola de 0,5s com bounce 0,2 suaviza a continuidade; os valores físicos ficam limitados ao intervalo 0–1. Transformações completas e opacidade comandam as camadas.

| Progresso | Etapa                                                       |
| --------- | ----------------------------------------------------------- |
| 2–18%     | Lacre se solta e desaparece                                 |
| 14–42%    | Aba gira sobre a própria dobra e passa para trás            |
| 38–90%    | Carta sai pela abertura; enquadramento acompanha a extração |
| 82–100%   | Envelope deixa o enquadramento e surge a ação final         |

A carta termina centralizada e 12px acima da borda do envelope. O cálculo usa a altura real do papel e do envelope, medida por ResizeObserver. Voltar na rolagem percorre o mesmo caminho, sem reiniciar a sequência.

## Acesso e limites

“Ler convite” pula a cena e exibe o conteúdo em fluxo normal. `prefers-reduced-motion` usa essa versão automaticamente. O botão de abertura também funciona pelo teclado, e o contato externo só fica acessível ao terminar a abertura. Não há áudio automático, captura de gesto, bloqueio do zoom ou manipulação global da rolagem do app.

O efeito 3D desta entrega é exclusivo do navegador. O componente nativo apresenta a carta legível, com acesso ao Instagram. Não foi feita uma promessa de paridade de motion em builds Android/iOS.

## Verificação

`tests/invitation-motion.test.ts` cobre ordem das etapas, fechamento reversível, limites da mola e centralização em medidas distintas. Typecheck e build web verificam a separação de plataforma. `scripts/verify-invitation.mjs` oferece revisão opcional do build estático com Playwright e requer navegador instalado. A opção `--serve` permite revisar o mesmo build em outro navegador.

Ainda é necessária uma conferência de gesto no Safari de iPhone e no Chrome de Android reais. Testes matemáticos não comprovam fluidez ou qualidade visual no aparelho.
