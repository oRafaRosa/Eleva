# Design ELEVA

Referência: ELEVA_Manual_Design_Motion.pdf, versão 1.0 de 13/10/2026, com briefing funcional e apresentação institucional fornecidos por Rafa.

## Identidade

Bordô #4B0B22, marfim #FBF7F3, rosa #EAD4D9, texto #30252A, secundário #74636B, borda #D6C6CC. Texto branco no bordô. Bordas essenciais dos controles devem ter contraste suficiente. Cormorant Garamond SemiBold para títulos editoriais, Source Sans 3 para interface e leitura. Preserve o logotipo quando arquivo definitivo estiver disponível.

Na implementação, separadores decorativos usam #E7DDD7; limites de campos usam #9B8790 e foco bordô. Não usar a borda suave como único sinal de um campo interativo.

Layout mobile primeiro, conteúdo alinhado à esquerda. Margem 20, escala de espaçamento 4/8/12/16/24/32/48, alvos 48x48. Leitura até 680px; listagens até 1120px; admin adaptável. Tipografia: títulos 32/38, seções 22/28, leitura 18/29, interface 16/24, metadados 14/20. Ampliação de texto não deve recortar informações.

## Composição

Cinco abas Início, Aprender, Viver, Conectar, Meu ELEVA. Início destaca devocional e oferece aula, desafio, encontro e novidades. Diferenciar leitura, prática e participação. Evitar grade de cartões idênticos, gradientes roxos/azuis, glassmorphism, ícones decorativos repetidos e cápsulas em todo controle. Imagens reais somente com origem e permissão adequadas; não inventar fotos ou depoimentos das fundadoras.

Telas internas priorizam conteúdo no primeiro viewport. Cabeçalho compacto, sem slogan ou introdução repetida. Busca e filtros de Aprender e do admin ficam recolhidos até a pessoa abrir; critérios ativos e Limpar continuam visíveis. Regras da comunidade ficam acessíveis ao final, opções de moderação recolhidas. Publicações da comunidade usam coração e comentários. Meu ELEVA concentra identidade, editar perfil e conteúdos salvos.

Capas nas listagens usam miniatura de 84x84 ao lado do título, resumo até duas linhas. O destaque permite imagem de 128px de altura; a leitura aberta reserva até 240px, sem recortar a imagem. Campos de upload e imagens não substituem título, ação ou texto legível. Desafios externos oferecem Abrir no GymRats; o app não inventa progresso nem inscrição nesse serviço.

Reservar espaço de capas enquanto carregam e manter a área estável em falhas. Admin e leitura compartilham a estrutura do corpo da publicação. Comentários têm rota própria, com retorno à comunidade. Períodos de desafios são visíveis; atividades abrem sob demanda. Abas usam desenhos distintos e rótulos, com espaço para o inset inferior.

## Logotipo

A assinatura visual oficial está em `assets/brand`, com versões bordô, rosa, marfim e branca, em PNG transparente e SVG com imagem incorporada. A base vem da capa institucional, preservando o desenho das letras. Usar `BrandLogo` nos cabeçalhos e assinaturas, sem distorcer a proporção. Bordô nos fundos claros; marfim, branco ou rosa no bordô. Rótulos de navegação e frases que mencionam ELEVA continuam como texto. As versões de cor seguem as variáveis conferidas no Figma em 15/10/2026.

## Escrita

Português BR natural, direto e acolhedor. Sem travessões, slogans genéricos, promessas de cura, cobrança por ausência ou superlativos sem prova. Botões explicam a ação: Ler devocional, Salvar, Confirmar presença, Agendar publicação. Confirmações dependem da resposta real do serviço.

## Motion

Feedback de toque 100-150ms, estado 180ms, overlay 220ms, painel cerca de 300ms. Entrada no máximo 8px; escala pressionada 0,98. Respeitar preferência de redução de movimento. Abas sem slides; listas, texto, dados financeiros e calendário estáveis. Gestos interrompíveis e retorno visual independente de haptics. Reanimated para compartilhados nativos/web compatíveis. Motion para DOM quando necessário. Não animar operação de negócio nem exibir falso progresso.

## Revisão

Contraste, foco, rótulos, estados vazios/erros/carregamento, safe areas e teclado. Testar Safari iPhone, Chrome Android e builds nativos posteriormente. Browser QA não disponível nesta execução: não afirmar que houve validação em dispositivos.
