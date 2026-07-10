# Como Editar o Guia de Estudos

Desde a migração para Firebase, as disciplinas, atividades, turmas e usuários
**não ficam mais em código** (`curso.data.ts`) nem em planilha do Google — tudo é
gerenciado pelo próprio app, pelo painel de administração.

## Meu Perfil (qualquer usuário)

Clicando no seu nome/avatar no canto inferior da barra lateral (ou acessando
`/perfil`), qualquer usuário — aluno ou administrador — pode:

- Mudar o **nome de exibição**.
- **Alterar a senha** (precisa digitar a senha atual).
- Escolher um **avatar**: as opções são geradas automaticamente pela API gratuita
  do [DiceBear](https://www.dicebear.com) (estilo *Open Peeps*). Clique em "Gerar
  outras opções" para ver mais alternativas, escolha uma e clique em "Salvar avatar".

## Acessando o painel admin

1. Faça login com uma conta que tenha o papel **Administrador**.
2. No menu lateral, uma seção "Administração" aparece com: **Turmas**, **Períodos**,
   **Módulos de Horário**, **Usuários** e **Disciplinas**.

## Turmas e Períodos

Esses são dois conceitos diferentes:

- **Turma** é o grupo de alunos (ex: "Turma Seminário") — o aluno escolhe a turma
  **uma vez**, no cadastro, e isso nunca muda.
- **Período** é o semestre letivo de uma turma (ex: "3º Ano · 1º Semestre 2026").
  É o período que muda a cada ~6 meses, não a turma.

Em **Administração → Turmas**: crie/edite as turmas. Só turmas marcadas como "Ativa"
aparecem no dropdown de cadastro.

Em **Administração → Períodos**: selecione uma turma e crie/edite os períodos dela.
Só um período por turma pode estar **"Em curso"** — é esse que define quais
disciplinas/atividades os alunos daquela turma enxergam. Para passar de semestre,
crie o novo período e clique em **"Tornar em curso"**: todos os alunos da turma
passam a ver as novas disciplinas automaticamente, sem precisar se recadastrar.

## Módulos de Horário

Em **Administração → Módulos de Horário**: selecione a turma e cadastre os blocos
de horário dela (ex: código `M1`, horário `07:00 às 08:40`). Isso é o **único**
lugar onde você digita um horário livremente — cadastre uma vez por turma
(normalmente não muda de semestre a semestre) e reaproveite em todas as disciplinas.

## Disciplinas

Em **Administração → Disciplinas**: selecione o período no topo da página (a lista já
mostra "Turma — Período", não precisa escolher a turma separadamente — uma disciplina
pertence a um período, e o período já sabe de qual turma é), depois crie ou edite
uma disciplina.

Os horários da disciplina são escolhidos, não digitados: clique em **"+ Adicionar
horário"**, escolha o **dia da semana** e o **módulo** (da lista cadastrada em
Módulos de Horário) — repita para cada dia/horário que a disciplina ocorre. Se
não houver módulo cadastrado ainda para a turma, um aviso aparece com o link direto
para cadastrar.

**Conteúdo programático** é um campo de texto livre — escreva do jeito que preferir,
sem formatação nenhuma exigida.

**Bibliografia** continua em um campo de texto com **uma referência por linha**
(sem `|`, cada linha é uma referência).

## Atividades (avaliações)

Em **Administração → Atividades**: área geral para cadastrar, editar ou excluir
atividades avaliativas — nome, descrição (opcional), data de entrega, categoria e
pontos, escolhendo a disciplina em um select. O link **"Atividades"** de cada
disciplina em Administração → Disciplinas leva pra essa mesma área, só que já com
a disciplina pré-selecionada e a lista filtrada.

Uma atividade só pode ser cadastrada no **período em curso** da sua turma — não
tem seletor de período nessa tela. Se sua turma não tem período em curso ainda,
um aviso leva direto para Períodos.

Isso é o que aparece na tela **Atividades** do aluno (antes chamada de
"Avaliações" — só o rótulo do menu mudou, a página é a mesma), no Progresso e no
Dashboard. As atividades do 1º semestre (cadastradas pelo seed antes do campo
"Nome" existir) mostram o texto da descrição no lugar do nome — funciona normal,
só não tem um título curto até você editá-las e preencher o campo Nome.

## Usuários

Em **Administração → Usuários**: veja todos os alunos cadastrados, mude a turma ou
o papel (aluno/administrador) de qualquer um, ou desative o acesso de alguém sem
apagar o histórico de progresso.

## Papéis

- **Aluno**: acesso normal ao app, progresso salvo na própria conta.
- **Administrador**: tudo que o aluno vê, mais o painel de administração.

O primeiro administrador do sistema precisa ser promovido manualmente no Firebase
Console (Firestore → coleção `usuarios` → documento do seu usuário → mudar o campo
`role` para `administrador`), já que todo cadastro novo entra como aluno por padrão.

## Rodando o app localmente

```bash
npm start
# Acesse http://localhost:4200
```
