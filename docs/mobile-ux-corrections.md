# Correções da revisão mobile

Implementação da revisão registrada em `mobile-ux-review.md`. A identidade da ELEVA foi preservada: bordô, rosa, marfim e tipografia editorial. Mobile Design e Mobile Native orientaram a prioridade de conteúdo, navegação e clareza, sem acrescentar animação decorativa.

| Área            | Correção                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Publicações     | Leitura e prévia usam `PublicationBody`, incluindo oração, aplicação, exercícios em texto ou arrays, objetivo e metadados. Salvar fica próximo ao título, conclusão no fim. |
| Admin           | Cabeçalho compacto, três áreas principais, opções editoriais recolhidas, critérios ativos visíveis e pendências do calendário sob demanda.                                  |
| Datas           | Seletores date/month/time na web e formato brasileiro no fallback nativo, preservando validação e fuso de São Paulo.                                                        |
| Comunidade      | Comentários em `/community/[id]`, com retorno, proteção de rascunho e recuperação de carregamento. Autoria, curtidas e moderação preservadas.                               |
| Perfil          | Proteção ao sair, rascunho por conta, limpar rascunho ao salvar/descartar/reverter e avanço de foco. Ações da conta recolhidas antes dos salvos.                            |
| Desafios        | Período visível e atividades recolhidas, sem simular inscrição ou progresso no GymRats.                                                                                     |
| Imagens e toque | Espaço de capa reservado, fallback de falha, Ver todos com alvo de 48px e foco de campos mais visível.                                                                      |
| Navegação       | Ícones de abas distintos, fallback de retorno para links diretos e página inexistente respeitando a sessão.                                                                 |
| Sessão e erros  | Erro transitório preserva dados da mesma conta verificada. Sessão inválida, revogação e troca de identidade limpam privados. Erros têm opção de tentar novamente.           |
| Encontros       | Ações com espera, proteção contra envio repetido e confirmação ao cancelar. Gravação concluída com refresh indisponível não é tratada como falha da gravação.               |
| Conta de testes | Nome padrão Jeice; identidade interna estável para preservar atividades. Nomes personalizados não são substituídos.                                                         |

## Verificação

TypeScript, testes de comportamento, SQL em banco descartável e build web. Não houve aplicação de migrações a bancos remotos nem adição de bibliotecas visuais. O build publicado pelo GitHub Pages executa as verificações sobre o commit final.

## Limites

Sem teste visual em navegador ou aparelho real nesta execução. Safari/Chrome móveis, teclado aberto, VoiceOver/TalkBack, back nativo, seletores de data, fotos com enquadramentos diferentes e insets inferiores continuam exigindo validação real. Os riscos visuais não foram apresentados como defeitos reproduzidos em todos os dispositivos. Recorte manual de foto, temas adicionais e virtualização de listas extensas não foram adicionados sem essa evidência.

## Evolução da área logada — 17/10/2026

- Início mostra até dois conteúdos salvos e não concluídos em linhas compactas, sem repetir o devocional do dia. “Retomar” não afirma que o app conhece a posição de leitura.
- Aprender combina busca, pilar e formato; os formatos ficam em uma faixa horizontal dentro dos filtros recolhidos, sem acrescentar várias linhas permanentes ao celular.
- Viver separa encontros futuros confirmados em `Sua agenda` e não os repete em `Próximos encontros`. Desafios mantêm a primeira posição e usam padding menor.
- Meu ELEVA alterna Salvos e Concluídos em uma biblioteca de linhas compactas. Itens removidos não geram links na lista.
- O carimbo único da navegação se move atrás dos ícones; rótulos e áreas de toque permanecem. Chips de filtro usam borda mais nítida.

Os novos seletores e a geometria do carimbo têm testes focados. A exportação web passou. A prévia local não abriu no navegador do ambiente por bloqueio de verificação administrativa, então largura de 320 px, fonte ampliada, alinhamento visual do carimbo e sensação em toque rápido ainda precisam de revisão visual em navegador e aparelho. A configuração de produção foi restaurada depois da geração da prévia de demonstração.
