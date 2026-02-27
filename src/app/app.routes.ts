import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'horario', loadComponent: () => import('./pages/horario/horario.component').then(m => m.HorarioComponent) },
  { path: 'disciplinas', loadComponent: () => import('./pages/disciplinas/disciplinas.component').then(m => m.DisciplinasComponent) },
  { path: 'disciplinas/:id', loadComponent: () => import('./pages/disciplinas/disciplina-detalhe.component').then(m => m.DisciplinaDetalheComponent) },
  { path: 'avaliacoes', loadComponent: () => import('./pages/avaliacoes/avaliacoes.component').then(m => m.AvaliacoesComponent) },
  { path: 'progresso', loadComponent: () => import('./pages/progresso/progresso.component').then(m => m.ProgressoComponent) },
  { path: '**', redirectTo: 'dashboard' },
];
