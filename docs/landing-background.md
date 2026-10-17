# Fundo da página pública

Em 17/10/2026, a página inicial passou a usar uma única camada de cartões atrás de todo o conteúdo, incluindo o rodapé. O arquivo `assets/brand/stationery-fullpage.jpg` tem formato vertical 9:16, otimizado em JPEG para a web. Foi criado com a ferramenta integrada de geração de imagens a partir de `assets/brand/stationery.jpg`. Não é uma reprodução de uma publicação do Instagram; o perfil não pôde ser consultado nesta execução.

O retrato `assets/brand/founders-original.png` foi preservado byte a byte, com seu canal de transparência original. Não houve geração ou alteração dos rostos. As imagens continuam independentes.

O fundo percorre no máximo 120 px ao longo de toda a rolagem, com área excedente para evitar bordas vazias. O retrato acompanha a página com deslocamento adicional de 5,5%, limitado a 42 px. Apenas transformações das duas imagens são animadas por Reanimated. Texto e botões seguem a rolagem normal. A preferência de redução de movimento desativa os dois deslocamentos e acompanha alterações durante a sessão.

## Prompt do fundo

Use case: product-mockup. Create a new high resolution vertical 9:16 photograph, ideally 1440x2560, for the entire mobile landing-page background of ELEVA the club. The provided photograph is a reference for the exact burgundy, blush pink and ivory stationery identity, textured paper, ELEVA typography and wax E seal. Expand the concept into a flat-lay photograph of MANY overlapping ELEVA invitation cards and envelopes (approximately 12-18) artfully scattered in different orientations across the WHOLE tall frame, right to all edges. Use the same real-looking paper stock and natural warm soft shadows as reference. Mix burgundy cards with pale pink ELEVA lettering and blush/ivory cards with burgundy ELEVA lettering, a few ribbons and E wax seals. Exact main printed word: ELEVA, preserving the reference's elegant distinctive typography; avoid extra small slogans and additional invented text. The cards should be medium-sized so several are visible in a mobile viewport, not one huge central card. Cohesive restrained premium stationery photo, not a UI mockup or grid. No people, faces, hands, phone frame, website, watermarks, borders, blank bands, or large flowers. The whole composition should feel like the original photographed stationery, simply a much larger pile of cards. Output a single portrait background image.

## Validação

Typecheck, 71 testes existentes e build Vercel passaram. A prévia compilada foi conferida no Chromium em 390 × 844, 320 × 568 e 1280 × 720. Em 300 px de rolagem a camada de fundo deslocou cerca de 14,73 px e o retrato teve 16,5 px adicionais à rolagem normal. Ao ativar redução de movimento na sessão, ambas as transformações voltaram a zero. O fundo cobriu as bordas no final da página, sem rolagem horizontal nas larguras móveis verificadas. Safari/iPhone e Android físicos ainda precisam de conferência de fluidez.
