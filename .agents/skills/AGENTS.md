# Skills da ELEVA

Usar estas skills como referências de trabalho no Codex. Ler o SKILL.md correspondente antes de aplicar suas instruções. Os arquivos de origem permanecem intactos; o contexto da ELEVA e as instruções de Rafa prevalecem sobre exemplos genéricos e decisões estéticas de terceiros.

## Escrita obrigatória

Escrever textos de interface, documentação e mensagens em português brasileiro natural. Não usar travessões. Não usar slogans genéricos de IA, promessas vazias, elogios automáticos nem estruturas como "não é apenas X, é Y". Descrever ações e resultados concretos. Preservar fatos, autoria e intenção. Não inventar depoimentos, profissionais, números ou compromissos. Identificar conteúdos de demonstração.

## Escolha de referências

- Para escrita: humanizar como primeira referência; humanizador-pt para a revisão final.
- Para composição visual: frontend-design e as referências de impeccable. Respeitar a identidade bordô, rosa e marfim definida para a ELEVA, mesmo quando exemplos externos sugerirem outra direção.
- Para motion em Expo: expo-animation como referência principal. animate-expo é alternativa e não deve duplicar o trabalho.
- Para páginas exclusivamente web: animate para decidir se a animação ajuda; framer-motion somente quando o código usa React DOM e a biblioteca é necessária.
- Não aplicar Motion para React DOM a componentes React Native compartilhados.
- Implementar redução de movimento no mesmo componente que recebe animação. Não animar texto de leitura, trocas frequentes de abas nem cada cartão da página.

## Execução e recursos externos

Os pacotes foram copiados com referências, receitas, scripts e licenças disponíveis nos commits registrados em manifest.json. Nenhum script de terceiro foi executado durante a instalação. Antes de executar um script, ler seu código e seus efeitos. Não ativar hooks, serviços pagos, downloads de binários nem envio de textos a avaliadores externos como parte automática da instalação.

O launcher do Impeccable pode baixar um binário externo. Para esta primeira implementação, usar a alternativa manual documentada em sua skill: ler PRODUCT.md, DESIGN.md ou a documentação equivalente do projeto, depois as referências específicas de design. Adaptar CLAUDE_SKILL_DIR ao diretório local da skill somente se a execução do launcher tiver sido revisada.

Humanizar menciona human-ai para textos em inglês; essa skill irmã está fora do escopo PT-BR e não foi instalada. Os avaliadores externos citados são opcionais. Uma skill instalada não significa que esses serviços ou binários estejam configurados.

Ver ../../docs/skills.md para origem, uso e validação da instalação.
