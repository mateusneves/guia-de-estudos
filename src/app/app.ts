import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

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

      <!-- Backdrop mobile (aparece atrás da sidebar quando aberta) -->
      @if (sidebarOpen() && isMobile()) {
        <div
          class="fixed inset-0 z-40 bg-black/50"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Sidebar
           Mobile  : fixed (overlay), não desloca o conteúdo
           Desktop : relative (inline), desloca o conteúdo
           Em ambos, largura 0 ↔ 16rem controla abertura/fechamento
      -->
      <aside
        class="fixed md:relative inset-y-0 left-0 z-50 flex flex-col shrink-0 overflow-hidden transition-all duration-300"
        [style.width]="sidebarOpen() ? '16rem' : '0'"
        style="background: linear-gradient(180deg, #1a2e4a 0%, #0f1e31 100%);"
      >
        <!-- Wrapper interno mantém w-64 fixo; o aside externo clipa via overflow-hidden -->
        <div class="flex flex-col h-full w-64">

          <!-- Logo -->
          <div class="flex items-center gap-3 px-5 py-6 border-b border-white/10 shrink-0">
            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-[#c9a84c]">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
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
                <span class="w-5 h-5 shrink-0" [innerHTML]="item.icon"></span>
                <span class="whitespace-nowrap">{{ item.label }}</span>
              </a>
            }
          </nav>

          <!-- Footer -->
          <div class="px-5 py-4 border-t border-white/10 shrink-0">
            <p class="text-slate-500 text-xs whitespace-nowrap">Seminário · 2026</p>
          </div>

        </div>
      </aside>

      <!-- Área principal — sempre ocupa todo o espaço restante -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">

        <!-- Top bar -->
        <header class="flex items-center gap-4 px-4 md:px-6 py-4 bg-white border-b border-slate-100 shrink-0">
          <button
            (click)="toggleSidebar()"
            class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div class="flex-1 min-w-0">
            <p class="text-slate-500 text-sm truncate">{{ dataHoje }}</p>
          </div>
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
  // Abre por padrão só em desktop
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

  // Fecha o menu ao clicar em um link, mas apenas no mobile
  onNavClick(): void {
    if (this.isMobile()) {
      this.sidebarOpen.set(false);
    }
  }

  navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18"/></svg>`,
    },
    {
      path: '/horario',
      label: 'Horário Semanal',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    },
    {
      path: '/disciplinas',
      label: 'Disciplinas',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
    },
    {
      path: '/avaliacoes',
      label: 'Avaliações',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    },
    {
      path: '/progresso',
      label: 'Progresso',
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    },
  ];
}
