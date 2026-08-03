# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

"Guia de Estudos" is an Angular 20 (standalone components, signals, zoneless-style
services) app that helps a seminary class track disciplinas (courses), avaliações
(assignments/tests) and personal progress through a semester. It is deployed as a
static site on GitHub Pages, with **Firebase (Auth + Firestore)** as the backend.
The app supports multiple turmas (class cohorts), invite-gated student self-signup,
an admin panel for managing turmas/disciplinas/atividades/usuários, and a
gamification layer (XP, levels, achievement badges) to encourage consistent study habits.

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
  disciplinas/avaliações each term. As of 2026-07-10 also carries `xp` (lifetime,
  never decreases) and `ultimoDiaXp` (last local calendar date the daily-login XP
  was granted) — see "Gamification" below.
- `progresso_periodo/{uid}_{periodoId}` — the *período-scoped* half of
  gamification: `selos` (map of achievement id → ISO unlock timestamp),
  `atividadesBonificadas`/`disciplinasBonificadas` (ids already paid their XP
  bonus this período, so re-checking/un-checking an activity never double-pays),
  `diasComLogin` (count, this período only). Composite doc id, not auto-generated
  — always `${uid}_${periodoId}`. Resets to nothing every time a new período
  becomes ativo, unlike `progresso/{uid}`'s `xp`.

### Gamification (added 2026-07-10)

XP and level are **lifetime** (stored on `progresso/{uid}`, never reset).
Achievement badges ("selos") and the daily-login streak are **per período**
(stored on `progresso_periodo/{uid}_{periodoId}`) — a new período starts every
student back at zero selos, by explicit product decision (XP/level are the
long-term thread across semesters; selos are meant to feel fresh each term).
This means `bem_vindo`/`primeira_vitoria` are really "first login/activity *of
this período*", not lifetime-first, despite the achievement names.

`src/app/shared/gamificacao-catalogo.ts` holds the **static** catalog — level
titles/XP thresholds (`NIVEIS`), achievement definitions (`SELOS`), and the %
milestones that award both a selo and (only at 100%) XP (`MARCOS_PROGRESSO`).
This is deliberately code, not Firestore — only the *unlock state* is persisted
per user, the same "catalog in code, per-user state in the DB" split already
used for `labelTipo`/`getCorTipo` maps elsewhere. Levels and selos are rendered
as a FontAwesome icon (`icone`, e.g. `'fa-solid fa-crown'`) on a solid-color
circle (`cor`, a literal hex per item — deliberately not a theme token, same
reasoning as `getCorTipo`: each badge needs a stable identity color regardless
of theme) — this replaced an earlier version using hand-supplied PNGs in
`public/images/` (`nivel-*.png`/`selo-*.png`), dropped by explicit user
request because they weren't happy with those images. `public/images/` may
still contain the old PNG files; they're unused dead assets now, not wired
into any component. When adding a new level or selo, give it its own
`icone`/`cor` pair rather than reusing another entry's.

Level thresholds (`NIVEIS` in the catalog) were deliberately calibrated **not**
for a hypothetical student using the app from semester 1 of a multi-year
program, but for this actual turma, which is starting the feature mid-program
(3º ano) with a couple of semesters left — reaching the max level ("Reformador",
11.000 XP) is meant to be achievable within roughly 2 solidly-engaged semesters
for the real current users, not a multi-year grind. A future turma that starts
using the app from day one will hit max level faster and then just keep
accumulating XP numerically with no further title change — an accepted
trade-off, not a bug.

`GamificacaoService` (`services/gamificacao.service.ts`) is where the actual
event logic lives — it's injected eagerly by the root `App` component (same
reasoning as `TurmasService`/`PeriodosService`: needs to react to activity
completions regardless of which page is currently open, and correctly
auth-gates itself the same way, see the pitfall below). Several things worth
knowing before touching it:

1. **It never reads `DisciplinasService`/`AvaliacoesService`.** Those two are
   *overridable* (an admin browsing `/admin/disciplinas` can point them at a
   different período/turma via `setPeriodo(...)`), and gamification must always
   track the *logged-in user's own* período, never whatever an admin happens to
   be looking at. So `GamificacaoService` computes its own `meuPeriodoId`
   (mirroring `DisciplinasService`'s *default*-only logic, independent of any
   override) and runs its own separate `onSnapshot` queries against
   `disciplinas`/`avaliacoes` filtered by that id. This looks like duplication
   of `DisciplinasService`'s query — it is, deliberately, to stay correct while
   an admin is mid-session overriding the shared services for their own turma.
2. **`avaliarProgresso()` is a full reconciliation, not a pure-additive
   grant.** On every run it recomputes *current truth* — which atividades are
   done, which disciplinas are 100% done, what % of the período that is, which
   selos should currently be unlocked — and diffs that against what's already
   recorded (`atividadesBonificadas`/`disciplinasBonificadas`/`selos`),
   **granting what became newly true and revoking (XP and selo) what stopped
   being true.** This was a deliberate reversal of the original "XP never
   decreases" idempotent-only design: a student unchecking an activity they
   completed by mistake now gets that activity's +50 XP taken back, and if that
   activity had been the one closing out a disciplina or the período's 100%,
   that bonus/selo is revoked too (see `SELOS_REVERSIVEIS`). The exception is
   `bem_vindo`/`uma_semana`/`habito_criado` — those reflect *login history*
   (`diasComLogin`, itself a monotonic counter), not currently-computable
   completion state, so they're only ever added, never revoked. This
   reconciliation approach directly replaced an earlier "only ever add, never
   remove" version that had a serious bug — see the "Historical bugs worth
   remembering" callout below.
3. **`MIN_ATIVIDADES_DISCIPLINA` (3) / `MIN_ATIVIDADES_PERIODO` (5)** gate the
   *disciplina_concluida* selo and the *progresso_%* milestones (including the
   100%/+500 XP one) respectively — a disciplina or período needs at least
   that many atividades registered before "concluded" bonuses become eligible
   at all. Without this, since atividades are added gradually by the admin
   throughout the período (see "Admin CRUD conventions"), completing the one
   activity that happens to exist so far would look like "100% do semestre"
   the moment it's created — reported directly by the user testing early in
   the período with a single disciplina/atividade registered. The running %
   progress bar itself (`percentualPeriodo`, shown on the Dashboard) is **not**
   gated by this minimum — only the selo/XP grants are; the bar always shows
   "% of what's currently assigned," which is accurate even with few items.
4. **`registrarEventoXp` / `progresso/{uid}/historico`** — every XP delta
   (positive or negative) is logged as an immutable ledger entry
   (`{data, delta, motivo}`) by `ProgressoService.registrarEventoXp()`, a
   `progresso/{uid}` subcollection (lifetime-scoped like XP itself, **not**
   reset per período like `progresso_periodo` is). `HistoricoService` reads it
   back for the `/historico` page. The same event also drives an ephemeral
   toast (`GamificacaoService.notificacoes`, rendered by `XpToastComponent` in
   `app.ts`, auto-dismissing after 5s) — added specifically so XP grants (and
   reversals) are immediately visible instead of a silent Firestore write,
   which had made a previous bug much harder to notice/diagnose.
   As of 2026-07-31, `registrarEventoXp` also accepts `delta: 0` — used for
   purely informational ledger entries that don't touch the XP counter at all
   (every newly-unlocked selo, and every level crossed — see
   `registrarMudancasDeNivel()`, which diffs `nivelPorXp(xpAntes)` against
   `nivelPorXp(xpDepois)` computed *arithmetically* from the batch's summed
   deltas, never by re-reading the `xp()` signal after an `await`, for the
   same echo-timing reason described in "Historical bugs" below). `/historico`
   renders `delta === 0` entries with a star-badge icon instead of a "+0 XP"
   pill. This means an achievement that also carries XP (e.g. `progresso_100`,
   `disciplina_concluida`) now produces **two** ledger lines — one for the XP
   reason, one for the selo unlock — a deliberate small redundancy in exchange
   for every conquista always being its own visible event, not just folded
   into an XP-reason string.
5. **Reentrancy guards** (`avaliarEmAndamento`/`loginEmAndamento` booleans) skip
   a new invocation while a previous `avaliarProgresso`/`registrarLoginDiario`
   call's writes haven't round-tripped back into `_progressoPeriodo` yet — see
   the "Historical bugs worth remembering" callout for why this matters.

#### Historical bugs worth remembering

Six separate bugs have hit this area in production so far (a runaway-XP
incident that hit ~4.5 million before manual correction, a silent stop to all
future grants, a login-triggered false revoke that went negative, a
`firestore.rules` gap that silently zeroed out gamification for every
non-admin account, a "once per day" check with no trigger to notice a new day
had started, and a cache-vs-server race that silently reset real XP back to
zero) — all now fixed, but the failure modes are worth recognizing if
something here misbehaves again:

- **`setDoc(..., {merge:true})` does not parse dot-notation string keys as
  nested paths** — only `updateDoc` does that. An earlier version wrote selo
  updates as `{'selos.bem_vindo': timestamp}` via `setDoc`+merge, which
  Firestore stored as a **literal top-level field named `"selos.bem_vindo"`**
  (dot included in the actual field name), leaving the real `selos` map
  permanently `{}`. Every `!periodoDoc.selos[id]` guard was therefore always
  `true`, so every selo (and the 500-XP "100% do período" bonus tied to
  `progresso_100`) was re-granted on **every rerun of the effect**, not just
  during races. Fix: pass a genuinely nested object (`{selos: {id: timestamp}}`)
  to `setDoc`+merge — Firestore does deep-merge nested map fields correctly
  when given a real nested object, just not dot-notation strings.
- **A signal that's "new object, same content" still counts as changed.**
  `ProgressoService`'s Firestore listener called `.set({...})` with a fresh
  plain object on every snapshot, including when only `xp` changed — so its
  `concluidas` computed emitted a new array *reference* even though the actual
  completed-ids list hadn't changed. Since `GamificacaoService.avaliarProgresso`
  reads `concluidas()` synchronously (tracked as an effect dependency), writing
  XP triggered a "changed" notification that re-ran the same evaluation before
  the previous grant's `atividadesBonificadas` write had confirmed — regranting
  the same bonus over and over as fast as Firestore's round-trip allowed. Fixed
  by giving `concluidas` a content-based `equal` function. This class of bug
  (derived signal churn from unrelated field changes) is worth checking first
  whenever an effect appears to rerun more often than its actual dependencies
  changed.
- **A guarded-out effect run can silently un-track a signal.** Angular's
  `effect()` only records dependencies for signals actually read *during a
  given run* — if a run hits an early `return` before reaching a read that a
  later branch would have made, that signal drops out of the tracked set
  until some *other* run happens to read it again. `avaliarProgresso`'s
  reentrancy guard (`if (this.avaliarEmAndamento) return;`) sat *before* the
  code path that read `progressoService.concluidas()`, and Firestore's local
  cache echoes a pending write back almost instantly (well before that
  write's own `await` resolves) — so unchecking an activity would often
  guard-skip the echo of its *own* write, permanently dropping `concluidas()`
  from the effect's tracked deps until an unrelated `progresso_periodo`
  change happened to reawaken it. Symptom: uncheck an activity (works),
  recheck it (silently no-ops forever). Fix: read every signal the effect
  cares about **unconditionally, before any early return** — guards may skip
  the *evaluation*, they must never skip the *tracking*.
- **A transient reset placeholder can look like real ground truth to a
  reconciling effect.** `ProgressoService` resets its local signal to
  `{concluidas: [], ultimoDiaXp: null, ...}` on every auth-state change
  (logout *and* login) before the real Firestore snapshot has had a chance to
  reload — normally invisible, but `GamificacaoService`'s reconciliation logic
  treats "not currently concluded" and "haven't logged in today" as real,
  actionable facts. If either evaluation effect ran during that narrow
  pre-reload window (routinely does, right after a login), it would revoke
  real XP for an activity that was actually still complete, and/or double-grant
  the daily login bonus on the same calendar day. Fix: `ProgressoService`
  exposes a `carregado` signal (false until the first real snapshot — or the
  "no doc yet, just created one" case for a brand-new user — has landed for
  the current uid), and both `GamificacaoService` evaluation effects gate on
  it (read unconditionally first, same rule as above). **Any signal that gets
  reset to a "safe-looking" default on logout before being reloaded on the
  next login is a candidate for this same bug** if something downstream
  reconciles against it as ground truth rather than as "not yet known."
- **Referencing `resource.data` in a security rule for a document that might
  not exist yet is an evaluation error, not `false` — and that error can be
  silently absorbed by an unrelated `||` branch.** `progresso_periodo`'s
  `read` rule was `resource.data.uid == request.auth.uid || souAdmin()`. The
  very first time `GamificacaoService` evaluates a given (uid, período) pair,
  the doc doesn't exist yet — `resource` is null, so `resource.data.uid`
  errors. CEL's `||` only survives an error on one side if the *other* side
  evaluates to `true`; for an admin account `souAdmin()` **is** true, so the
  error got masked and reads kept working — for every "aluno" account
  `souAdmin()` is false, so the error propagated and the entire read was
  denied. Practical effect: every student's gamification (XP from logins,
  activities, disciplines — all of it, not just the daily bonus) stayed
  permanently at zero, because `GamificacaoService` could never even get past
  checking "does my progresso_periodo doc exist?" to create it — and this was
  invisible in dev/testing because the developer's own account is an admin,
  which never hit the error path. Fixed by putting
  `!exists(/databases/$(database)/documents/progresso_periodo/$(docId))`
  first in the `||` chain — `exists()` is the sanctioned way to test for a
  document's presence without touching `resource.data`, and once it's `true`
  the rest of the OR short-circuits before ever erroring. **Any rule of the
  shape `resource.data.field == x || someOtherCondition` on a collection
  where documents get created lazily by the client (not pre-seeded) is a
  candidate for this same bug** — reorder so an `exists()`/`!exists()` check
  guards the `resource.data` access, and double-check newly-added rules
  against a **non-admin** test account, since admin-shaped `||` branches
  routinely hide exactly this class of error.
- **Nothing in the app observes "the clock crossed midnight."** The daily
  login-XP effect only reran when one of its *signal* dependencies changed
  (`progresso_periodo` doc, `progressoService.carregado()`) — both of which
  are set once per full page load and then sit still for as long as the tab
  stays open. Firebase Auth sessions persist indefinitely by design (that's
  correct, expected behavior, not a bug), so a user who never closes/reloads
  the tab across a day boundary kept a perfectly valid session with a
  `GamificacaoService` that had already run its one-time check *yesterday*
  and had no reason to run it again — the daily bonus silently stopped
  arriving for exactly the users least likely to notice (the ones who use the
  app enough to leave it open). Fixed 2026-08-03: the login-check logic was
  extracted into `tentarRegistrarLoginDiario()`, still called from the
  reactive `effect()` as before, but *also* called from a `visibilitychange`
  listener (tab regains focus/becomes visible again) registered in the same
  constructor — cheap, no polling interval needed, and safe to call anytime
  since it re-checks `ultimoDiaXp()` before granting anything. **Any
  "once per day" check gated purely on reactive signals (not wall-clock
  time) is a candidate for this same bug** — it needs an independent trigger
  that doesn't require the page to reload to notice a new day has started.
- **A Firestore `onSnapshot`'s first emission can come from local cache and
  say "doesn't exist" even when the document is real on the server** —
  `snap.exists() === false` is not proof of absence, only `snap.exists() ===
  false && !snap.metadata.fromCache` is. `ProgressoService`'s listener on
  `progresso/{uid}` treated any `!snap.exists()` as "brand-new account, seed
  it," calling `criarDocInicial()` — which does `setDoc(..., {xp: 0,
  ultimoDiaXp: null}, {merge: true})`. On a browser/profile whose local
  IndexedDB persistence had never cached that specific document yet (new
  device, cleared site data, or just an unlucky first-snapshot timing), the
  cache-only "not found" fired first and got treated as ground truth — the
  merge write then **clobbered a real, existing, much larger `xp` total back
  to 0** on the server, seconds before the real server snapshot would have
  arrived and proven the doc existed all along. Symptom reported by the user:
  reloading the app "lost" XP that the `historico` ledger still fully
  accounted for (the ledger write only happens inside `registrarEventoXp`/
  `registrarLoginDoDia`, never inside `criarDocInicial`, so the ledger stayed
  correct while the `xp` field itself got reset — comparing the two is what
  exposed this). Fixed by only calling `criarDocInicial()` when `!snap.exists()
  && !snap.metadata.fromCache` — a cache-only negative result now does
  nothing and waits for the next (server) snapshot before deciding.
  **Any code that reacts to "document doesn't exist" from an `onSnapshot`
  callback by creating/overwriting data is a candidate for this same bug** —
  check `snap.metadata.fromCache` before trusting a negative existence result,
  the same way `carregado`/"not yet known" gating is already required
  elsewhere in this file for the analogous "signal hasn't loaded yet" case.

**Recovery tool added alongside these fixes (2026-08-03):** because the
`progresso_periodo` permission bug and the cache-clobber bug above could
independently have reset or suppressed XP for an unknown subset of accounts
before either was caught, `/admin/usuarios` gained a **"Zerar XP de todos"**
button (`UsuariosService.zerarXpDeTodos()`) — a manual, confirmation-gated
action that sets every user's `progresso/{uid}.xp` and the `usuarios/{uid}.xp`
mirror to 0 and appends one `historico` entry per affected user (delta
`-xpAtual`, motivo explaining the reset) so the ledger stays a complete,
honest record rather than silently jumping to zero. It deliberately does
**not** touch `progresso_periodo` (selos, `atividadesBonificadas`,
`disciplinasBonificadas`, `diasComLogin`) — clearing those would make
`avaliarProgresso()`'s next reconciliation re-pay every already-completed
atividade/disciplina from scratch, which would silently undo the reset. This
required loosening `firestore.rules`: `progresso/{uid}` `update` and its
`historico` subcollection's `create` now also allow `souAdmin()` (previously
strictly self-only, "admin só lê") — a deliberate, narrow expansion for this
one administrative correction path, not a general opening.

### Ranking (added 2026-07-31)

`/ranking` (`pages/ranking/ranking.component.ts`, `authGuard` only — every
logged-in user, not just admin) lists every active user of the logged-in
user's own turma sorted by lifetime XP descending, with avatar, nome, current
nível (icon/color/title from `nivelPorXp()`, same catalog the Dashboard's
gamification card uses), and XP total. Top 3 get a trophy badge (gold/silver/
bronze) instead of a plain position number; the logged-in user's own row is
highlighted (reuses the same `bg-green-50` "positive state" convention as
elsewhere, see the theming section above).

**`RankingService` reads `usuarios` (filtered by `turmaId`, sorted client-side
by `xp` — no Firestore `orderBy`, so no composite index needed), not
`progresso`.** This is deliberate: `progresso/{uid}` also holds a student's
personal notes (`notas`) and completed-activity list (`concluidas`), and those
must stay private between classmates — only `progresso/{uid}`'s owner and
admins can read it, unchanged. Instead, `Usuario.xp` (models.ts) is a
denormalized mirror of `progresso/{uid}.xp`, kept in sync by
`ProgressoService.registrarEventoXp()`/`registrarLoginDoDia()` — both now also
`updateDoc` `usuarios/{uid}` with the same `increment(delta)` right after (not
batched/transactional with the `progresso` write; a moment of drift between
the two on a slow connection is an acceptable trade-off for a display-only
ranking, not something any invariant depends on). If you add another XP grant
path, mirror it the same way or the ranking will silently drift stale for that
path. This required broadening the `usuarios/{uid}` **read** rule to same-turma
users (see "Security rules" below) — `RankingService` is only constructed when
`/ranking` loads (not injected eagerly by root `App`), so like
`DisciplinasService`/`UsuariosService` it doesn't need the `logado()`-gated
resubscription pattern described under "Pitfall already hit once" below.

**Backfill gap and its fix.** `usuarios/{uid}.xp` didn't exist before this
feature, so accounts with XP earned pre-2026-07-31 initially showed 0/blank in
the ranking — the mirror only reacted to *new* grants, it never retroactively
copied the existing `progresso/{uid}.xp` total. Two fixes layered on top of
each other: (1) `ProgressoService`'s `onSnapshot` handler now compares the
freshly-loaded `xp` against what it previously held locally and, on any
difference (including the very first load, where the placeholder was 0),
`setDoc`s the absolute value into `usuarios/{uid}.xp` (merge, not increment —
this is reconciliation, not a new grant) — this self-heals **the logged-in
user's own** mirror the moment their session loads, no migration script
needed for them. (2) That still leaves classmates who haven't logged in since
stuck stale, since nobody else's session ever touches their doc — for those,
`UsuariosService.sincronizarXp()` is an admin-only one-time action (button in
`/admin/usuarios`, "Sincronizar XP do Ranking") that reads every user's
`progresso/{uid}.xp` (allowed for admin per the existing read rule) and
corrects `usuarios/{uid}.xp` to match. Both paths write the same field the
same way (absolute `setDoc`/`updateDoc`, never `increment`, when reconciling
against a known-good source) — keep that distinction if you touch either:
reconciliation always sets the true value, only the routine per-grant mirror
uses `increment`.

### Questionário Diário (added 2026-07-31)

A daily bonus-XP quiz, gamification-adjacent but deliberately kept as its own
small feature rather than folded into `GamificacaoService`'s reconciliation
system (which is for atividade/disciplina/período completion tracking — this
is a simple, one-shot, never-revoked grant, closer in shape to the login
bonus than to activity completion).

- `shared/questionario-westminster.ts` — static catalog of 92 questions
  (`QuestaoQuiz[]`: `id`, `capitulo`, `pergunta`, `alternativas` (5, one
  correct), `respostaCorreta`, `explicacao`), generated from a JSON file the
  user supplied. That JSON arrived with corrupted encoding (UTF-8 bytes
  double-decoded through Latin-1, plus a handful of characters that had lost
  a byte entirely — e.g. "Ãxodo" → "Êxodo", a bare "Ã," → "É,", a lone "â" →
  em dash "—" — un-recoverable from the byte pattern alone and fixed by
  reading the intended Portuguese). If this catalog is ever regenerated from
  a fresh source file, don't assume a blind `.encode('latin1').decode('utf8')`
  round-trip is sufficient — verify a sample of entries by eye first.
- `models.ts` `QuestionarioDiarioEstado` (`dia`, `questaoId`, `tentativas`,
  `concluido`, `acertou`) lives as a single field, `Progresso.questionarioDiario`,
  on the existing `progresso/{uid}` document — no new collection, no
  `firestore.rules` change, since that document is already self/admin-only
  read/write.
- `QuizDiarioService` decides whether "today" already has a question assigned
  by checking `questionarioDiario.dia` against today's local date — **not**
  any session/localStorage flag. The very first time in a day that this
  resolves to "no record yet," it picks a random question, persists
  `{dia: hoje, ...}` immediately (so the choice is stable across reloads even
  mid-answer), and opens the modal automatically. Once that record exists for
  today (answered or not), the service never reopens the modal on its own
  again that day — only `abrirModal()` (wired to the Dashboard's "pergunta
  bônus" banner, shown while `disponivelHoje()`) does. This means "primeiro
  acesso do dia" is resolved server-side/per-account, not per-browser-session
  — the same account opened on a second device later the same day sees the
  already-assigned question but does *not* get a second automatic popup.
- Two attempts allowed (`TENTATIVAS_MAX = 2`); a correct answer grants
  `XP_QUESTIONARIO_DIARIO = 30` XP once. Unlike activity/discipline XP, this
  is **never revoked** — there's no "uncheck" action for a quiz answer, so
  `GamificacaoService`'s reconciliation model doesn't apply here.
- `GamificacaoService.registrarXpExtra(delta, motivo)` is a small public
  method added specifically so `QuizDiarioService` (and any future
  XP source outside the reconciliation system) can reuse the same
  ledger-write + toast + level-up-check sequence every other XP grant in the
  app already goes through, instead of duplicating that logic.
- The catalog file is ~100KB — `QuizDiarioService` is injected eagerly by
  root `App` (needs to offer the quiz regardless of which page loads first),
  so it imports `questionario-westminster.ts` with a dynamic `import(...)`
  the first time it's actually needed (existing record found for today, or a
  new one about to be created), not a static top-level import. A static
  import would put the whole catalog in the initial bundle for every user on
  every page load, which blew the `angular.json` initial-bundle budget when
  first tried — confirmed fixed by checking `dashboard`/`ranking`/etc. still
  show as separate lazy chunks and `questionario-westminster` shows as its
  own lazy chunk in `ng build` output.

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
  earlier (like anything injected directly by `App`).** `GamificacaoService`
  is also injected directly by `App` and gets the same protection by a slightly
  different route: its subscriptions are gated on `meuPeriodoId()` being
  non-null, which itself reads `authService.perfil()` — null pre-auth — so it
  naturally never subscribes before the user is authenticated, without needing
  its own explicit `logado()` effect wrapper. If you refactor
  `GamificacaoService`'s gating logic, preserve that property.
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

### Temas visuais (added 2026-07-11)

Each turma can have its own visual theme (`turmas/{turmaId}.temaId`, admin-only —
edited via the "Tema visual" `<select>` in `/admin/turmas`, same form as
nome/ativa). Three themes exist today: `padrao` (the app's original look),
`medieval` (a parchment/illuminated-manuscript reskin), and `moderno` (black +
lime-green, minimalist/editorial — added 2026-07-30, see below). **`moderno`
is the app's default theme** (not `padrao`, despite the name) — `temaPorId()`
falls back to it for pre-login rendering and for any turma with no
`temaId`/an unknown id; new turmas created in `/admin/turmas` also default to
it. No `firestore.rules` change was needed — `temaId` is just another field on
the existing `turmas` document, covered by the existing read/write rules for
that collection.

**Architecture — CSS custom properties, not per-component logic.** All theme
colors/fonts are CSS variables defined in `src/styles.css`: `:root` holds the
`padrao` values, and `[data-tema="medieval"]` overrides them. Every component
that needs a brand color uses `var(--cor-primaria)`, `var(--cor-secundaria)`,
etc. (Tailwind arbitrary-value classes support `var()` directly, e.g.
`bg-[var(--cor-primaria)]`) instead of a hardcoded hex — this was a full sweep
across the app; **never reintroduce a literal hex for primary/secondary/sidebar/
background chrome colors**, always use the CSS variable. The one deliberate
exception: `disciplinas-admin.component.ts`'s color-*picker* default value
(`cor: '#1e3a5f'`, the default color for a *new disciplina*) is unrelated
content data, not UI chrome — don't theme it.

`TemaService` (`services/tema.service.ts`) computes the logged-in user's own
turma's `temaId` (defaulting to `moderno` for no turma/unknown id, via
`temaPorId()`) and writes `data-tema="<id>"` onto `<html>` in an `effect()`.
It's injected eagerly by root `App` (same lightweight pattern as
`GamificacaoService`), and — as of 2026-07-30 — its `tema` property is public
because the header's light/dark toggle button reads `tema.temaAtivo()` and
calls `tema.alternarModo()` directly (previously it existed purely to keep its
effect alive, with no template reading it). Since it derives from
`authService.perfil()` (null pre-auth) rather than owning its own Firestore
subscription, it doesn't need the `logado()`-gated resubscription pattern the
eager pre-auth pitfall requires elsewhere — it naturally resolves to `moderno`
on `/login`/`/cadastro` and updates once the user's profile loads.

**Light/dark mode (added 2026-07-30).** `TemaService` also owns `modo: Signal<'light'|'dark'>`
— a *personal* preference, orthogonal to `temaAtivo` (which is the *turma's*
admin-chosen brand). Unlike everything else theme-related, `modo` is **not**
stored in Firestore — it's read/written to `localStorage` directly (key
`guia-estudos-modo`), since it's a display preference of the browser, not
something that needs to sync across a user's devices. Initial value on first
visit falls back to the OS's `prefers-color-scheme` media query, then to
`'light'`. Applied as `data-modo="<light|dark>"` on `<html>`, alongside
`data-tema`. **Only `[data-tema="moderno"][data-modo="dark"]` has CSS defined**
(`styles.css`) — Padrão and Medieval have no dark-mode override, so toggling
`modo` while one of those is active sets the attribute but changes nothing
visually (harmless, not a bug). The header's toggle button (`app.ts`) is
accordingly only rendered `@if (tema.temaAtivo().id === 'moderno')`. If Padrão
or Medieval ever get their own dark variant, add a matching
`[data-tema="<id>"][data-modo="dark"]` block and drop that `@if` guard.

`src/app/shared/temas-catalogo.ts` is the static catalog (mirrors
`gamificacao-catalogo.ts`'s "catalog in code, per-entity state in DB" split) —
just `{id, nome, descricao}` per theme, used for the admin `<select>` and
`temaPorId()`'s fallback lookup. **To add a new theme**: (1) add an entry here
with a new `id`, (2) add a matching `[data-tema="<id>"] { --cor-...: ...; }`
block in `styles.css` defining the same set of tokens `:root` already has. No
component changes needed — this is the intended "upload a new theme" workflow
for a future theme, done entirely in these two files.

**Superseded (kept for history, see "Sidebar as floating nav-item cards"
below for the current design):** the sidebar used to be one continuous
gradient-filled panel, themed via dedicated tokens (`--cor-sidebar-hover`,
`--cor-sidebar-ativo`, `--cor-sidebar-ativo-borda`, `--cor-sidebar-divisor`)
and a `.sidebar-divisor` class. As of 2026-07-30 the sidebar has no panel
background at all and those tokens/class no longer exist — nav items are
individual cards that reuse the same `.card`/text tokens as the rest of the
app instead of a sidebar-specific palette. `.sidebar-titulo` (applies
`--fonte-titulo`) is the only survivor from that era.

Similarly, **every progress/status/XP bar's outer track div carries a
`.barra-progresso` class** (`.card`/`.badge`-style shared class, not a
per-page one-off) — it's a no-op in `padrao` but gets a gold border in
`medieval` (`[data-tema="medieval"] .barra-progresso`). Any new progress bar
must add this class to its track element or it won't pick up future
bar-specific theme styling.

**Known scope limits, by design for v1**: icons are still FontAwesome
everywhere (no pixel-art assets — the reference image used for `medieval` had
pixel-art icons, but generating those wasn't possible here; if real icon
assets are ever supplied, same pattern as gamification's `public/images/`
badges), and the medieval theme reskins `.card` uniformly rather than giving
each Dashboard stat card its own distinct colored background like the
reference image — recreating that would mean per-component styling instead of
theme tokens, deliberately out of scope for a token-based system.

#### Layout: sidebar as floating nav-item cards (added 2026-07-11, rewritten 2026-07-30)

The app shell (`app.ts`)'s root flex container is **desktop-only** margin: `p-0
gap-0 md:p-6 md:gap-6`. On mobile there's deliberately no margin at all — the
sidebar (as a `fixed` drawer) and the main content both sit flush against the
viewport edges, since the extra breathing room only reads as "modern" on a
wide desktop layout and just eats scarce space on a phone screen. At the `md`
breakpoint the outer padding and the `gap` between the sidebar and the content
area are always kept equal (`p-6`/`gap-6`, both driven off the same Tailwind
spacing step) — this is intentional, not incidental: the margin around the
whole app and the gap between sidebar and content should read as one
consistent spacing unit, not two different ones.

**The `<aside>` itself has no visual identity of its own anymore** — no panel
background, no shadow, no rounded corners (`rounded-none md:rounded-2xl` /
`.sidebar-frame` from the original 2026-07-11 design no longer exist). It's
purely a positioning shell (`fixed` drawer on mobile sliding 0→16rem wide,
`md:relative` on desktop) with `background-color: var(--cor-fundo)` so the
gaps between its contents show plain page canvas, not a colored panel. Inside
it, every section is its own **floating `.card`** (or `.sidebar-link`, see
below) stacked with `gap-3`: a logo card, then nav links, then a "Sair" card
pinned to the bottom via a `flex-1` spacer. This card-per-item look is a
deliberate reversal of the original single-panel sidebar — don't reintroduce
a shared sidebar background/border wrapping multiple items.

**Nav items (`.sidebar-link` in `styles.css`) are not boxed cards** — an
earlier version tried wrapping each link in a bordered/shadowed card like the
logo/Sair blocks and it read as "too many cards." Instead: only the icon sits
in a colored circle (`.sidebar-link-icone`, same visual language as the
Dashboard stat-card icon chips — `var(--cor-card-fundo)` at rest, tinted with
`--cor-primaria` on hover, solid `--cor-primaria` + white icon when
`.active`), and the text label floats next to it with no background of its
own. The row itself gets a faint `--cor-fundo-sutil` pill highlight on
hover/active just to keep the clickable area legible. Follow this same
"icon-in-circle, label outside" pattern for any new icon+label control — the
mobile hamburger button and the light/dark toggle button (see "Light/dark
mode" above) both reuse the literal `.sidebar-link-icone` class for this
reason, not a one-off style.

**User identity moved out of the sidebar into a header, top-right, visible on
every page/breakpoint** (it used to live in the sidebar, under the logo). The
header (`app.ts`, above `<main>`) shows, right-aligned: the light/dark toggle
(Moderno only) and a `routerLink="/perfil"` chip with just the avatar circle
(`bg-white`, `w-11 h-11`) and name/level text floating beside it — no card
wrapper around that chip either, same reasoning as nav items. On mobile the
header's left side additionally shows the hamburger (drawer toggle, styled
via `.sidebar-link-icone` with a permanent `--cor-primaria`/white
override — not the default hover-tinted look, since it's a persistent
control, not a nav item with active/inactive state) and a compact logo+title
lockup (hidden on desktop, where the sidebar's own logo card already shows
it).

**Logo**: no longer an uploaded image (`logo-curso.webp`, now an orphaned
unused file in `public/`) — it's an inline `<svg>` (a simple open-book glyph)
repeated in the sidebar logo card, the mobile header, and the login/cadastro
screens, using `stroke="currentColor"` so it inherits `text-*` color per
context (dark text on light chrome inside the app, white on the login page's
`--cor-primaria` circle backdrop) instead of needing separate light/dark
image assets.

#### Text/subtle-background tokens — dark-card fidelity (added 2026-07-11)

The medieval theme's card *background* went dark (see palette below) to match
a reference image ("Allespresso" coffee-app UI kit — dark canvas, warm gold
accent, cream/gray secondary tones). This is the point where theming stopped
being just "brand accent colors" and had to cover **body text, subtle fills,
and subtle borders too** — every page had `text-slate-800/600/400`,
`bg-slate-50/100/200`, and `border-slate-50/100/200/300` hardcoded everywhere
under the assumption a card is always light. A dark card with unthemed
`text-slate-800` (near-black) would be illegible. Fixed with the same
CSS-variable approach, extended with:

- `--cor-texto-principal` / `--cor-texto-secundario` / `--cor-texto-terciario`
  (were slate-800/700, slate-600/500, slate-400/300/200 respectively — each
  tier merges two adjacent Tailwind shades into one token, a deliberate small
  precision loss that's invisible in practice)
- `--cor-fundo-sutil` / `--cor-fundo-sutil-forte` (were bg-slate-50/100, and
  bg-slate-200)
- `--cor-borda-sutil` / `--cor-borda-media` (were border-slate-50/100, and
  border-slate-200/300)
- `--cor-erro-fundo` / `--cor-erro-texto` (were the repeated `bg-red-50
  text-red-600` / `bg-rose-50 text-rose-600` error-banner pattern used on every
  admin page)

**Any new page must use these tokens instead of a literal `text-slate-*` /
`bg-slate-*` / `border-slate-*` / `bg-red-50 text-red-600`-style utility**, or
it'll be illegible the moment a dark theme's card background is active — this
is now the single most likely way for a new page to silently break theming.

One category of color was deliberately **not** tokenized: semantic
success/danger/warning colors (`text-green-600`, `text-rose-500`,
`text-amber-600`, disciplina/tipo-specific colors already stored as data on
each disciplina/avaliação, etc.) stay as literal Tailwind classes across both
themes. These read fine on both a light and a dark card without adaptation,
and — unlike primary/secondary brand colors — they carry meaning (this
specific green always means "completed") that shouldn't shift with the theme.
The one exception left unthemed by choice: the amber "confirmar importação"
warning box in `progresso.component.ts` keeps its own fully self-contained
amber-800-on-amber-50 styling in both themes — it's a rare, modal-style
confirmation, not a persistent page element, and reads fine either way.

**Second exception, added 2026-07-11**: the "atividade concluída" card/checkbox
fill (`bg-green-50`/`border-green-100`/`border-green-500`/`bg-green-500` —
these 4 exact Tailwind classes are used *only* for this one feature across the
whole app) does get rethemed in Medieval, by explicit user request to reuse
the sidebar's own green rather than a generic success-green. `--cor-sucesso-fundo`/
`-borda-sutil`/`-borda` in `styles.css` hold this — the `padrao` values just
mirror the Tailwind green-50/100/500 hex codes (so it's a visual no-op there),
while the `medieval` values are computed with `color-mix()` directly off
`--cor-sidebar-inicio`, not a separately-chosen hex, so this stays literally
"the sidebar's color" if that gradient ever changes. Applied via 4 global
`[data-tema="medieval"] .bg-green-50 { ... }`-style overrides in `styles.css`
(safe precisely because those class names have no other use anywhere in the
app — confirmed by grep before adding this) rather than editing every
component template. **Don't extend this pattern to `text-green-600`/
`text-green-700`** — those two are shared with the unrelated "Em curso"/"Ativo"
admin badges and the perfil success messages, which should stay literal per
the rule above.

**`app-atividade-card` (added 2026-07-31)**: `shared/atividade-card/atividade-card.component.ts`
is the one shared, presentational rendering of a single avaliação as a full
card (checkbox, "ATIVIDADE" eyebrow + type icon, título, 2-line-clamped
descrição, a neutral points badge, and a bottom metadata row — tipo badge,
disciplina, date/urgency, points again). It replaced three near-identical
copies of this markup that had drifted slightly out of sync across
`dashboard` ("Próximas Entregas"), `avaliacoes` (both the com-data and
sem-data lists), and `disciplina-detalhe` ("Avaliações"). Each page still owns
its own `labelTipo`/`getCorTipo`/`isUrgente`/`isEmBreve`/`getDiasRestantes`
logic (unchanged, deliberately not centralized — only the *rendering* was
duplicated, not this business logic) and just maps its `Avaliacao` into the
component's `AtividadeCardVm` shape via a `paraVm()` method before handing it
to `<app-atividade-card [atividade]="paraVm(av)">`. Two `@Input`s adapt it per
page: `mostrarDisciplina` (false in `disciplina-detalhe`, already scoped to
one disciplina) and `linkDisciplina` (true only in `avaliacoes`, where the
disciplina metadata links to `/disciplinas/:id`). Still uses the same literal
`bg-green-50`/`border-green-100`/`border-green-500`/`bg-green-500` classes
from the exception above for the completed state — don't rename them, the
Medieval/Moderno-dark overrides target those exact class names.
`progresso.component.ts`'s per-disciplina avaliação list is a deliberate
**non**-adopter — it's a compact nested row inside another `.card` (no
border/shadow/padding of its own, smaller text, no points/description
detail), a genuinely different, more compact context, not a 4th copy of the
same card.

**A recurring hazard hit repeatedly while converting dynamic `[class.x]="cond"`
bindings to theme-token classes**: Angular's `[class.foo]` binding syntax
requires `foo` to be a literal, static class-name-shaped attribute suffix —
it cannot be `[class.bg-[var(--cor-primaria)]]`, because the attribute name
itself would contain `(`, `)`, `-`, which Angular's template parser doesn't
accept as part of a property-binding name (this slipped through undetected
in an earlier brand-color pass and had to be swept up here too — the app
still built and ran, just with that one binding silently inert). **The fix is
always to switch to a `[style.property]` binding** (e.g. `[style.background-
color]="cond ? 'var(--cor-primaria)' : 'var(--cor-fundo-sutil)'"`), which
accepts any string value including one containing `var(...)`, parens, etc.,
because the property name (`background-color`) is what's constrained, not the
value. When two `[class.x]` bindings on one element are mutually exclusive
(e.g. green-when-done vs. slate-when-not-done), keep the non-slate one as a
class binding and convert only the slate one to a `null`-when-inactive style
binding — the two compose correctly since a `null` style value never
overrides an active class.

#### The "Allespresso" palette (medieval theme, current values)

`--cor-primaria: #c9873e` (the reference's "Dark Gold" — primary
buttons/links), `--cor-secundaria: #d8cfc4` (its "Pastel Gray"/cream, used for
secondary accents — deliberately *not* another gold tone, for contrast
against primaria), `--cor-fundo: #100e0b` (near-black page canvas),
`--cor-card-fundo: #1c1912` (dark warm-gray cards, one step lighter than the
canvas for elevation), `--cor-card-borda` gold at partial opacity (keeps the
"illuminated manuscript" gold-trim identity from the theme's first version,
even though the reference itself relies on shadow/elevation rather than
colored borders). The sidebar gradient (`--cor-sidebar-inicio/fim`, now used
only for the login/cadastro page background — see "Sidebar as floating
nav-item cards" above) uses a dark teal-black blend evoking the
reference palette's "Japanese Indigo" swatch, even though indigo isn't used as
a major UI accent anywhere else — it seemed better suited to a moody
background gradient than to competing with gold as a second brand color.

### Routing and guards

`app.routes.ts` lazy-loads every page. `authGuard`/`adminGuard`/`guestGuard`
(in `guards/auth.guard.ts`) all `await auth.pronto` first. `/login` and
`/cadastro` are the only routes wrapped in `guestGuard` (redirects away if
already logged in); everything else under `authGuard`, and `/admin/**` additionally
under `adminGuard`. `app.ts` renders either the full sidebar shell or a bare
`<router-outlet>` depending on `auth.logado()` — login/cadastro pages render
full-screen without the shell.

### Form fields — global base-layer conventions (added 2026-07-11)

Two form-field rules are enforced globally in `styles.css`'s `@layer base`,
not per-component, so every current and future page gets them automatically:

- **`label { display: block; }`** — every `<label>` always sits above its
  field, never beside it. Without this, a `<label>` (inline by default)
  followed by an `<input>`/`<select>` that isn't `w-full` (e.g. a fixed
  `md:w-80`) can end up sharing the same line on wide viewports — this is
  exactly what happened to the "Período" selector in `disciplinas-admin`
  before this rule existed. A `<label>` used as an inline button/checkbox
  wrapper (the "Importar backup" label-as-button in `progresso.component.ts`,
  the "Ativa" checkbox label in `turmas-admin.component.ts`) already carries
  its own explicit `flex` class, which wins over this base rule — no per-case
  exception needed.
- **`input:not([type=checkbox]):not([type=radio]):not([type=color]), select,
  textarea { background-color: var(--cor-fundo-sutil); color:
  var(--cor-texto-principal); }`** — every form field gets a themed background
  and an explicitly-set text color by default. Before this, most `<input>`/
  `<textarea>` elements only had a themed *border* class, so on a dark card
  (Medieval) the field's background stayed at the browser's native
  near-white default while the text (inherited `--cor-texto-principal`, light
  cream in Medieval) rendered near-invisible against it. `<select>` had the
  opposite problem even where an explicit `bg-[var(--cor-fundo-sutil)]` class
  *was* already set: its text still rendered black in some browsers, because
  `<select>` doesn't reliably inherit `color` the way other elements do — it
  needs `color` set directly. This base rule fixes both by supplying values
  for whichever of the two properties a given field didn't already set
  explicitly (an explicit `bg-*`/`text-*` class on a specific field still
  wins, same cascade-layer reasoning as `.card`/`.badge`). `color-scheme:
  light` (`:root`) / `color-scheme: dark` (`[data-tema="medieval"]`) was added
  alongside this for the same reason — it nudges native widget chrome (the
  `<select>` dropdown panel, scrollbars) toward a matching palette instead of
  fighting the explicit colors above.

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
`turmaDoPeriodo()`), or the caller is admin; `progresso/{uid}` is created only by
that uid, and updated by that uid **or an admin** (the admin branch was added
2026-08-03 specifically for `/admin/usuarios`'s XP-reset tool — see
"Historical bugs" under Gamificação — it's a narrow correction path, not
general admin write access to student data). `progresso_periodo/{docId}` uses
the same "writable only by its owner" shape for `create`/`update` (no admin
branch there), but since its doc id is a composite (`${uid}_${periodoId}`,
not the uid itself), ownership is checked via a `uid` *field* inside the document
(`resource.data.uid == request.auth.uid`) rather than the path segment. Rules
are not deployed via CI — publish changes manually through the
Firebase Console (Firestore → Rules) or `firebase deploy --only firestore:rules`
(project id lives in `.firebaserc`). **Any `firestore.rules` edit in this repo is
inert until that manual step happens** — a change checked into git alone does
nothing in production, so always call this out explicitly when a task touches
the file (e.g. the `/ranking` read-rule broadening below).

**`usuarios/{uid}` read rule broadened, 2026-07-31**: originally self/admin only;
now also `resource.data.turmaId == minhaTurma()`, so any logged-in student can
read any classmate's `usuarios` doc (needed for `/ranking`, see below). This is
a real widening of what's exposed — the whole document is readable this way,
including `email`/`role`/`ativo`/`codigoConvite`, not just the name/avatar/xp
the UI actually renders (Firestore rules can't mask individual fields on read).
Accepted as reasonable for a small, already-mutually-known class cohort; if
that stops being true, the fix is a separate, deliberately-narrow public-profile
document rather than loosening this rule further. `progresso/{uid}` (which has
personal notes and the completed-activities list) was deliberately **not**
similarly loosened — see the `Usuario.xp` field below for how the ranking gets
XP without that.

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
