# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

"Guia de Estudos" is an Angular 20 (standalone components, signals, zoneless-style
services) app that helps a seminary class track disciplinas (courses), avaliações
(assignments/tests) and personal progress through a semester. It is deployed as a
static site on GitHub Pages, with **Firebase (Auth + Firestore)** as the backend.
The app supports multiple turmas (class cohorts), student self-signup, and an admin
panel for managing turmas/disciplinas/atividades/usuários.

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

- `turmas/{turmaId}` — a class cohort (`nome`, `anoSemestre`, `ativa`). Publicly
  readable (needed for the signup dropdown before login); writes admin-only.
- `usuarios/{uid}` — doc id **is** the Firebase Auth uid. `role: 'aluno' | 'administrador'`,
  `turmaId`, `ativo`. New signups always self-create this doc with `role: 'aluno'` —
  `firestore.rules` enforces that a user can never set their own `role`/`turmaId`/`ativo`.
- `disciplinas/{disciplinaId}` — scoped by `turmaId`. Carries `conteudoProgramatico[]`,
  `bibliografia[]`, and `horarios[]` (weekly schedule slots) embedded directly on
  the document — there's no separate horário collection.
- `avaliacoes/{avaliacaoId}` — scoped by `turmaId` and `disciplinaId`. Called
  "atividades" in the admin UI/copy, but the model/collection name is `Avaliacao`/`avaliacoes`.
- `progresso/{uid}` — one doc per student: `concluidas: string[]` (avaliação ids)
  and `notas: Record<disciplinaId, string>`. Doc id is the uid, not auto-generated.

### Service layer and how turma-scoping propagates

- `services/firebase.ts` — the only place that calls `initializeApp`; exports
  singleton `auth`/`db`. Everything else imports these two, never re-inits Firebase.
- `AuthService` owns `usuario` (Firebase `User`), `perfil` (the `usuarios/{uid}` doc,
  live via `onSnapshot`), `isAdmin` (computed), and `pronto: Promise<void>` — guards
  `await auth.pronto` before checking `logado()`/`isAdmin()`, because on page load
  the Firebase Auth state and the profile doc both arrive asynchronously and
  `logado()`/`isAdmin()` would otherwise read stale `false` values.
- `DisciplinasService` and `AvaliacoesService` each expose a `turmaId` computed
  signal that defaults to `authService.perfil()?.turmaId`, but can be overridden
  per-service via `setTurma(id)` — this is how the admin disciplinas page lets an
  admin browse a turma other than their own. `DisciplinasService.disciplinas()`
  is the merged view (each disciplina with its `avaliacoes[]` joined in from
  `AvaliacoesService`) that page components consume — this mirrors the exact
  shape the old `SheetsService.disciplinas()` computed used to return, so most
  page components only needed their injected service swapped, not rewritten.
- `TurmasService` and `UsuariosService` are not turma-scoped — they list
  everything (rules restrict writes, not reads, to admins where relevant).
- `ProgressoService` replaces the old `localStorage`-backed `StorageService`.
  Same public API (`isConcluida`, `toggleConcluida`, `getNota`, `setNota`,
  `exportar`/`importar` JSON backup). On first login it seeds the new
  `progresso/{uid}` doc from any legacy `localStorage` data found in that browser
  (best-effort carry-over from the pre-auth version of the app), then Firestore
  is the sole source of truth from then on.

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
For `disciplinas-admin`, list-shaped fields (`horarios`, `conteudoProgramatico`,
`bibliografia`) are edited as one-item-per-line textareas with `|`-separated
parts (e.g. `Quinta | M2 | 08:50 às 10:30`) rather than dynamic `FormArray` UI —
keep new list-type fields consistent with this pattern unless there's a strong
reason not to. "Excluir" a usuário means setting `ativo: false` (blocks login),
never actually deleting the Firebase Auth account — that would require Admin SDK
/ a Cloud Function, which is intentionally out of scope (this runs on Firebase's
free Spark plan, no Cloud Functions).

### Security rules

`firestore.rules` is the actual enforcement point for roles/turma isolation —
service-layer code does not re-check permissions client-side beyond scoping
queries. Key invariants encoded there: a user can create their own `usuarios/{uid}`
doc but only with `role: 'aluno'`; only an existing admin can change `role`,
`turmaId`, or `ativo` on any user; disciplinas/avaliacoes reads require
`resource.data.turmaId` to match the caller's own `turmaId` (or the caller is
admin); `progresso/{uid}` is writable only by that uid. Rules are not deployed
via CI — publish changes manually through the Firebase Console (Firestore →
Rules) or `firebase deploy --only firestore:rules` (project id lives in
`.firebaserc`).

### Seeding / bootstrapping a Firestore project

`scripts/seed-firestore.ts` uses `firebase-admin` (bypasses security rules) to
create one turma plus all disciplinas/avaliações from `curso.data.ts`. It needs
a service account key saved at `scripts/service-account.json` (gitignored, never
commit it). There's no automated way to create the first administrator: sign up
normally through `/cadastro` (creates a `role: 'aluno'` doc), then manually flip
that user's `role` to `administrador` in the Firebase Console.

## Environment / config

`src/environments/environment.ts` holds the Firebase web config (apiKey, projectId,
etc.) — these are public client identifiers, not secrets; real access control is
`firestore.rules`, not hiding this file. There is no dev/prod environment split
(no `fileReplacements` in `angular.json`) — the same config is used everywhere.
