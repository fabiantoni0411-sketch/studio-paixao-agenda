# Studio Paixão — Agenda Online

Site + agenda online + painel administrativo para o Studio Paixão (Cílios & Sobrancelha).

Stack: **Next.js + Tailwind + Supabase**, hospedado na **Vercel** (mesmo modelo do Altar Virtual).

---

## 1. Criar o projeto no Supabase

1. Acesse https://supabase.com e crie um projeto novo (gratuito).
2. Anote a **Project URL** e a **anon public key** em *Project Settings > API*. Você vai usar isso no passo 4.
3. Vá em **SQL Editor** > **New query**, cole todo o conteúdo do arquivo `supabase/schema.sql` (está nessa pasta) e clique em **Run**.
   - Isso cria as tabelas, as regras de segurança e já cadastra os 10 serviços com os preços atuais e os horários padrão (segunda a sábado, 9h às 19h, sábado até 17h, domingo fechado).
4. Vá em **Storage** > **New bucket**, crie um bucket chamado `galeria` e marque a opção **Public bucket**. É nele que as fotos da galeria vão ficar salvas.
5. Vá em **Authentication > Users > Add user** e crie o SEU login de admin:
   - **E-mail**: use o formato `NUMERODOCELULAR@studiopaixao.local` — por exemplo, se o número for `11978319614`, o e-mail cadastrado deve ser `11978319614@studiopaixao.local` (é só um formato interno; você nunca vai ver nem usar esse "e-mail" no dia a dia).
   - **Senha**: a senha que você quiser usar para entrar no painel.
   - No site, você vai digitar só o **número de celular** (do jeito que quiser, com ou sem traço/parênteses — o sistema considera só os números) e a **senha** — não precisa lembrar do formato de e-mail.

## 2. Variáveis de ambiente

Copie o arquivo `.env.local.example` para um novo arquivo chamado `.env.local` e preencha com os dados do passo 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## 3. Subir para o GitHub

1. Crie um repositório novo no GitHub (ex: `studio-paixao-agenda`).
2. Suba todos os arquivos dessa pasta para o repositório (pelo site do GitHub, em "Add file > Upload files", ou por linha de comando se preferir).
   - **Não** suba o arquivo `.env.local` (ele já está no `.gitignore`).

## 4. Publicar na Vercel

1. Acesse https://vercel.com, clique em **Add New > Project** e selecione o repositório que você acabou de subir.
2. Em **Environment Variables**, adicione as mesmas duas variáveis do passo 2:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Clique em **Deploy**. Depois de alguns minutos o site estará no ar em um endereço tipo `studio-paixao-agenda.vercel.app`.
4. Se quiser um domínio próprio, em **Project Settings > Domains** você pode conectar o domínio que preferir.

## 5. Como usar

- Site público: página inicial com mensagem de boas-vindas, serviços e galeria, e `/agendar` para o cliente escolher serviço, data, horário, forma de pagamento (Pix, Débito ou Crédito) e confirmar.
- **Acesso ao painel admin é oculto**: não existe nenhum botão ou link visível de "admin" no site. Para entrar, toque **3 vezes seguidas** no textinho de copyright no rodapé (© Studio Paixão...) — isso leva direto para a tela de login em `/admin`. Lá, entre com o número de celular e a senha que você cadastrou no passo 1.5.
  - **Agendamentos**: veja, com forma de pagamento escolhida, e cancele agendamentos.
  - **Horários**: defina os dias e horários da semana que você atende, e adicione dias de folga/feriado ou horário especial.
  - **Serviços**: edite nomes, preços, duração e ative/desative serviços.
  - **Galeria**: envie e remova fotos que aparecem na página inicial.

## 6. Sobre a forma de pagamento

A escolha de Pix, Débito ou Crédito é apenas informativa — o site não processa
pagamento online, é só para você já saber como o cliente pretende pagar quando
chegar no estúdio.

## 7. Sobre os horários da agenda

- Volume Russo ocupa **2 horas** na agenda.
- Todos os outros serviços de cílios (Volume Light, Brasileiro, Híbrido, Fox Normal, Mega Fox, Efeito 4D, Remoção Química) ocupam **1h30**, exceto a Remoção Química que foi configurada com 30 minutos — se quiser mudar, é só ajustar em **Serviços** no painel.
- Designer de Sobrancelha (simples ou com henna) ocupa **30 minutos**.
- Você pode alterar qualquer uma dessas durações a qualquer momento pela tela **Serviços**, sem precisar mexer no código.

## 8. Resumo do agendamento pelo WhatsApp

Depois que o cliente confirma o agendamento, aparece uma mensagem de agradecimento
("Muito obrigada pelo seu agendamento! 💕") pedindo para ele encaminhar o resumo
pelo WhatsApp do estúdio. O botão já abre o WhatsApp com uma mensagem pronta,
contendo nome do cliente, serviço, data, horário, valor e forma de pagamento
escolhida — assim você confirma tudo certinho sem precisar configurar e-mail
ou SMS automático. Os agendamentos também ficam salvos e visíveis no painel
`/admin/dashboard` a qualquer momento.
