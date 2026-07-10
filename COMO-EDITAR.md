# Como Editar o Guia de Estudos

Desde a migração para Firebase, as disciplinas, atividades, turmas e usuários
**não ficam mais em código** (`curso.data.ts`) nem em planilha do Google — tudo é
gerenciado pelo próprio app, pelo painel de administração.

## Acessando o painel admin

1. Faça login com uma conta que tenha o papel **Administrador**.
2. No menu lateral, uma seção "Administração" aparece com: **Turmas**, **Usuários** e **Disciplinas**.

## Turmas

Em **Administração → Turmas**: crie uma turma por curso/período (ex: "3º Ano · 1º Semestre 2026").
Alunos escolhem a turma na tela de cadastro — só turmas marcadas como "Ativa" aparecem lá.

## Disciplinas

Em **Administração → Disciplinas**: selecione a turma no topo da página, depois crie ou edite
uma disciplina. Campos de lista (horários, conteúdo programático, bibliografia) usam
um campo de texto com **um item por linha**, separando as partes com `|`:

```
Quinta | M2 | 08:50 às 10:30
```

```
Unidade 1 | O ministério da palavra: pregação, ensino e aconselhamento.
```

## Atividades (avaliações)

Dentro de cada disciplina no painel admin, clique em **"Atividades"** para cadastrar,
editar ou excluir as avaliações daquela disciplina (descrição, data, tipo e pontos).
Isso é o que aparece nas telas de Avaliações, Progresso e Dashboard para os alunos.

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
