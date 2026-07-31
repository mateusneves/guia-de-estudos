import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'cadastro', canActivate: [guestGuard], loadComponent: () => import('./pages/cadastro/cadastro.component').then(m => m.CadastroComponent) },

  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'horario', canActivate: [authGuard], loadComponent: () => import('./pages/horario/horario.component').then(m => m.HorarioComponent) },
  { path: 'disciplinas', canActivate: [authGuard], loadComponent: () => import('./pages/disciplinas/disciplinas.component').then(m => m.DisciplinasComponent) },
  { path: 'disciplinas/:id', canActivate: [authGuard], loadComponent: () => import('./pages/disciplinas/disciplina-detalhe.component').then(m => m.DisciplinaDetalheComponent) },
  { path: 'avaliacoes', canActivate: [authGuard], loadComponent: () => import('./pages/avaliacoes/avaliacoes.component').then(m => m.AvaliacoesComponent) },
  { path: 'progresso', canActivate: [authGuard], loadComponent: () => import('./pages/progresso/progresso.component').then(m => m.ProgressoComponent) },
  { path: 'historico', canActivate: [authGuard], loadComponent: () => import('./pages/historico/historico.component').then(m => m.HistoricoComponent) },
  { path: 'ranking', canActivate: [authGuard], loadComponent: () => import('./pages/ranking/ranking.component').then(m => m.RankingComponent) },
  { path: 'perfil', canActivate: [authGuard], loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent) },

  { path: 'admin/turmas', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin/turmas/turmas-admin.component').then(m => m.TurmasAdminComponent) },
  { path: 'admin/periodos', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin/periodos/periodos-admin.component').then(m => m.PeriodosAdminComponent) },
  { path: 'admin/modulos-horario', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin/modulos/modulos-horario-admin.component').then(m => m.ModulosHorarioAdminComponent) },
  { path: 'admin/usuarios', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin/usuarios/usuarios-admin.component').then(m => m.UsuariosAdminComponent) },
  { path: 'admin/disciplinas', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin/disciplinas/disciplinas-admin.component').then(m => m.DisciplinasAdminComponent) },
  { path: 'admin/atividades', canActivate: [authGuard, adminGuard], loadComponent: () => import('./pages/admin/atividades/atividades-admin.component').then(m => m.AtividadesAdminComponent) },

  { path: '**', redirectTo: 'dashboard' },
];
