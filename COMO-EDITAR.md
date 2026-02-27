# Como Editar o Guia de Estudos

Todas as avaliações e datas ficam no arquivo:

```
src/app/data/curso.data.ts
```

---

## Alterar a data de uma entrega

Cada avaliação tem este formato:

```typescript
{
  id: 'tp03-1',
  disciplinaId: 'tp03',
  descricao: 'Leituras e Declaração — "A Utilidade das Escrituras..."',
  data: '2026-03-05',        // data no formato AAAA-MM-DD
  dataDisplay: '05/03/2026', // como aparece na tela (DD/MM/AAAA)
  pontos: 10,
  tipo: 'declaracao'
},
```

Altere **os dois campos**: `data` e `dataDisplay`.

**Exemplo:** mover a entrega para 10 de março:
```typescript
data: '2026-03-10',
dataDisplay: '10/03/2026',
```

---

## Adicionar uma nova avaliação

Encontre a disciplina desejada no arquivo (procure pelo nome ou pelo id) e adicione
um novo objeto dentro do array `avaliacoes:`, no final da lista:

```typescript
avaliacoes: [
  // ... avaliações existentes ...

  // adicione aqui no final
  {
    id: 'tp03-7',            // ID único: código da disciplina + número sequencial
    disciplinaId: 'tp03',   // mesmo código da disciplina
    descricao: 'Trabalho sobre aconselhamento matrimonial',
    data: '2026-05-15',     // null se não tiver data fixa
    dataDisplay: '15/05/2026',
    pontos: 15,
    tipo: 'trabalho'
  },
],
```

### Tipos disponíveis para o campo `tipo`

| Valor         | Cor    | Quando usar                        |
|---------------|--------|------------------------------------|
| `'prova'`     | Vermelho | Provas finais                    |
| `'teste'`     | Âmbar    | Testes / questionários           |
| `'trabalho'`  | Azul     | Trabalhos escritos               |
| `'projeto'`   | Roxo     | Projetos (ex: monografia)        |
| `'leitura'`   | Verde    | Avaliação de leitura de livro    |
| `'declaracao'`| Ciano    | Declaração de leitura            |
| `'continuo'`  | Cinza    | Atividades sem data fixa         |

### Se não tiver data fixa (atividade contínua)

```typescript
data: null,
dataDisplay: 'Contínuo',  // ou 'Semana de provas', 'Última aula', etc.
```

---

## IDs das disciplinas

| ID      | Disciplina                            |
|---------|---------------------------------------|
| `tp03`  | Aconselhamento 1                      |
| `ts12`  | Cosmovisão Calvinista                 |
| `th52`  | Desafios Missionários Contemporâneos  |
| `te17`  | Exegese do Antigo Testamento 1        |
| `te20`  | Exegese do Novo Testamento 1          |
| `th04`  | História da Igreja 4                  |
| `th07`  | História do Pensamento Cristão 1      |
| `cg12`  | Monografia 1                          |
| `cg64`  | Psicopatologia                        |
| `cg10`  | Sociologia Geral                      |
| `tp07`  | Teologia de Missões 1                 |

---

## Regra do campo `id`

O `id` precisa ser único em todo o arquivo. Use o padrão `[código]-[número]`:

- `tp03-7` → 7ª avaliação de Aconselhamento 1
- `th04-6` → 6ª avaliação de História da Igreja 4

---

## Como rodar o app

```bash
cd guia-estudos
ng serve
# Acesse http://localhost:4200
```

Após salvar qualquer alteração no `curso.data.ts`, o servidor recarrega
automaticamente e as mudanças aparecem na tela em segundos.
