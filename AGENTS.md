# ELEVA

Leia DESIGN.md, PRODUCT.md e docs/skills.md antes de implementar. As skills locais ficam em .agents/skills; consulte .agents/skills/AGENTS.md.

## Escrita

Escrever em português brasileiro natural e direto. Nunca usar travessões. Evitar slogans genéricos, elogios automáticos, superlativos sem prova e textos artificiais. Preservar fatos, ressalvas necessárias e autoria. Não inventar depoimentos, números ou resultados.

## Desenvolvimento

React Native e Expo, priorizando Safari e Chrome móveis. Componentes compartilhados usam APIs compatíveis com nativo. Seguir tokens e motion do manual. Demo é explícita e isolada; nunca simular autorização no backend configurado. RLS protege dados e permissões. Nenhuma chave secreta no cliente ou git.

## Agentes

Cliente: telas e interação. Admin: editor e calendário editorial. Backend: dados, autorização e agendamento. Design: identidade e Figma. Qualidade: validar fluxos, acessibilidade e texto. Operações: build e publicação. Todos seguem as regras de escrita acima. Testar alterações substanciais com typecheck, build web e testes de comportamento pertinentes.
