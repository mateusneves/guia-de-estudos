import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { TurmasService } from './services/turmas.service';
import { PeriodosService } from './services/periodos.service';
import { GamificacaoService } from './services/gamificacao.service';
import { TemaService } from './services/tema.service';
import { XpToastComponent } from './shared/xp-toast/xp-toast.component';
import { avatarUrl } from './shared/avatar';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, XpToastComponent],
  template: `
    @if (auth.logado()) {
      <div class="flex h-screen overflow-hidden bg-[var(--cor-fundo)] p-0 gap-0 md:p-6 md:gap-6">

        <!-- Backdrop mobile -->
        @if (sidebarOpen() && isMobile()) {
          <div
            class="fixed inset-0 z-40 bg-black/50"
            (click)="sidebarOpen.set(false)"
          ></div>
        }

        <!-- Sidebar: sem painel de fundo próprio. Logo e "Sair" continuam cards
             flutuantes; os itens de navegação NÃO são mais caixas com borda/sombra —
             só o ícone fica dentro de um círculo colorido, o texto do rótulo fica ao
             lado, fora de qualquer card (ver .sidebar-link/.sidebar-link-icone).
             Sem scroll interno de propósito: a coluna cresce naturalmente e conta
             com a altura generosa do <aside> (h-screen) para caber sem cortar nem
             rolar — ver .sidebar-link mais compacto em styles.css. -->
        <aside
          class="fixed md:relative inset-y-0 left-0 z-50 flex flex-col shrink-0 overflow-hidden transition-all duration-300"
          [style.width]="sidebarOpen() ? '16rem' : '0'"
          style="background-color: var(--cor-fundo);"
        >
          <div class="flex flex-col gap-3 h-full w-64 shrink-0 p-3">

            <!-- Logo institucional — sem card ao redor, só ícone + texto soltos -->
            <div class="flex items-center gap-3 shrink-0 px-2 py-2">
              <svg viewBox="0 0 32 32" fill="none" class="h-10 w-10 shrink-0 text-[var(--cor-texto-principal)]">
                <path d="M13 9H28C28 9 29 9 29 10V30C29 30 29 31 28 31H4C4 31 3 31 3 30V5M3 5C3 1 7 1 7 1H29M3 5C3 9 7 9 7 9M7 5V17L10 15L13 17V5H27" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="min-w-0">
                <p class="sidebar-titulo font-semibold text-base leading-tight whitespace-nowrap text-[var(--cor-texto-principal)]">Guia de Estudos</p>
                <p class="text-[var(--cor-texto-terciario)] text-xs whitespace-nowrap truncate">{{ nomeTurma() }}</p>
              </div>
            </div>

            <!-- Nav — ícone em círculo, rótulo fora do card -->
            <nav class="flex flex-col gap-1 shrink-0">
              @for (item of navItems; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="active"
                  class="sidebar-link"
                  (click)="onNavClick()"
                >
                  <span class="sidebar-link-icone"><i [class]="item.icon + ' fa-fw text-sm'"></i></span>
                  <span class="whitespace-nowrap">{{ item.label }}</span>
                </a>
              }
            </nav>

            @if (auth.isAdmin()) {
              <p class="sidebar-titulo px-2 text-xs font-semibold text-[var(--cor-texto-terciario)] uppercase tracking-wider shrink-0">Administração</p>
              <nav class="flex flex-col gap-1 shrink-0">
                @for (item of adminNavItems; track item.path) {
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="active"
                    class="sidebar-link"
                    (click)="onNavClick()"
                  >
                    <span class="sidebar-link-icone"><i [class]="item.icon + ' fa-fw text-sm'"></i></span>
                    <span class="whitespace-nowrap">{{ item.label }}</span>
                  </a>
                }
              </nav>
            }

            <div class="flex-1"></div>

            <!-- Sair -->
            <div class="card !p-3 shrink-0">
              <button (click)="sair()" class="w-full flex items-center justify-center gap-2 text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-principal)] transition-colors text-sm">
                <i class="fa-solid fa-right-from-bracket text-sm"></i>
                <span>Sair</span>
              </button>
            </div>

          </div>
        </aside>

        <!-- Área principal -->
        <div class="flex flex-col flex-1 min-w-0 overflow-hidden gap-4">

          <!-- Top bar — hamburger + logo só no mobile (a sidebar vira gaveta); o
               cartão de identidade do usuário fica sempre à direita, em todos os
               tamanhos (antes vivia dentro da sidebar). -->
          <header class="flex items-center gap-3 shrink-0 px-4 pt-4 md:px-0 md:pt-0">
            <button
              (click)="toggleSidebar()"
              class="sidebar-link-icone md:hidden"
              style="background-color: var(--cor-primaria); color: #fff;"
            >
              <i class="fa-solid fa-bars"></i>
            </button>

            <div class="flex items-center gap-2 md:hidden min-w-0 flex-1">
              <svg viewBox="0 0 32 32" fill="none" class="h-8 w-8 shrink-0 text-[var(--cor-texto-principal)]">
                <path d="M13 9H28C28 9 29 9 29 10V30C29 30 29 31 28 31H4C4 31 3 31 3 30V5M3 5C3 1 7 1 7 1H29M3 5C3 9 7 9 7 9M7 5V17L10 15L13 17V5H27" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p class="sidebar-titulo font-semibold text-sm leading-tight text-[var(--cor-texto-principal)] truncate">Guia de Estudos</p>
            </div>

            <div class="hidden md:block flex-1"></div>

            <!-- Alternar modo claro/escuro — preferência pessoal do usuário (não da
                 turma), só tem efeito visual no tema Moderno hoje (ver TemaService). -->
            @if (tema.temaAtivo().id === 'moderno') {
              <button
                (click)="tema.alternarModo()"
                class="sidebar-link-icone shrink-0"
                [title]="tema.modo() === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'"
              >
                <i [class]="tema.modo() === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'"></i>
              </button>
            }

            <a routerLink="/perfil" (click)="onNavClick()" class="flex items-center gap-3 shrink-0 rounded-full px-2 py-1.5 transition-colors hover:bg-[var(--cor-fundo-sutil)]">
              <img [src]="avatarUrlDe(avatarSeed(), !!auth.perfil()?.avatarComBarba)" alt="Seu avatar" class="w-11 h-11 rounded-full bg-white shrink-0">
              <div class="hidden sm:block min-w-0 text-left">
                <p class="text-sm font-medium text-[var(--cor-texto-principal)] truncate leading-tight">{{ auth.perfil()?.nome }}</p>
                <p class="text-xs text-[var(--cor-texto-secundario)] truncate leading-tight mt-0.5">{{ gamificacao.nivel().titulo }}</p>
              </div>
            </a>
          </header>

          <!-- Conteúdo da página -->
          <main class="flex-1 overflow-y-auto overflow-x-hidden">
            <router-outlet />
          </main>

        </div>
      </div>
      <app-xp-toast />
    } @else {
      <router-outlet />
    }
  `,
})
export class App {
  auth = inject(AuthService);
  private turmas = inject(TurmasService);
  private periodos = inject(PeriodosService);
  // Injetado aqui (não só na Dashboard) pra ficar ativo em segundo plano — precisa
  // reagir a conclusões de atividade mesmo quando o aluno está em outra tela.
  // Público porque a sidebar também mostra nível/XP ao lado do avatar.
  gamificacao = inject(GamificacaoService);
  // Roda os effects que aplicam data-tema/data-modo em <html>; público porque o botão
  // de alternar modo claro/escuro no cabeçalho lê/chama tema.modo()/alternarModo().
  tema = inject(TemaService);
  private router = inject(Router);

  avatarUrlDe = avatarUrl;

  sidebarOpen = signal(typeof window !== 'undefined' && window.innerWidth >= 768);

  isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  avatarSeed(): string {
    return this.auth.perfil()?.avatarSeed || this.auth.usuario()?.uid || '';
  }

  nomeTurma(): string {
    const turmaId = this.auth.perfil()?.turmaId;
    if (!turmaId) return '';
    const turma = this.turmas.getNome(turmaId) || 'Turma';
    const periodo = this.periodos.ativoDaTurma(turmaId)?.nome;
    return periodo ? `${turma} · ${periodo}` : turma;
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  onNavClick(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  async sair(): Promise<void> {
    await this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  navItems: NavItem[] = [
    { path: '/dashboard',   label: 'Dashboard',        icon: 'fa-solid fa-gauge-high' },
    { path: '/horario',     label: 'Horário Semanal',  icon: 'fa-solid fa-calendar-week' },
    { path: '/disciplinas', label: 'Disciplinas',      icon: 'fa-solid fa-book-open' },
    { path: '/avaliacoes',  label: 'Atividades',       icon: 'fa-solid fa-list-check' },
    { path: '/progresso',   label: 'Progresso',        icon: 'fa-solid fa-chart-line' },
    { path: '/historico',   label: 'Histórico de XP',  icon: 'fa-solid fa-clock-rotate-left' },
    { path: '/ranking',     label: 'Ranking',          icon: 'fa-solid fa-ranking-star' },
  ];

  adminNavItems: NavItem[] = [
    { path: '/admin/turmas',          label: 'Turmas',            icon: 'fa-solid fa-people-group' },
    { path: '/admin/periodos',        label: 'Períodos',          icon: 'fa-solid fa-calendar-days' },
    { path: '/admin/modulos-horario', label: 'Módulos de Horário', icon: 'fa-solid fa-clock' },
    { path: '/admin/usuarios',        label: 'Usuários',           icon: 'fa-solid fa-users' },
    { path: '/admin/disciplinas',     label: 'Disciplinas',        icon: 'fa-solid fa-book' },
    { path: '/admin/atividades',      label: 'Atividades',        icon: 'fa-solid fa-list-check' },
  ];
}
