# Marca ELEVA

Quatro versões transparentes, em PNG (1600 × 440) e SVG: bordô `#4B0B22`, rosa `#EAD4D9`, marfim `#FBF7F3` e branco `#FFFFFF`.

Paleta conferida em 15/10/2026 nas variáveis do quadro Fundamentos do [Figma](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c?node-id=4-4).

## Origem e fidelidade

A marca é a mesma da captura enviada. A base de maior resolução foi extraída da primeira página de `ELEVA_Apresentacao_Institucional.pdf`: imagem de 5999 × 3375, SHA-256 `d1be11f9f3086f708fc2524d5e672181cc4a7dff0761888d69c04fe5173f0e6f`.

As tentativas de remoção generativa não passaram na conferência e não foram incorporadas ao app. O SVG utiliza a imagem original intacta e uma matriz de cor para separar o fundo bordô da tinta rosa. As letras não foram redesenhadas, digitadas ou vetorizadas automaticamente. O enquadramento mantém a curva final do A e uma margem transparente curta.

Os SVGs contêm a imagem original incorporada. Não são arquivos de curvas vetoriais puras. Os PNGs são renderizações desses SVGs, com o mesmo canal de transparência em todas as cores.

## Aplicação

- Bordô em marfim, branco ou rosa claro.
- Marfim ou branco em bordô.
- Rosa em bordô, para uso secundário.
- Não esticar, adicionar efeitos, mudar espaçamento ou animar as letras separadamente.

`BrandLogo` usa um único PNG local, com proporção reservada e cor definida pelos tokens do app. Cabeçalhos e entrada administrativa usam a mesma marca. Referências textuais, como “Meu ELEVA” e “Entrar na ELEVA”, continuam como texto para preservar leitura e navegação.

Para reproduzir a exportação, extrair a primeira imagem da capa com `pdfimages -f 1 -l 1 -png` e executar `node scripts/prepare-brand.mjs caminho/da/imagem.png`. A ferramenta de exportação requer `sharp`, mas o app e o pipeline de publicação não dependem dela.
