# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

"Guia de Estudos" is an Angular 20 (standalone components, signals, zoneless-style
services) app that helps a seminary class track disciplinas (courses), avaliações
(assignments/tests) and personal progress through a semester. It is deployed as a
static site on GitHub Pages, with **Firebase (Auth + Firestore)** as the backend.
The app supports multiple turmas (class cohorts), invite-gated student self-signup,
and an admin panel for managing turmas/disciplinas/atividades/usuários.

## Commands

```bash
npm start                    # ng serve — dev server at http://localhost:4200
npm run build                 # production build (ng build) → dist/guia-estudos
npm run watch                  # dev build with --watch
npm test                       # ng test (Karma/Jasmine) — no test files currently exist
npx tsc -p tsconfig.app.json --noEmit   # type-check only, faster than a full build
npm run seed                   # runs scripts/seed-firestore.ts via tsx (one-off Firestore seed)
```

There is no lint script configured. Use the `tsc --noEmit` command above plus
`npx ng build` to catch template type errors (Angular's template checker only runs
through the full Angular compiler, not plain `tsc`).

## Architecture

### Data flows through Firestore, not code or Google Sheets

Earlier versions of this app hardcoded disciplinas in `src/app/data/curso.data.ts`
and pulled avaliações from a published Google Sheets CSV (`sheets.service.ts`).
Both were removed. **`curso.data.ts` now exists only as the input for the one-time
seed script** (`scripts/seed-firestore.ts`) and is not imported by the app at
runtime — don't wire it back into any component or service.

All live data lives in Firestore, read via `onSnapshot` listeners exposed as
Angular `signal`s (mirroring the pattern the old `sheets.service.ts` used: a
`carregando`/`erro`/data signal trio, updated inside `NgZone.run(...)` since
Firestore callbacks fire outside Angular's zone).

Firestore collections (see `src/app/models/models.ts` for the matching TS types):

- `turmas/{turmaId}` — a **persistent student cohort** (`nome`, `ativa`) — e.g. the
  group of students who entered the program together. Does not change every
  semester. Read requires auth (**not** public — see "Invite-gated signup"
  below for why); writes admin-only. Also carries `conviteToken` and
  `codigoConvite` for the current signup invite (see below).
- `convites/{token}` — public-readable-by-`get` (never `list`) invite lookup:
  `{turmaId, turmaNome, ativo}`, doc id **is** the token from the invite URL.
  Deliberately excludes the code — see "Invite-gated signup".
- `periodos/{periodoId}` — a semester cycle *within* a turma (`turmaId`, `nome`,
  `anoSemestre`, `ativo`). Exactly one período per turma should have `ativo: true`
  at a time — that's the one whose disciplinas/avaliações students see. This is
  the level that changes every ~6 months, not `turmas`.
- `usuarios/{uid}` — doc id **is** the Firebase Auth uid. `role: 'aluno' | 'administrador'`,
  `turmaId` (the persistent cohort — chosen once at signup, doesn't change when
  the semester rolls over), `ativo`. New signups always self-create this doc with
  `role: 'aluno'` — `firestore.rules` enforces that a user can never set their own
  `role`/`turmaId`/`ativo`, and (as of 2026-07-10) that the signup includes the
  turma's correct `codigoConvite` — see "Invite-gated signup".
- `modulos_horario/{moduloId}` — a schedule block registered per-turma (`turmaId`,
  `codigo` e.g. `"M1"`, `horario` free-text e.g. `"07:00 às 08:40"`). This is the
  **only** place schedule times are typed freely — admin-only read/write. Exists
  so `disciplinas-admin`'s horário editor can be select-only (no typo-prone free
  text per disciplina) while still letting each turma/institution define its own
  arbitrary block structure (not hardcoded M1/M2/M3 in code).
- `disciplinas/{disciplinaId}` — scoped by `periodoId` (not `turmaId` directly).
  Carries `conteudoProgramatico[]`, `bibliografia[]`, and `horarios: AulaHorario[]`
  (`{dia, modulo, horario}`) embedded directly on the document — there's no live
  reference to `modulos_horario` here, it's a **denormalized snapshot** taken at
  save time (see below).
- `avaliacoes/{avaliacaoId}` — scoped by `periodoId` and `disciplinaId`. Called
  "atividades" in the admin UI/copy (and, as of 2026-07-10, in the student nav
  too — the route is still `/avaliacoes` and the component/service are still
  named `Avaliacoes*`, only the user-facing label changed to "Atividades"),
  but the model/collection name is `Avaliacao`/`avaliacoes`. Has both `nome`
  (short title) and `descricao` (optional longer detail) — `nome` was added
  after `descricao` already existed, so **older docs may lack it**; every
  student-facing page that renders an avaliação's title does
  `av.nome || av.descricao`, and — consistently across all of them
  (`dashboard`, `avaliacoes`, `disciplina-detalhe`, `progresso`) — additionally
  renders `av.descricao` as a secondary line whenever *both* `nome` and
  `descricao` are present (so the fallback and the "show both" case never
  double up the same text). Keep this pair together if you touch any of these
  templates. `atividades-admin` (the admin list, not student-facing) still
  only shows the title — no secondary line there, since the admin already
  edits `descricao` directly in the form. `atividades-admin` is a standalone page (not
  nested under a disciplina) with a disciplina `<select>` in the form —
  reachable directly at `/admin/atividades`, or via the "Atividades" link on a
  disciplina in `disciplinas-admin`, which passes `?disciplina=<id>` to
  pre-select/filter.
- `progresso/{uid}` — one doc per student: `concluidas: string[]` (avaliação ids)
  and `notas: Record<disciplinaId, string>`. Doc id is the uid, not auto-generated.
  Deliberately **not** scoped by período — a student's completed-activity history
  persists across semesters even as `periodoId` scoping moves them into new
  disciplinas/avaliações each term.

### Service layer and how turma/período-scoping propagates

- `services/firebase.ts` — the only place that calls `initializeApp`; exports
  singleton `auth`/`db`. Everything else imports these two, never re-inits Firebase.
- `AuthService` owns `usuario` (Firebase `User`), `perfil` (the `usuarios/{uid}` doc,
  live via `onSnapshot`), `isAdmin` (computed), and `pronto: Promise<void>` — guards
  `await auth.pronto` before checking `logado()`/`isAdmin()`, because on page load
  the Firebase Auth state and the profile doc both arrive asynchronously and
  `logado()`/`isAdmin()` would otherwise read stale `false` values.
- `PeriodosService` loads *all* períodos (small collection) and exposes
  `porTurma(turmaId)` and `ativoDaTurma(turmaId)` as plain lookups over the local
  signal — no per-turma Firestore queries needed. `ativar(turmaId, periodoId)`
  does a batched write that flips the previously-active período of that turma to
  `ativo: false` at the same time it activates the new one, so the "exactly one
  active período per turma" invariant never has a window where it's violated or
  briefly doubled-up.
- `DisciplinasService` and `AvaliacoesService` each expose a `periodoId` computed
  signal that defaults to *the active período of the logged-in user's turma*
  (`authService.perfil()?.turmaId` → `periodosService.ativoDaTurma(...)`), but can
  be overridden per-service via `setPeriodo(id)`.
  - `disciplinas-admin` is the only page that actually uses the override — it
    exposes a flat "Período" `<select>` (labeled `"<turma> — <período>"`, not a
    two-level turma→período cascade, since a período already carries its own
    `turmaId`) so an admin can browse/edit a período other than their own current
    one (a past semester, or a different turma's período). Any turma-scoped
    lookup it still needs (e.g. `ModulosHorarioService.porTurma(...)`) derives the
    turma id *from* the selected período via a `turmaIdAtual` computed, never the
    other way around.
  - `atividades-admin` **never overrides** — per an explicit product rule ("uma
    atividade só pode ser registrada para o período em curso"), it has no período
    selector at all and always reads `disciplinasService.periodoId()` as-is
    (whatever that resolves to for the admin's own turma). It only shows a
    read-only `periodoAtual` label for context, and an amber prompt toward
    `/admin/periodos` if the turma has no período ativo yet.
  `DisciplinasService.disciplinas()` is the merged view (each disciplina with its
  `avaliacoes[]` joined in from `AvaliacoesService`) that page components consume —
  this mirrors the exact shape the old `SheetsService.disciplinas()` computed used
  to return, so most page components only needed their injected service swapped,
  not rewritten.

  **Pitfall already hit once — avoid reintroducing it:** don't compute a
  component's "default selection" signal *once*, synchronously, by reading
  another Firestore-backed service's signal (e.g. `periodosService.periodos()`)
  inside a plain `signal.set(...)` call in the constructor. Those collections
  load via `onSnapshot`, which is always asynchronous, so a value computed at
  construction time sees the pre-load empty state and never updates — the button
  that depends on it looks fine but silently no-ops forever. The fix used
  throughout `pages/admin/**` now: make the default itself a `computed()`
  (`periodoPadrao`), and combine it with a nullable override signal
  (`periodoOverride`) the user's manual selection writes to:
  `periodoSelecionado = computed(() => this.periodoOverride() ?? this.periodoPadrao())`.
  This is fully reactive with no timing trick — it resolves itself the instant
  the underlying data arrives, and a manual pick simply shadows it.
- `TurmasService`, `PeriodosService`, and `UsuariosService` are not scoped — they
  list everything (rules restrict writes, not reads, to admins where relevant).

  **Second pitfall already hit — this one specific to `TurmasService`/`PeriodosService`:**
  both are injected eagerly by the root `App` component, so they're constructed
  the moment the app loads — including on `/login`/`/cadastro`, *before* anyone
  is authenticated. Their `onSnapshot` used to subscribe unconditionally in the
  constructor; since `turmas`/`periodos` reads require `logado()`, that first
  subscription attempt (made pre-auth) got a `permission-denied` error — and a
  Firestore listener that errors out **does not auto-resubscribe** later just
  because the user subsequently logs in. Symptom: sign up or log in, land on
  `/dashboard`, and it renders completely empty (no disciplinas, `totalDisciplinas`
  0, etc.) until a hard refresh — because `DisciplinasService.periodoId` (properly
  reactive on its own) was waiting on `PeriodosService.periodos()`, which had
  gone permanently silent. Fixed by wrapping both services' subscription setup
  in an `effect()` keyed on `authService.logado()`, tearing down and re-subscribing
  whenever that flips — see either service for the pattern. **Any new
  root-provided service with its own `onSnapshot` must either (a) only ever be
  constructed after a guard confirms auth (like `DisciplinasService`,
  `UsuariosService`, `ModulosHorarioService` — all safe today because nothing
  injects them before their page's `authGuard`/`adminGuard` runs), or (b) use
  this same `logado()`-gated `effect()` if there's any chance it's constructed
  earlier (like anything injected directly by `App`).**
- `ProgressoService` replaces the old `localStorage`-backed `StorageService`.
  Same public API (`isConcluida`, `toggleConcluida`, `getNota`, `setNota`,
  `exportar`/`importar` JSON backup). On first login it seeds the new
  `progresso/{uid}` doc from any legacy `localStorage` data found in that browser
  (best-effort carry-over from the pre-auth version of the app), then Firestore
  is the sole source of truth from then on.

### Rolling over to a new semester

Advancing a turma to a new semester is an **admin action, not a data migration**:
create a new período for that turma in `/admin/periodos` and click "Tornar em
curso" (`PeriodosService.ativar`). Every student in that turma automatically sees
the new período's disciplinas/avaliações on next load — nobody's `usuarios.turmaId`
changes, nobody re-signs-up, and past períodos (and the disciplinas/avaliações tied
to them) stay in Firestore untouched for history.

### User profile & avatars

`/perfil` (`pages/perfil/perfil.component.ts`) is available to **every** logged-in
user (student or admin) — `authGuard` only, no `adminGuard`. It's where a user
changes their own `nome`, password, or avatar; there's no separate "account
settings" area anywhere else. Two `AuthService` methods back it:
- `atualizarPerfil({nome?, avatarSeed?})` — writes to `usuarios/{uid}` (allowed by
  the existing self-update rule, which only pins `role`/`turmaId`/`ativo`, so no
  rules change was needed for this field) and, when `nome` changes, also calls
  Firebase Auth's `updateProfile` so `auth.currentUser.displayName` stays in sync.
- `alterarSenha(senhaAtual, novaSenha)` — Firebase Auth requires a recent login
  for sensitive operations like a password change, so this always
  `reauthenticateWithCredential`s with the current password first, then calls
  `updatePassword`. There is no "forgot password" flow — only this in-app change
  while logged in.

Avatars are **not stored files** — `src/app/shared/avatar.ts` has two pure
functions: `avatarUrl(seed)` builds a DiceBear URL
(`https://api.dicebear.com/9.x/open-peeps/svg?seed=...`) and `seedAleatoria()`
generates a random seed string. Only the `seed` is persisted (`Usuario.avatarSeed`,
optional — older accounts won't have one); every place that renders an avatar
falls back to the user's `uid` as the seed when `avatarSeed` is unset, so
everyone has *some* deterministic avatar even before ever visiting `/perfil`.
The sidebar footer (`app.ts`) renders the logged-in user's avatar this way and
links to `/perfil`. If you add another avatar-rendering spot, reuse
`avatarUrl(...)` rather than re-deriving the DiceBear URL format.

### Routing and guards

`app.routes.ts` lazy-loads every page. `authGuard`/`adminGuard`/`guestGuard`
(in `guards/auth.guard.ts`) all `await auth.pronto` first. `/login` and
`/cadastro` are the only routes wrapped in `guestGuard` (redirects away if
already logged in); everything else under `authGuard`, and `/admin/**` additionally
under `adminGuard`. `app.ts` renders either the full sidebar shell or a bare
`<router-outlet>` depending on `auth.logado()` — login/cadastro pages render
full-screen without the shell.

### Admin CRUD conventions

Admin pages under `pages/admin/**` follow the same shape: inject the relevant
service, a reactive form, `editandoId` signal to toggle create vs. edit mode.
`bibliografia` is edited as a one-reference-per-line textarea (plain lines, no
`|` — it's a `string[]`). `conteudoProgramatico` used to be a `|`-separated
`{unidade, descricao}[]` (one item per line, parsed like `bibliografia` but with
2 segments) — a `|`-less line left `descricao` as `undefined`, which Firestore's
client SDK rejects outright on write (see the `erro` signal convention below: this
is exactly the failure it was added to surface, instead of the save silently
no-op'ing). Rather than hardening that parser, the user asked to drop the
structure entirely — it's now a single free-text `string` field, no parsing.
**Don't reintroduce `|`-parsing for `conteudoProgramatico`.**

Because `conteudoProgramatico` changed shape, `DisciplinasService` has a
`normalizar()` step on every Firestore read that converts the legacy
`{unidade, descricao}[]` shape (still present on documents written before this
change, e.g. the 1º Semestre 2026 seed) into a joined string — so components
never have to special-case old vs. new documents. If you ever add another
breaking field-shape change, prefer this same pattern (normalize on read in the
service) over a one-off data migration script.

`horarios` is the one exception, and deliberately **not** a textarea: it's a
signal-backed array of `{dia, moduloId}` rows (not an Angular `FormArray` — plain
`signal<LinhaHorario[]>` with `adicionarHorario`/`removerHorario`/`atualizarLinha`
in `disciplinas-admin.component.ts`) where `moduloId` is picked from a `<select>`
sourced from `ModulosHorarioService.porTurma(turmaId)`. On save, each row resolves
`moduloId` → the módulo's `codigo`/`horario` and that's what gets written to
`Disciplina.horarios` — free-text time entry only happens once, when registering
a módulo in `/admin/modulos-horario`, never per-disciplina. Editing a disciplina
whose stored `{modulo, horario}` doesn't match any currently-registered módulo
(e.g. edited before módulos existed) shows it as a "(não cadastrado)" legacy
option so the value isn't silently dropped — see the `legado` field on `LinhaHorario`.

"Excluir" a usuário means setting `ativo: false` (blocks login), never actually
deleting the Firebase Auth account — that would require Admin SDK / a Cloud
Function, which is intentionally out of scope (this runs on Firebase's free Spark
plan, no Cloud Functions).

Every admin page wraps its Firestore-writing calls (`criar`/`atualizar`/`excluir`/
`ativar`) in `try/catch`, setting an `erro = signal<string | null>(null)` and
rendering it above the form (`@if (erro()) { ... }`). This was added after a bug
where `criar()` rejected (e.g. a rules permission error) and the `await` just
threw into the void — the button visibly did nothing and there was no way for the
user to tell why. Keep this pattern on any new admin write path.

### Security rules

`firestore.rules` is the actual enforcement point for roles/turma isolation —
service-layer code does not re-check permissions client-side beyond scoping
queries. Key invariants encoded there: a user can create their own `usuarios/{uid}`
doc but only with `role: 'aluno'`; only an existing admin can change `role`,
`turmaId`, or `ativo` on any user; disciplinas/avaliacoes reads require the
caller's `turmaId` to match the `turmaId` of the período the document belongs to
(checked via a `get()` on `periodos/{periodoId}` inside the rule — see
`turmaDoPeriodo()`), or the caller is admin; `progresso/{uid}` is writable only by
that uid. Rules are not deployed via CI — publish changes manually through the
Firebase Console (Firestore → Rules) or `firebase deploy --only firestore:rules`
(project id lives in `.firebaserc`).

### Invite-gated signup (added 2026-07-10)

Signup used to be fully open: anyone reaching `/cadastro` picked any active turma
from a dropdown. As of 2026-07-10, `/cadastro` **requires** a `?convite=<token>`
query param resolving to an active invite — no token, no dropdown, no signup;
`CadastroComponent` shows a "convite necessário" blocked state instead of a form.
Each turma has its own invite (`conviteToken` + `codigoConvite` on the `turmas`
doc), managed from `/admin/turmas` (`ConvitesService.gerar(...)`) — generated
automatically when a turma is created, and re-generatable at any time (rotating
both the link and the code invalidates the previous ones; the old `convites/{token}`
doc is deleted).

The **code is a second factor specifically against the link leaking** (someone
forwards the invite URL to someone outside the class). It's deliberately *not*
retrievable by reading anything the unauthenticated signup page has access to —
`convites/{token}` (the only pre-auth-readable doc) holds `turmaId`/`turmaNome`/`ativo`
only, never the code. The code lives on `turmas/{turmaId}.codigoConvite`, and
`turmas` now requires `logado()` to read at all. So how does an *unauthenticated*
signup ever get verified against a code it structurally cannot read? — the
`usuarios/{uid}` `create` rule does the check itself, via a `get()` inside the
rule (`request.resource.data.codigoConvite == get(.../turmas/$(turmaId)).data.codigoConvite`).
Rule-internal `get()`/`exists()` calls run with full trusted access regardless of
the caller's own read permissions — this is the standard Firestore pattern for
"verify a secret without ever exposing it to reads," and it's why no Cloud
Function was needed for this.

One real wrinkle this creates: `createUserWithEmailAndPassword` and the
`usuarios/{uid}` `setDoc` are two separate steps, and the Auth account is created
*first*. If the code is wrong, the Firestore write is rejected by the rule
*after* the Auth account already exists — which would otherwise strand that
email on a permanently-orphaned account (no profile, can't be re-registered by
anyone). `AuthService.cadastrar()` handles this: on a `permission-denied` from
that `setDoc`, it calls `deleteUser(credencial.user)` to roll back the just-created
Auth account before surfacing `'CODIGO_INVALIDO'` to the caller. If you ever touch
this method, preserve that rollback — it's not optional cleanup, it's what keeps
a wrong code from permanently consuming someone's email address.

`ConvitesService` and `CadastroComponent`/`turmas-admin.component.ts` are the
places to look if this flow needs changes. The invite link itself is built with
`new URL('cadastro?convite=' + token, document.baseURI)` — **not**
`location.origin + location.pathname`, because the app is deployed to GitHub
Pages under a subpath (`--base-href /guia-de-estudos/`, see
`.github/workflows/deploy.yml`) that differs from local dev's `/`; `document.baseURI`
resolves correctly in both.

### Seeding / bootstrapping a Firestore project

`scripts/seed-firestore.ts` uses `firebase-admin` (bypasses security rules).
It's idempotent/destructive by design: every run **wipes** the `turmas`,
`periodos`, `disciplinas`, and `avaliacoes` collections first, then recreates one
turma + one (active) período + all disciplinas/avaliações from `curso.data.ts`
(deriving a short `nome` from each `descricao` via `derivarNome()`, since the
source data predates the `nome` field). It deliberately does not touch
`usuarios`/`progresso` — and **refuses to run** if the `usuarios` collection is
non-empty (real signups exist), to avoid orphaning their `turmaId`/`periodoId`
references; pass `--force` (`npm run seed -- --force`) to override that guard.
Needs a service account key saved at `scripts/service-account.json` (gitignored,
never commit it).

Since signup is invite-gated (see "Invite-gated signup" above), a from-scratch
seed **also generates and prints an invite token + code** for the seeded turma —
without that, a fresh project would have no possible way to create its first
account at all (no admin exists yet to generate one from the UI). The script
prints `<URL do app>/cadastro?convite=<token>` and the code at the end; use that
to sign up as yourself, then manually flip your own `role` to `administrador` in
the Firebase Console — there's still no automated way to create the first
administrator beyond that one manual step.

## Environment / config

`src/environments/environment.ts` holds the Firebase web config (apiKey, projectId,
etc.) — these are public client identifiers, not secrets; real access control is
`firestore.rules`, not hiding this file. There is no dev/prod environment split
(no `fileReplacements` in `angular.json`) — the same config is used everywhere.
