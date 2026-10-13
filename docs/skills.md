# Skills instaladas

As oito skills pesquisadas no manual estão em `.agents/skills/`, disponíveis no próprio repositório. A instalação é local ao projeto, com versões fixadas nos commits consultados em 13/10/2026. Não altera as skills pessoais do usuário.

## Uso no Codex

Ler `.agents/skills/AGENTS.md` e o `SKILL.md` da referência relevante antes de trabalhar. Usar caminhos relativos ao repositório. O Codex pode ler as mesmas instruções usadas no Claude; menus, slash commands, hooks e variáveis exclusivas do Claude precisam de adaptação e não foram ativados.

Em toda implementação e revisão, exigir português brasileiro natural, sem travessões e sem slogans genéricos de IA. Escrever botões com ações, mensagens com próximos passos e textos editoriais com fatos e intenção preservados. O conteúdo de demonstração deve estar identificado.

| Skill           | Aplicação                                     | Origem                          | Commit                                   |
| --------------- | --------------------------------------------- | ------------------------------- | ---------------------------------------- |
| humanizar       | Escrita e revisão em PT-BR                    | fabricioctelles/skills          | 242512d983b347098eb44692ba74ddd43d7ce4cc |
| humanizador-pt  | Revisão complementar de linguagem             | opaulomarcondes/humanizador-pt  | 26b89dfc5c28d62a3159efe61bae06b50fdeccd7 |
| frontend-design | Composição e identidade da interface          | anthropics/skills               | 41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f |
| impeccable      | Hierarquia, acessibilidade e qualidade visual | pbakaus/impeccable              | d631a8827f99414d2b6daba4ef08b7f8701751d7 |
| expo-animation  | Motion em React Native e Expo                 | expo/skills                     | 13ad8e05874195633b5c185f6947bb6400e228fc |
| animate-expo    | Referência alternativa para motion nativo     | emilkowalski/skills             | 85e8e2363b713506e1d5b6e07a0eb2da66be1bc3 |
| animate         | Critério e implementação de motion web        | emilkowalski/skills             | 85e8e2363b713506e1d5b6e07a0eb2da66be1bc3 |
| framer-motion   | Motion em componentes React DOM               | Schoepplake/framer-motion-skill | 1d984d5db13b3fe30edef3f3a5d88dba588a10b7 |

## Arquivos e atribuição

Os diretórios contêm os arquivos das respectivas skills, incluindo referências, receitas e scripts distribuídos na origem. Os arquivos de licença disponíveis foram preservados. O README da skill framer-motion declara MIT, mas o commit não inclui um arquivo LICENSE; essa diferença está registrada em `UPSTREAM-LICENSE.md`, sem inventar termos ou titularidade.

`.agents/skills/manifest.json` registra origem, caminho original, commit e SHA-256 de cada arquivo instalado. Os documentos locais de uso ficam separados dos arquivos originais.

## O que a instalação não executa

Nenhum script de terceiro foi executado e nenhum hook foi ativado. O launcher Impeccable pode baixar um binário quando invocado; a primeira implementação usa leitura manual do contexto e das referências. Os scripts precisam de revisão antes da execução. A integração opcional de Humanizar com avaliadores externos não foi configurada; nenhum texto do projeto foi enviado a esses serviços.

A skill inglesa human-ai, mencionada por Humanizar, não faz parte das oito referências escolhidas e não foi instalada. Para a ELEVA, o fluxo trabalha em PT-BR.

## Validação

A instalação foi conferida contra os arquivos dos commits fixados: oito SKILL.md, metadados name/description, receitas e referências internas presentes, hashes reproduzíveis e licenças disponíveis preservadas. Scripts foram apenas armazenados. A validação não atesta desempenho no Safari, Android ou iOS; isso depende dos testes da aplicação.

## Roteiro de aplicação

1. Ler o briefing e a documentação de design da ELEVA.
2. Usar humanizar para redigir os textos e humanizador-pt para revisar os trechos finais.
3. Definir a composição com frontend-design. Consultar as referências pertinentes de impeccable sem transformar cada sugestão em requisito.
4. Usar expo-animation para feedback de toque, modais e estados. Evitar movimentos em leitura e navegação frequente.
5. Reservar animate e framer-motion para código exclusivo de navegador.
6. Verificar contraste, foco, teclado, toque e preferência por redução de movimento junto com cada mudança.
