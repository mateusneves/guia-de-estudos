import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DisciplinasService } from '../../services/disciplinas.service';
import { ProgressoService } from '../../services/progresso.service';
import { AvisosService } from '../../services/avisos.service';
import { GamificacaoService, XP_POR_ATIVIDADE } from '../../services/gamificacao.service';
import { QuizDiarioService, XP_QUESTIONARIO_DIARIO } from '../../services/quiz-diario.service';
import { Avaliacao } from '../../models/models';
import { AtividadeCardComponent, AtividadeCardVm } from '../../shared/atividade-card/atividade-card.component';

interface AulaDoDia {
  dia: string;
  modulo: string;
  horario: string;
  disciplinaId: string;
  disciplina: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, AtividadeCardComponent],
  template: `
    <div class="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Dashboard</h1>
        <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">Bem-vindo ao seu guia de estudos — {{ nomesDia[diaSemanaAtual] }}</p>
      </div>

      <!-- Aviso novo no quadro -->
      @if (temAvisoNovo()) {
        <a
          routerLink="/avisos"
          class="w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md"
          style="background-color: var(--cor-card-fundo); border-color: var(--cor-borda-sutil);"
        >
          <span class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background-color: var(--cor-primaria);">
            <i class="fa-solid fa-bullhorn text-white"></i>
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-[var(--cor-texto-principal)]">Novo aviso no quadro</span>
            <span class="block text-xs text-[var(--cor-texto-secundario)] mt-0.5 truncate">{{ avisos.avisos()[0].titulo }}</span>
          </span>
          <i class="fa-solid fa-chevron-right text-[var(--cor-texto-terciario)] shrink-0"></i>
        </a>
      }

      <!-- Questionário Diário pendente -->
      @if (quizDiario.disponivelHoje()) {
        <button
          type="button"
          (click)="quizDiario.abrirModal()"
          class="w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md"
          style="background-color: var(--cor-card-fundo); border-color: var(--cor-borda-sutil);"
        >
          <span class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background-color: var(--cor-secundaria);">
            <i class="fa-solid fa-book-bible text-white"></i>
          </span>
          <span class="flex-1 min-w-0">
            <span class="block text-sm font-semibold text-[var(--cor-texto-principal)]">Você tem uma pergunta bônus esperando</span>
            <span class="block text-xs text-[var(--cor-texto-secundario)] mt-0.5">Responda o Questionário Diário e ganhe +{{ xpQuestionario }} XP</span>
          </span>
          <i class="fa-solid fa-chevron-right text-[var(--cor-texto-terciario)] shrink-0"></i>
        </button>
      }

      <!-- Gamificação -->
      <div class="card">
        @if (gamificacao.erro()) {
          <div class="mb-3 px-3 py-2 rounded-lg bg-[var(--cor-erro-fundo)] text-[var(--cor-erro-texto)] text-xs">
            {{ gamificacao.erro() }}
          </div>
        }

        <button
          type="button"
          (click)="gamificacaoExpandida.set(!gamificacaoExpandida())"
          class="w-full flex items-center gap-3 text-left"
        >
          <div
            class="rounded-full flex items-center justify-center shrink-0 transition-all"
            [class.w-24]="gamificacaoExpandida()" [class.h-24]="gamificacaoExpandida()"
            [class.w-10]="!gamificacaoExpandida()" [class.h-10]="!gamificacaoExpandida()"
            [style.background-color]="gamificacao.nivel().cor"
          >
            <i [class]="gamificacao.nivel().icone + ' text-white ' + (gamificacaoExpandida() ? 'text-3xl' : 'text-base')"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-semibold text-[var(--cor-texto-principal)]">{{ gamificacao.nivel().titulo }}</p>
              <p class="text-xs text-[var(--cor-texto-secundario)]">
                {{ gamificacao.xp() }} XP
                @if (gamificacao.proximoNivel(); as prox) {
                  <span> / {{ prox.xpMinimo }} XP</span>
                }
              </p>
            </div>
            <div class="barra-progresso w-full bg-[var(--cor-fundo-sutil)] rounded-full h-2 mt-2">
              <div class="h-2 rounded-full bg-[var(--cor-primaria)] transition-all" [style.width.%]="gamificacao.progressoNivel()"></div>
            </div>
            @if (gamificacao.proximoNivel(); as prox) {
              <p class="text-xs text-[var(--cor-texto-terciario)] mt-1.5 flex items-center gap-1.5">
                <i [class]="prox.icone" [style.color]="prox.cor"></i>
                <span>Próximo nível: <span class="font-medium text-[var(--cor-texto-secundario)]">{{ prox.titulo }}</span> · faltam {{ prox.xpMinimo - gamificacao.xp() }} XP</span>
              </p>
            } @else if (!gamificacaoExpandida()) {
              <p class="text-xs text-[var(--cor-texto-terciario)] mt-1">Nível máximo alcançado — o XP continua contando!</p>
            }
          </div>
          <i class="fa-solid fa-chevron-down text-[var(--cor-texto-terciario)] shrink-0 transition-transform" [class.rotate-180]="gamificacaoExpandida()"></i>
        </button>

        @if (gamificacaoExpandida()) {
          @if (!gamificacao.proximoNivel()) {
            <p class="text-xs text-[var(--cor-texto-terciario)] mt-1">Nível máximo alcançado — o XP continua contando!</p>
          }

          <div class="mt-4">
            <div class="flex justify-between text-xs text-[var(--cor-texto-secundario)] mb-1">
              <span>Progresso do semestre</span>
              <span class="font-semibold text-[var(--cor-texto-principal)]">{{ gamificacao.percentualPeriodo() }}%</span>
            </div>
            <div class="barra-progresso w-full bg-[var(--cor-fundo-sutil)] rounded-full h-2">
              <div class="h-2 rounded-full bg-[var(--cor-primaria)] transition-all" [style.width.%]="gamificacao.percentualPeriodo()"></div>
            </div>
          </div>

          @if (gamificacao.ultimasConquistas().length > 0) {
            <div class="mt-4">
              <p class="text-xs font-medium text-[var(--cor-texto-secundario)] mb-2">Últimas conquistas</p>
              <div class="flex gap-4 flex-wrap">
                @for (selo of gamificacao.ultimasConquistas(); track selo.id) {
                  <div class="flex flex-col items-center gap-1 w-16" [title]="selo.descricao">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" [style.background-color]="selo.cor">
                      <i [class]="selo.icone + ' text-white text-base'"></i>
                    </div>
                    <span class="text-[10px] text-[var(--cor-texto-secundario)] text-center leading-tight">{{ selo.titulo }}</span>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mb-3" style="background-color: color-mix(in srgb, var(--cor-primaria) 12%, transparent);">
            <i class="fa-solid fa-book-open text-[var(--cor-primaria)]"></i>
          </div>
          <p class="text-3xl font-bold text-[var(--cor-texto-principal)]">{{ totalDisciplinas }}</p>
          <p class="text-xs text-[var(--cor-texto-secundario)] mt-1">Disciplinas</p>
        </div>
        <div class="card">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mb-3" style="background-color: color-mix(in srgb, var(--cor-secundaria) 15%, transparent);">
            <i class="fa-solid fa-scroll text-[var(--cor-secundaria)]"></i>
          </div>
          <p class="text-3xl font-bold text-[var(--cor-texto-principal)]">{{ totalAvaliacoes }}</p>
          <p class="text-xs text-[var(--cor-texto-secundario)] mt-1">Avaliações</p>
        </div>
        <div class="card">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-green-100">
            <i class="fa-solid fa-circle-check text-green-600"></i>
          </div>
          <p class="text-3xl font-bold text-[var(--cor-texto-principal)]">{{ totalConcluidas }}</p>
          <p class="text-xs text-[var(--cor-texto-secundario)] mt-1">Concluídas</p>
        </div>
        <div class="card">
          <div class="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-rose-100">
            <i class="fa-solid fa-hourglass-half text-rose-500"></i>
          </div>
          <p class="text-3xl font-bold text-[var(--cor-texto-principal)]">{{ proximasEntregas }}</p>
          <p class="text-xs text-[var(--cor-texto-secundario)] mt-1">Próximos 30 dias</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">

        <!-- Aulas de hoje -->
        <div class="card lg:col-span-1">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-[var(--cor-texto-principal)]">Aulas de Hoje</h2>
            <a routerLink="/horario" class="text-xs text-[var(--cor-primaria)] hover:underline">Ver horário</a>
          </div>
          @if (aulasHoje.length > 0) {
            <div class="space-y-3">
              @for (aula of aulasHoje; track aula.horario) {
                <a
                  [routerLink]="['/disciplinas', aula.disciplinaId]"
                  class="flex items-start gap-3 p-3 rounded-lg bg-[var(--cor-fundo-sutil)] hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <span
                    class="inline-flex items-center justify-center w-7 h-7 rounded-md text-white text-xs font-bold shrink-0"
                    [style.background-color]="getCorDisciplina(aula.disciplinaId)"
                  >{{ aula.modulo }}</span>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-[var(--cor-texto-principal)] leading-snug truncate group-hover:text-[var(--cor-primaria)] transition-colors">{{ getNomeCurto(aula.disciplina) }}</p>
                    <p class="text-xs text-[var(--cor-texto-terciario)] mt-0.5">{{ aula.horario }}</p>
                  </div>
                </a>
              }
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <svg class="w-10 h-10 text-[var(--cor-texto-terciario)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              <p class="text-sm text-[var(--cor-texto-terciario)]">Sem aulas hoje</p>
              <p class="text-xs text-[var(--cor-texto-terciario)]">Aproveite para estudar!</p>
            </div>
          }

          <!-- Próximo dia com aula — sempre o próximo dia da semana (a partir de amanhã) que tem algum horário cadastrado, mesmo que hoje também tenha aulas. -->
          @if (proximoDiaComAula; as prox) {
            <div class="mt-4 pt-4 border-t" style="border-color: var(--cor-borda-sutil);">
              <p class="text-xs font-semibold uppercase tracking-wide text-[var(--cor-texto-terciario)] mb-3">{{ prox.label }}</p>
              <div class="space-y-3">
                @for (aula of prox.aulas; track aula.horario) {
                  <a
                    [routerLink]="['/disciplinas', aula.disciplinaId]"
                    class="flex items-start gap-3 p-3 rounded-lg opacity-80 bg-[var(--cor-fundo-sutil)] hover:shadow-md hover:opacity-100 transition-all cursor-pointer group"
                  >
                    <span
                      class="inline-flex items-center justify-center w-7 h-7 rounded-md text-white text-xs font-bold shrink-0"
                      [style.background-color]="getCorDisciplina(aula.disciplinaId)"
                    >{{ aula.modulo }}</span>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-[var(--cor-texto-principal)] leading-snug truncate group-hover:text-[var(--cor-primaria)] transition-colors">{{ getNomeCurto(aula.disciplina) }}</p>
                      <p class="text-xs text-[var(--cor-texto-terciario)] mt-0.5">{{ aula.horario }}</p>
                    </div>
                  </a>
                }
              </div>
            </div>
          }
        </div>

        <!-- Próximas entregas -->
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-[var(--cor-texto-principal)]">Próximas Entregas</h2>
            <a routerLink="/avaliacoes" class="text-xs text-[var(--cor-primaria)] hover:underline">Ver todas</a>
          </div>
          @if (proximasAvaliacoes.length > 0) {
            <div class="space-y-3">
              @for (av of proximasAvaliacoes; track av.id) {
                <app-atividade-card
                  [atividade]="paraVm(av)"
                  (concluidaChange)="progresso.toggleConcluida(av.id)"
                />
              }
            </div>
          } @else {
            <div class="flex flex-col items-center justify-center py-8 text-center">
              <svg class="w-10 h-10 text-green-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-sm text-[var(--cor-texto-terciario)]">Sem entregas pendentes!</p>
            </div>
          }
        </div>

      </div>

      <!-- Disciplinas grid -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-[var(--cor-texto-principal)]">Disciplinas do Semestre</h2>
          <a routerLink="/disciplinas" class="text-xs text-[var(--cor-primaria)] hover:underline">Ver todas</a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (d of disciplinas; track d.id) {
            <a
              [routerLink]="['/disciplinas', d.id]"
              class="card hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div class="flex items-start gap-3">
                <span
                  class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold shrink-0"
                  [style.background-color]="d.cor"
                >{{ d.codigo.substring(0, 2) }}</span>
                <div class="min-w-0">
                  <p class="text-xs text-[var(--cor-texto-secundario)] font-mono">{{ d.codigo }}</p>
                  <p class="text-sm font-semibold text-[var(--cor-texto-principal)] leading-snug group-hover:text-[var(--cor-primaria)] transition-colors">{{ d.nome }}</p>
                </div>
              </div>
              <div class="mt-3">
                <div class="flex justify-between text-xs text-[var(--cor-texto-terciario)] mb-1">
                  <span>{{ getConcluidas(d.id) }}/{{ d.avaliacoes.length }} tarefas</span>
                  <span>{{ getProgresso(d.id) }}%</span>
                </div>
                <div class="barra-progresso w-full bg-[var(--cor-fundo-sutil)] rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all"
                    [style.width.%]="getProgresso(d.id)"
                    [style.background-color]="d.cor"
                  ></div>
                </div>
              </div>
            </a>
          }
        </div>
      </div>

    </div>
  `,
})
export class DashboardComponent {
  private disciplinasService = inject(DisciplinasService);
  avisos = inject(AvisosService);
  gamificacao = inject(GamificacaoService);
  quizDiario = inject(QuizDiarioService);
  xpQuestionario = XP_QUESTIONARIO_DIARIO;
  gamificacaoExpandida = signal(false);
  get disciplinas() { return this.disciplinasService.disciplinas(); }

  // "Novo" = mais recente do que o último aviso que este usuário já visitou /avisos
  // pra ver (ProgressoService.ultimoAvisoVistoEm, gravado só quando AvisosComponent
  // é aberto) — nunca marcado como visto aqui na Dashboard, só clicando no banner.
  temAvisoNovo = computed(() => {
    const lista = this.avisos.avisos();
    if (lista.length === 0) return false;
    const visto = this.progresso.ultimoAvisoVistoEm();
    return !visto || lista[0].criadoEm > visto;
  });

  nomesDia: Record<string, string> = {
    'Segunda': 'Segunda-feira',
    'Terça': 'Terça-feira',
    'Quarta': 'Quarta-feira',
    'Quinta': 'Quinta-feira',
    'Sexta': 'Sexta-feira',
    'Sábado': 'Sábado',
    'Domingo': 'Domingo',
  };

  diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  get diaSemanaAtual(): string {
    return this.diasSemana[new Date().getDay()];
  }

  // Ordena por módulo (M1, M2, M3...) em vez da ordem "de chegada" das disciplinas —
  // comparação numérica pra "M10" não vir antes de "M2" caso a turma cresça além de M9.
  private ordenarPorModulo(aulas: AulaDoDia[]): AulaDoDia[] {
    return [...aulas].sort((a, b) => a.modulo.localeCompare(b.modulo, undefined, { numeric: true }));
  }

  get aulasHoje(): AulaDoDia[] {
    const aulas = this.disciplinas
      .flatMap(d => d.horarios.map(h => ({ ...h, disciplinaId: d.id, disciplina: d.nomeCompleto })))
      .filter(a => a.dia === this.diaSemanaAtual);
    return this.ordenarPorModulo(aulas);
  }

  // Busca a partir de amanhã (offset 1) o próximo dia da semana com algum horário
  // cadastrado — pode cair de volta no mesmo dia de hoje (offset 7) se esse for o
  // único dia com aula, o que é correto: a próxima ocorrência é semana que vem.
  get proximoDiaComAula(): { dia: string; label: string; aulas: AulaDoDia[] } | null {
    const todasAulas = this.disciplinas
      .flatMap(d => d.horarios.map(h => ({ ...h, disciplinaId: d.id, disciplina: d.nomeCompleto })));
    const hojeIndex = new Date().getDay();
    for (let offset = 1; offset <= 7; offset++) {
      const dia = this.diasSemana[(hojeIndex + offset) % 7];
      const aulas = todasAulas.filter(a => a.dia === dia);
      if (aulas.length > 0) {
        return { dia, label: offset === 1 ? 'Amanhã' : (this.nomesDia[dia] ?? dia), aulas: this.ordenarPorModulo(aulas) };
      }
    }
    return null;
  }

  get totalDisciplinas() {
    return this.disciplinas.length;
  }

  get totalAvaliacoes() {
    return this.disciplinas.reduce((sum, d) => sum + d.avaliacoes.length, 0);
  }

  get totalConcluidas() {
    return this.disciplinas.reduce((sum, d) => sum + d.avaliacoes.filter(a => this.progresso.isConcluida(a.id)).length, 0);
  }

  get proximasEntregas() {
    const em30dias = new Date();
    em30dias.setDate(em30dias.getDate() + 30);
    return this.disciplinas.flatMap(d => d.avaliacoes).filter(a => {
      if (!a.data || this.progresso.isConcluida(a.id)) return false;
      return new Date(a.data) <= em30dias;
    }).length;
  }

  get proximasAvaliacoes(): Avaliacao[] {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return this.disciplinas.flatMap(d => d.avaliacoes)
      .filter(a => a.data && new Date(a.data) >= hoje)
      .sort((a, b) => new Date(a.data!).getTime() - new Date(b.data!).getTime())
      .slice(0, 8);
  }

  constructor(public progresso: ProgressoService) {}

  getNomeDisciplina(id: string): string {
    return this.disciplinas.find(d => d.id === id)?.nome ?? id;
  }

  getCorDisciplina(id: string): string {
    return this.disciplinas.find(d => d.id === id)?.cor ?? '#64748b';
  }

  getNomeCurto(nome: string): string {
    return nome.replace(/^[A-Z0-9]+ - /, '');
  }

  getConcluidas(disciplinaId: string): number {
    const d = this.disciplinas.find(d => d.id === disciplinaId);
    return d?.avaliacoes.filter(a => this.progresso.isConcluida(a.id)).length ?? 0;
  }

  getProgresso(disciplinaId: string): number {
    const d = this.disciplinas.find(d => d.id === disciplinaId);
    if (!d || d.avaliacoes.length === 0) return 0;
    return Math.round((this.getConcluidas(disciplinaId) / d.avaliacoes.length) * 100);
  }

  isUrgente(data: string | null): boolean {
    if (!data) return false;
    const diff = new Date(data).getTime() - new Date().getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }

  getDiasRestantes(data: string | null): string {
    if (!data) return '';
    const diff = new Date(data).getTime() - new Date().getTime();
    if (diff < 0) return 'Vencida';
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (dias === 0) return 'Hoje!';
    if (dias === 1) return 'Amanhã';
    return `em ${dias} dias`;
  }

  labelTipo(tipo: string): string {
    const map: Record<string, string> = {
      prova: 'Prova', trabalho: 'Trabalho', leitura: 'Leitura',
      continuo: 'Contínuo', teste: 'Teste', projeto: 'Projeto',
      declaracao: 'Decl.', tarefa: 'Tarefa', atividade: 'Atividade',
    };
    return map[tipo] ?? (tipo.charAt(0).toUpperCase() + tipo.slice(1));
  }

  getCorTipo(tipo: string): string {
    const map: Record<string, string> = {
      prova: '#dc2626', trabalho: '#2563eb', leitura: '#059669',
      continuo: '#64748b', teste: '#d97706', projeto: '#7c3aed',
      declaracao: '#0891b2', tarefa: '#2563eb', atividade: '#2563eb',
    };
    return map[tipo] ?? '#64748b';
  }

  paraVm(av: Avaliacao): AtividadeCardVm {
    const concluida = this.progresso.isConcluida(av.id);
    return {
      titulo: av.nome || av.descricao,
      descricaoSecundaria: av.nome && av.descricao ? av.descricao : null,
      concluida,
      tipo: av.tipo,
      tipoLabel: this.labelTipo(av.tipo),
      tipoCor: this.getCorTipo(av.tipo),
      pontos: av.pontos,
      xp: XP_POR_ATIVIDADE,
      dataDisplay: av.dataDisplay,
      diasRestantes: av.data ? this.getDiasRestantes(av.data) : null,
      urgencia: this.isUrgente(av.data) ? 'urgente' : 'normal',
      disciplinaId: av.disciplinaId,
      disciplinaNome: this.getNomeDisciplina(av.disciplinaId),
      disciplinaCor: this.getCorDisciplina(av.disciplinaId),
    };
  }
}
