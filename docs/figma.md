# ELEVA no Figma

[Abrir o arquivo de design](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c)

## Entrega inicial

Quatro telas móveis editáveis com largura de 390 unidades:

| Tela                  | Link                                                                      | Conteúdo                                                    |
| --------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Início                | [Abrir](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c?node-id=2-39) | Devocional, treino da semana e encontro                     |
| Devocional            | [Abrir](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c?node-id=2-40) | Reflexão, aplicação, oração e ações                         |
| Aprender              | [Abrir](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c?node-id=2-41) | Busca, pilares, destaque e biblioteca                       |
| Editor administrativo | [Abrir](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c?node-id=2-42) | Formulário de devocional e agendamento                      |
| Fundamentos           | [Abrir](https://www.figma.com/design/MCzuXlmEabOjmapLqIRq3c?node-id=4-4)  | Paleta, tipografia, estados de botão e orientação de motion |

As telas usam texto editável, frames com auto-layout e instâncias do botão local. Não são capturas de tela do aplicativo. São propostas de referência para revisão, com conteúdo fictício e datas de exemplo. O nome ELEVA digitado no cabeçalho não substitui o logotipo oficial.

## Fundamentos

29 variáveis locais na coleção ELEVA: cores primitivas e semânticas com aliases, espaçamento, raio e durações de motion. Escopos explícitos e sintaxe WEB configurados. Uma modalidade clara; não há proposta de tema escuro nesta versão.

| Papel     | Fonte                       | Tamanho / entrelinha |
| --------- | --------------------------- | -------------------- |
| Editorial | Cormorant Garamond SemiBold | 32 / 38              |
| Seção     | Source Sans 3 SemiBold      | 22 / 28              |
| Leitura   | Source Sans 3 Regular       | 18 / 29              |
| Interface | Source Sans 3 Regular       | 16 / 24              |
| Ação      | Source Sans 3 SemiBold      | 16 / 24              |
| Metadados | Source Sans 3 Regular       | 14 / 20              |

Seis estilos de texto compartilhados. Botão ELEVA/Button com estados padrão, pressionado, foco, carregando e desabilitado; propriedade Texto nos estados comuns. A variante carregando mantém seu texto próprio. Instâncias de revisão ficam separadas do conjunto principal. Botões têm altura 48; destinos inferiores ocupam áreas de 70 × 48.

## Motion na implementação

Estas regras estão anotadas no quadro de fundamentos. Não há animações de timeline ou protótipo interativo implementadas no Figma nesta entrega.

- Pressão: 120 ms, escala 0,98 quando apropriado.
- Favorito e conclusão: 180 ms, após confirmação da operação.
- Diálogo: 220 ms, movimento curto de até 8 unidades.
- Painel inferior: referência de 300 ms, sujeito aos padrões da plataforma.
- Leitura e troca de abas ficam estáveis.
- Redução de movimento remove deslocamento e escala, mantendo indicação de estado.

## Verificação

Fontes conferidas na lista disponível do Figma. Inspeção do arquivo confirmou que não havia telas ou componentes existentes; a busca nas bibliotecas não encontrou componentes compatíveis para botão ou campo. Os fundamentos foram criados a partir do manual ELEVA.

Capturas do Figma foram inspecionadas para as quatro telas e o quadro de fundamentos. Foram corrigidos o posicionamento dos componentes principais, os alvos de toque da navegação, o contraste do botão desabilitado e o texto da variante carregando. As telas não apresentam texto cortado ou sobreposição nos tamanhos desenhados.

Ainda não há fotos oficiais, biblioteca completa, estados de todas as telas, ligação Code Connect ou teste de usabilidade. Os testes funcionais e de acessibilidade do aplicativo pertencem à implementação.
