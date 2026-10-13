# Design ELEVA

Referência: ELEVA_Manual_Design_Motion.pdf, versão 1.0 de 13/10/2026, com briefing funcional e apresentação institucional fornecidos por Rafa.

## Identidade

Bordô #4B0B22, marfim #FBF7F3, rosa #EAD4D9, texto #30252A, secundário #74636B, borda #D6C6CC. Texto branco no bordô. Bordas essenciais dos controles devem ter contraste suficiente. Cormorant Garamond SemiBold para títulos editoriais, Source Sans 3 para interface e leitura. Preserve o logotipo quando arquivo definitivo estiver disponível.

Layout mobile primeiro, conteúdo alinhado à esquerda. Margem 20, escala de espaçamento 4/8/12/16/24/32/48, alvos 48x48. Leitura até 680px; listagens até 1120px; admin adaptável. Tipografia: títulos 32/38, seções 22/28, leitura 18/29, interface 16/24, metadados 14/20. Ampliação de texto não deve recortar informações.

## Composição

Cinco abas Início, Aprender, Viver, Conectar, Meu ELEVA. Início destaca devocional e oferece aula, desafio, encontro e novidades. Diferenciar leitura, prática e participação. Evitar grade de cartões idênticos, gradientes roxos/azuis, glassmorphism, ícones decorativos repetidos e cápsulas em todo controle. Imagens reais somente com origem e permissão adequadas; não inventar fotos ou depoimentos das fundadoras.

## Escrita

Português BR natural, direto e acolhedor. Sem travessões, slogans genéricos, promessas de cura, cobrança por ausência ou superlativos sem prova. Botões explicam a ação: Ler devocional, Salvar, Confirmar presença, Agendar publicação. Confirmações dependem da resposta real do serviço.

## Motion

Feedback de toque 100-150ms, estado 180ms, overlay 220ms, painel cerca de 300ms. Entrada no máximo 8px; escala pressionada 0,98. Respeitar preferência de redução de movimento. Abas sem slides; listas, texto, dados financeiros e calendário estáveis. Gestos interrompíveis e retorno visual independente de haptics. Reanimated para compartilhados nativos/web compatíveis. Motion para DOM quando necessário. Não animar operação de negócio nem exibir falso progresso.

## Revisão

Contraste, foco, rótulos, estados vazios/erros/carregamento, safe areas e teclado. Testar Safari iPhone, Chrome Android e builds nativos posteriormente. Browser QA não disponível nesta execução: não afirmar que houve validação em dispositivos.
