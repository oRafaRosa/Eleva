# Experiência da integrante e movimento das abas: Implementation Plan

> **Para execução por agentes:** usar `superpowers:subagent-driven-development` ou `superpowers:executing-plans`, tarefa por tarefa. As etapas usam caixas de seleção (`- [ ]`).

**Goal:** Facilitar o uso das cinco áreas da integrante no celular e mover um único carimbo entre as abas inferiores.

**Architecture:** As novas visões derivam dos dados já expostos pelo `AppProvider`. Regras de seleção ficam em funções puras; linhas compactas, em um componente compartilhado; o movimento da navegação, em um componente separado que preserva o `BottomTabBar`.

**Tech Stack:** Expo Router 57, React Native 0.86, Reanimated 4.5, TypeScript e testes Node com `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-17-member-experience-motion-design.md`

## Global Constraints

- Sem migração de banco, nova dependência do produto, mudança de autorização ou ação de negócio simulada.
- Textos em português brasileiro; preservar bordô, rosa, marfim, tipografia editorial e os cinco rótulos visíveis.
- Prioridade para 320 px; alvos de toque de pelo menos 48 px; sem novos cartões altos ou padding repetido.
- Movimento só com transformações e opacidade; conteúdo se move até 7 px e fica estático com redução de movimento.
- Preservar mudanças locais existentes. Em arquivos já modificados, adicionar ao commit somente os trechos desta tarefa. Não publicar.

## Review Focus

- IDs antigos de favoritos ou conclusões: omitir publicações indisponíveis em vez de criar links quebrados (teste da tarefa 1).
- Busca com acentos, pilar e formato: retornar apenas a interseção dos critérios (teste da tarefa 2).
- Encontro confirmado no instante atual ou despublicado: não duplicar nem exibir nas listas futuras (teste da tarefa 3).
- Primeira montagem e largura inicialmente zero: posicionar o carimbo na aba ativa sem travessia ou coordenada inválida (teste da tarefa 5).
- Toques rápidos e movimento reduzido: terminar na última aba escolhida; posicionar imediatamente se a redução estiver ativa (verificação da tarefa 5).

---

### Tarefa 1: Conteúdos compactos em Início e Meu ELEVA

**Arquivos:** Criar `src/utils/memberExperience.ts`, `src/components/CompactPublicationRow.tsx`, `tests/member-experience.test.ts`; alterar `app/(tabs)/home.tsx` e `app/(tabs)/profile.tsx`.

**Interfaces:** `continuablePublications(publications: Publication[], favorites: string[], completions: string[], limit?: number): Publication[]`; `availableCompletions(publications: Publication[], completions: string[]): Publication[]`; `<CompactPublicationRow item={publication} />` abre `/content/[id]`.

- [ ] Escrever testes para salvo incompleto, salvo concluído, ID indisponível e limite de dois itens. Executar `node --import tsx --test tests/member-experience.test.ts` e confirmar falha pela ausência das funções.
- [ ] Implementar os seletores sem persistência nova; repetir o teste focado e confirmar aprovação.
- [ ] Criar linha com toque mínimo de 48 px, título, formato e separador, sem capa repetida; usar até duas linhas de retomada em Início e nas listas de Salvos/Concluídos em Meu ELEVA.
- [ ] Manter identidade e Conta acima das listas; incluir controle acessível de duas opções e mensagens vazias. Executar `npm run typecheck` e `npm run lint`.
- [ ] Registrar apenas os trechos desta tarefa com a mensagem `feat: surface member content progress`.

### Tarefa 2: Filtro por formato em Aprender

**Arquivos:** Alterar `src/utils/memberExperience.ts`, `app/(tabs)/learn.tsx`, `tests/member-experience.test.ts` e `src/components/ui.tsx` somente para bordas dos controles interativos.

**Interfaces:** `filterPublications(publications: Publication[], query: string, pillar: Pillar | "all", format: PublicationType | "all"): Publication[]`; opções derivadas dos formatos presentes nas publicações carregadas.

- [ ] Escrever teste de interseção entre texto, pilar e formato, busca sem diferença de acentos e resultado vazio; executar o teste focado e confirmar falha.
- [ ] Implementar o seletor; repetir o teste focado e confirmar aprovação.
- [ ] Adicionar escolha compacta de `Formato` dentro dos filtros fechados por padrão, mostrar o nome ativo no resumo e fazer Limpar redefinir os três critérios. Distinguir ausência de resultados de falha de carregamento.
- [ ] Reforçar bordas de chip/controle com `colors.controlLine`, mantendo bordô no estado ativo. Executar `npm run typecheck` e `npm run lint`.
- [ ] Registrar apenas os trechos desta tarefa com a mensagem `feat: filter learning content by format`.

### Tarefa 3: Agenda confirmada em Viver

**Arquivos:** Alterar `src/utils/memberExperience.ts`, `app/(tabs)/live.tsx`, `tests/member-experience.test.ts`.

**Interfaces:** `splitUpcomingEvents(events: ElevaEvent[], registrations: string[], now: Date): { registered: ElevaEvent[]; others: ElevaEvent[] }`; comparar instantes absolutos e formatar datas visíveis em `America/Sao_Paulo`.

- [ ] Escrever teste para confirmados ordenados, não confirmados, eventos passados/atuais, despublicados e IDs antigos; executar o teste focado e confirmar falha.
- [ ] Implementar a separação; repetir o teste focado e confirmar aprovação.
- [ ] Mostrar `Sua agenda` somente quando houver confirmados futuros, em linhas compactas; listar os demais em `Próximos encontros`, sem duplicação. Manter Desafios primeiro e reduzir apenas o padding excessivo desse painel.
- [ ] Executar `npm run typecheck` e `npm run lint`; conferir textos vazios e de erro contra a especificação.
- [ ] Registrar apenas os trechos desta tarefa com a mensagem `feat: show confirmed member agenda`.

### Tarefa 4: Entradas discretas de página

**Arquivos:** Alterar `src/components/MotionBlock.tsx`, `src/components/ui.tsx`, `app/(tabs)/live.tsx`, `app/(tabs)/connect.tsx`, `app/(tabs)/profile.tsx`.

**Interfaces:** Adicionar `animateHeading?: boolean` a `Page`; preservar os padrões existentes de `MotionBlock` e `useReducedMotion`.

- [ ] Criar entrada opcional do título em `Page`, até 7 px e 220–300 ms com desaceleração; não envolver listas completas nem texto de leitura.
- [ ] Animar apenas o primeiro bloco de Viver, Conectar e Meu ELEVA, sem animações aninhadas duplicadas.
- [ ] Executar `npm run typecheck`, `npm run lint` e `npm run build:web`; inspecionar as três páginas com redução de movimento ligada e desligada.
- [ ] Registrar apenas os trechos desta tarefa com a mensagem `feat: add restrained member page entrances`.

### Tarefa 5: Carimbo móvel na navegação inferior

**Arquivos:** Criar `src/components/MovingTabBar.tsx`, `src/utils/tabSeal.ts`, `tests/tab-seal.test.ts`; alterar `app/(tabs)/_layout.tsx` e `src/components/TabIcon.tsx`.

**Interfaces:** `sealCenter(width: number, index: number, count: number): number`; `sealDuration(distance: number, reduced: boolean): number`. `MovingTabBar` recebe `BottomTabBarProps` de `expo-router/tabs` e renderiza o `BottomTabBar` existente com carimbo decorativo sem interação.

- [ ] Escrever testes que falham para cinco centros iguais, largura zero, índices fora do intervalo, duração limitada pela distância e duração zero com redução de movimento; executar `node --import tsx --test tests/tab-seal.test.ts`.
- [ ] Implementar as funções geométricas; repetir os testes focados e confirmar aprovação.
- [ ] Renderizar um só `assets/brand/seal.png` atrás dos ícones, medir a largura, iniciar na aba selecionada e animar deslocamento horizontal com alongamento temporário discreto via Reanimated. Redirecionar movimento em nova seleção; remover os carimbos estáticos por ícone.
- [ ] Preservar rótulos, links, safe area, foco e toque do `BottomTabBar`. Executar `npm run typecheck`, `npm run lint` e `npm run build:web`.
- [ ] Conferir 320 px, 390 px, desktop, navegação direta, redimensionamento, toques rápidos e redução de movimento no navegador; registrar verificações que exigem aparelho.
- [ ] Registrar apenas os trechos desta tarefa com a mensagem `feat: move seal across member tabs`.

### Tarefa 6: Verificação integrada e documentação

**Arquivos:** Atualizar `docs/motion-review.md` e `docs/mobile-ux-corrections.md` com mudanças observadas e limites.

**Interfaces:** Sem alteração de API de produto.

- [ ] Executar `npm run check` e `git diff --check`; corrigir apenas regressões introduzidas por estas tarefas.
- [ ] Revisar o diff do trabalho para densidade mobile, semântica acessível, dados antigos, erros e mudanças locais anteriores.
- [ ] Registrar os resultados de navegador e o que ainda não foi testado em aparelhos/Safari nos dois documentos.
- [ ] Registrar apenas a documentação de verificação com a mensagem `docs: record member motion and mobile review`.
