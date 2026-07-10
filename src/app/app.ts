import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { TurmasService } from './services/turmas.service';
import { PeriodosService } from './services/periodos.service';
import { avatarUrl } from './shared/avatar';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.logado()) {
      <div class="flex h-screen overflow-hidden bg-[#f8f7f4]">

        <!-- Backdrop mobile -->
        @if (sidebarOpen() && isMobile()) {
          <div
            class="fixed inset-0 z-40 bg-black/50"
            (click)="sidebarOpen.set(false)"
          ></div>
        }

        <!-- Sidebar -->
        <aside
          class="fixed md:relative inset-y-0 left-0 z-50 flex flex-col shrink-0 overflow-hidden transition-all duration-300"
          [style.width]="sidebarOpen() ? '16rem' : '0'"
          style="background: linear-gradient(180deg, #1a2e4a 0%, #0f1e31 100%);"
        >
          <div class="flex flex-col h-full w-64">

            <!-- Logo institucional -->
            <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10 shrink-0">
              <img
                src="logo-curso.webp"
                alt="Logo Seminário"
                class="h-12 w-auto object-contain rounded"
              >
              <div class="min-w-0">
                <p class="text-white font-semibold text-sm leading-tight whitespace-nowrap">Guia de Estudos</p>
                <p class="text-slate-400 text-xs whitespace-nowrap truncate">{{ nomeTurma() }}</p>
              </div>
            </div>

            <!-- Usuário logado -->
            <a routerLink="/perfil" (click)="onNavClick()" class="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0 hover:bg-white/5 transition-colors">
              <img [src]="avatarUrlDe(avatarSeed())" alt="Seu avatar" class="w-11 h-11 rounded-full bg-white/10 shrink-0">
              <div class="min-w-0">
                <p class="text-white text-sm font-medium truncate">{{ auth.perfil()?.nome }}</p>
                <p class="text-slate-400 text-xs truncate">{{ auth.isAdmin() ? 'Administrador' : 'Aluno' }}</p>
              </div>
            </a>

            <!-- Nav -->
            <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              @for (item of navItems; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="active"
                  class="sidebar-link"
                  (click)="onNavClick()"
                >
                  <i [class]="item.icon + ' fa-fw text-base'"></i>
                  <span class="whitespace-nowrap">{{ item.label }}</span>
                </a>
              }

              @if (auth.isAdmin()) {
                <p class="px-3 pt-4 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administração</p>
                @for (item of adminNavItems; track item.path) {
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="active"
                    class="sidebar-link"
                    (click)="onNavClick()"
                  >
                    <i [class]="item.icon + ' fa-fw text-base'"></i>
                    <span class="whitespace-nowrap">{{ item.label }}</span>
                  </a>
                }
              }
            </nav>

            <!-- Footer -->
            <div class="px-5 py-4 border-t border-white/10 shrink-0">
              <button (click)="sair()" class="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
                <i class="fa-solid fa-right-from-bracket text-sm"></i>
                <span>Sair</span>
              </button>
            </div>

          </div>
        </aside>

        <!-- Área principal -->
        <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

          <!-- Top bar (apenas mobile) -->
          <header class="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0"
                  style="background: linear-gradient(180deg, #1a2e4a 0%, #0f1e31 100%);">

            <!-- Botão hamburger -->
            <button
              (click)="toggleSidebar()"
              class="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors shrink-0"
            >
              <i class="fa-solid fa-bars text-lg"></i>
            </button>

            <!-- Logo + título (visível em todos os tamanhos no header) -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <img
                src="logo-curso.webp"
                alt="Logo Seminário"
                class="h-9 w-auto object-contain rounded shrink-0"
              >
              <div class="min-w-0">
                <p class="text-white font-semibold text-sm leading-tight">Guia de Estudos</p>
                <p class="text-slate-400 text-xs hidden sm:block truncate">{{ nomeTurma() }}</p>
              </div>
            </div>

            <button (click)="sair()" title="Sair" class="p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors shrink-0">
              <i class="fa-solid fa-right-from-bracket text-sm"></i>
            </button>
          </header>

          <!-- Conteúdo da página -->
          <main class="flex-1 overflow-y-auto overflow-x-hidden">
            <router-outlet />
          </main>

        </div>
      </div>
    } @else {
      <router-outlet />
    }
  `,
})
export class App {
  auth = inject(AuthService);
  private turmas = inject(TurmasService);
  private periodos = inject(PeriodosService);
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
