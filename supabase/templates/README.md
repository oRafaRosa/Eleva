# E-mail de confirmação

Assunto: **Confirme seu e-mail | ELEVA the club**.

`confirmation.html` contém o modelo do Supabase. O botão e o link alternativo usam `{{ .ConfirmationURL }}`, sem alterar o token ou o destino de confirmação gerado pelo Auth. A mensagem não concede nem promete acesso PRO.

As imagens oficiais são publicadas em `https://eleva-the-club.vercel.app/email/`. A composição usa tabelas, estilos inline, cores de fundo sólidas, fontes de sistema, imagens com texto alternativo e CTA em HTML, para continuar legível quando o cliente bloqueia imagens. A assinatura “the club” preserva a fonte Allura do aplicativo, rasterizada por `scripts/build-email-assets.py` para não depender de fontes externas nos clientes de e-mail.

`public/email/confirmation-preview.html` é uma prévia visual, sem tokens e com os botões de confirmação desativados. Não usar essa prévia como modelo no Supabase.

## Aplicação no Supabase

No projeto ELEVA `xtplovndgwimijqjfdmn`, abrir Authentication, Email, Templates, Confirm sign up. Copiar o assunto e o conteúdo completo de `confirmation.html`, salvar e conferir a prévia. A versão atual do conector não oferece edição de modelos de Auth; é necessário acesso ao painel.

O painel continua pedindo autenticação. Modelo preparado e versionado, **ainda não aplicado ao serviço de envio**. Não enviar e-mail real de teste sem um destinatário explicitamente indicado pela equipe. Após configurar SMTP e URLs de Auth, validar a entrega e a confirmação com uma conta controlada pela equipe.

Verificação desta entrega: estrutura HTML, link de confirmação, imagens públicas e prévia de navegador. Não substitui testes em Gmail, Apple Mail e Outlook, nem atesta entrega de e-mail.
