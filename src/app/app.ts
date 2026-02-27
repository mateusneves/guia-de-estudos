import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { SheetsService } from './services/sheets.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
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
              src="/logo-curso.webp"
              alt="Logo Seminário"
              class="h-12 w-auto object-contain rounded"
            >
            <div>
              <p class="text-white font-semibold text-sm leading-tight whitespace-nowrap">Guia de Estudos</p>
              <p class="text-slate-400 text-xs whitespace-nowrap">3º Ano · 1º Semestre 2026</p>
            </div>
          </div>

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
          </nav>

          <!-- Footer -->
          <div class="px-5 py-4 border-t border-white/10 shrink-0 flex items-center justify-between gap-2">
            <p class="text-slate-500 text-xs whitespace-nowrap">Seminário · 2026</p>
            @if (sheets.carregando()) {
              <i class="fa-solid fa-rotate fa-spin text-white/30 text-sm shrink-0"></i>
            } @else if (sheets.erro()) {
              <button (click)="sheets.carregar()" [title]="sheets.erro()!"
                class="text-amber-400 hover:text-amber-300 transition-colors shrink-0">
                <i class="fa-solid fa-triangle-exclamation text-sm"></i>
              </button>
            } @else {
              <button (click)="sheets.carregar()" title="Recarregar dados do Google Sheets"
                class="text-white/30 hover:text-white/70 transition-colors shrink-0">
                <i class="fa-solid fa-rotate text-sm"></i>
              </button>
            }
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
              src="/logo-curso.webp"
              alt="Logo Seminário"
              class="h-9 w-auto object-contain rounded shrink-0"
            >
            <div class="min-w-0">
              <p class="text-white font-semibold text-sm leading-tight">Guia de Estudos</p>
              <p class="text-slate-400 text-xs hidden sm:block truncate">{{ dataHoje }}</p>
            </div>
          </div>

          <!-- Status Google Sheets -->
          @if (sheets.carregando()) {
            <div class="flex items-center gap-1.5 text-xs text-white/50 shrink-0">
              <i class="fa-solid fa-rotate fa-spin text-sm"></i>
              <span class="hidden sm:inline">Atualizando...</span>
            </div>
          } @else if (sheets.erro()) {
            <button
              (click)="sheets.carregar()"
              [title]="sheets.erro()!"
              class="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors shrink-0"
            >
              <i class="fa-solid fa-triangle-exclamation text-sm"></i>
              <span class="hidden sm:inline">Erro · Tentar novamente</span>
            </button>
          } @else {
            <button
              (click)="sheets.carregar()"
              title="Recarregar avaliações do Google Sheets"
              class="p-1.5 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors shrink-0"
            >
              <i class="fa-solid fa-rotate text-sm"></i>
            </button>
          }
        </header>

        <!-- Conteúdo da página -->
        <main class="flex-1 overflow-y-auto overflow-x-hidden">
          <router-outlet />
        </main>

      </div>
    </div>
  `,
})
export class App {
  sheets = inject(SheetsService);

  sidebarOpen = signal(typeof window !== 'undefined' && window.innerWidth >= 768);

  isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  get dataHoje(): string {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  onNavClick(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  navItems: NavItem[] = [
    { path: '/dashboard',   label: 'Dashboard',        icon: 'fa-solid fa-gauge-high' },
    { path: '/horario',     label: 'Horário Semanal',  icon: 'fa-solid fa-calendar-week' },
    { path: '/disciplinas', label: 'Disciplinas',      icon: 'fa-solid fa-book-open' },
    { path: '/avaliacoes',  label: 'Avaliações',       icon: 'fa-solid fa-list-check' },
    { path: '/progresso',   label: 'Progresso',        icon: 'fa-solid fa-chart-line' },
  ];
}
