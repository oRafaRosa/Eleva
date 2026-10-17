# Perfis da comunidade

Integrantes com acesso ativo ao clube abrem o perfil pelo nome ou foto nas publicações e comentários do Conectar. Meu ELEVA também oferece “Ver meu perfil na comunidade”.

A página mostra foto, nome atual, data de cadastro, tempo desde esse cadastro e até seis postagens não removidas. O destaque considera a soma de curtidas e comentários visíveis; empates usam a publicação mais recente e o ID como desempate estável. É tempo desde o cadastro, não histórico de mensalidades pagas, que não existe no banco.

## WhatsApp

“Editar perfil” oferece “Mostrar meu WhatsApp no perfil”, desativado por padrão inclusive para contas existentes. O número só integra a resposta do serviço quando a pessoa opta por mostrá-lo. Cidade e e-mail não entram nessa resposta. Ao desativar a opção e salvar, novas consultas deixam de retornar o número. O botão de contato abre wa.me por ação da visitante; não envia mensagens automaticamente. DDD é tratado como brasileiro; outros países usam +DDI.

## Fotos e autorização

O bucket eleva-avatars continua privado. A dona gerencia seus arquivos; outras integrantes só podem ler o caminho da foto atual de um perfil com acesso ativo. Fotos antigas, uploads de outras integrantes e conteúdo de contas suspensas ou expiradas não são liberados pela política da comunidade.

A tabela profiles mantém suas políticas privadas. A função pública community_profiles é uma interface invoker para uma projeção restrita em eleva_private, com validação do acesso da solicitante e do perfil consultado. A função de destaque também respeita RLS. Não se usam metadados editáveis de autenticação para conceder acesso.

O feed resolve nomes/fotos em lotes de até 100 IDs e assina URLs por cinco minutos. O componente de foto mantém dimensões estáveis, usa inicial quando necessário e renova URLs enquanto está montado. A edição continua preservando rascunhos e protegendo a saída com alterações pendentes, incluindo a preferência de WhatsApp.

## Validação

- Testes de domínio: identidade atual em posts antigos, foto adicionada/removida, consentimento, número com DDI, classificação e limite dos destaques, data local.
- PGlite com todas as migrações: projeção sem telefone privado/cidade, opt-in e revogação, arquivos atuais, proprietário, anonimato, FREE, banimento, expiração e ranking.
- TypeScript, build web e suíte de regressão.
- Banco hospedado: projeção de dois perfis retornou WhatsApp nulo por padrão; consulta autenticada confirmou leitura de uma foto de outra integrante. Advisor de segurança sem novos alertas (permanece o aviso anterior de proteção contra senhas vazadas).
- Navegador local isolado em 390 e 320 px: consentimento salvo, número exibido e retirado, abertura do perfil pelo post e pelo comentário, navegação do destaque para a conversa e ausência de overflow. Dados de demonstração sem escrita em produção.
- Sem validação em aparelho físico ou com leitor de tela nesta rodada.
