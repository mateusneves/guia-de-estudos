import { Component, inject, signal } from '@angular/core';
import { UsuariosService } from '../../../services/usuarios.service';
import { TurmasService } from '../../../services/turmas.service';
import { AuthService } from '../../../services/auth.service';
import { Role, Usuario } from '../../../models/models';

@Component({
  selector: 'app-usuarios-admin',
  imports: [],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Usuários</h1>
        <p class="text-slate-500 text-sm mt-1">{{ usuarios.usuarios().length }} usuários cadastrados.</p>
      </div>

      <!-- Filtro por turma -->
      <div class="flex flex-wrap gap-2">
        <button
          (click)="filtroTurma.set(null)"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          [class.bg-[#1e3a5f]]="filtroTurma() === null"
          [class.text-white]="filtroTurma() === null"
          [class.bg-slate-100]="filtroTurma() !== null"
        >Todas as turmas</button>
        @for (t of turmas.turmas(); track t.id) {
          <button
            (click)="filtroTurma.set(t.id)"
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            [class.bg-[#1e3a5f]]="filtroTurma() === t.id"
            [class.text-white]="filtroTurma() === t.id"
            [class.bg-slate-100]="filtroTurma() !== t.id"
          >{{ t.nome }}</button>
        }
      </div>

      @if (erro()) {
        <p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ erro() }}</p>
      }

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <th class="pb-2 pr-3">Nome</th>
              <th class="pb-2 pr-3">E-mail</th>
              <th class="pb-2 pr-3">Turma</th>
              <th class="pb-2 pr-3">Papel</th>
              <th class="pb-2 pr-3">Status</th>
              <th class="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            @for (u of usuariosFiltrados(); track u.uid) {
              <tr class="border-b border-slate-50 last:border-0" [class.opacity-50]="!u.ativo">
                <td class="py-2 pr-3 font-medium text-slate-800">{{ u.nome }}</td>
                <td class="py-2 pr-3 text-slate-500">{{ u.email }}</td>
                <td class="py-2 pr-3">
                  <select
                    class="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    [value]="u.turmaId"
                    (change)="mudarTurma(u, $any($event.target).value)"
                  >
                    @for (t of turmas.turmas(); track t.id) {
                      <option [value]="t.id">{{ t.nome }}</option>
                    }
                  </select>
                </td>
                <td class="py-2 pr-3">
                  <select
                    class="border border-slate-200 rounded-lg px-2 py-1 text-xs"
                    [value]="u.role"
                    (change)="mudarRole(u, $any($event.target).value)"
                    [disabled]="u.uid === auth.usuario()?.uid"
                  >
                    <option value="aluno">Aluno</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </td>
                <td class="py-2 pr-3">
                  <span class="badge" [class.bg-green-100]="u.ativo" [class.text-green-700]="u.ativo" [class.bg-slate-100]="!u.ativo" [class.text-slate-500]="!u.ativo">
                    {{ u.ativo ? 'Ativo' : 'Desativado' }}
                  </span>
                </td>
                <td class="py-2 text-right">
                  <button
                    (click)="toggleAtivo(u)"
                    [disabled]="u.uid === auth.usuario()?.uid"
                    class="text-xs font-medium hover:underline disabled:opacity-30"
                    [class.text-red-500]="u.ativo"
                    [class.text-green-600]="!u.ativo"
                  >{{ u.ativo ? 'Desativar' : 'Reativar' }}</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="py-6 text-center text-slate-400">Nenhum usuário encontrado.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <p class="text-xs text-slate-400">
        "Desativar" impede o login no app sem excluir os dados do aluno. A remoção definitiva da conta de acesso
        precisa ser feita futuramente por uma rotina administrativa (fora do escopo atual do painel).
      </p>
    </div>
  `,
})
export class UsuariosAdminComponent {
  usuarios = inject(UsuariosService);
  turmas = inject(TurmasService);
  auth = inject(AuthService);

  filtroTurma = signal<string | null>(null);
  erro = signal<string | null>(null);

  usuariosFiltrados(): Usuario[] {
    const turmaId = this.filtroTurma();
    const lista = this.usuarios.usuarios();
    return turmaId ? lista.filter(u => u.turmaId === turmaId) : lista;
  }

  async mudarTurma(u: Usuario, turmaId: string): Promise<void> {
    try {
      await this.usuarios.atualizar(u.uid, { turmaId });
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível salvar: ${e.message}` : 'Não foi possível mudar a turma.');
    }
  }

  async mudarRole(u: Usuario, role: Role): Promise<void> {
    try {
      await this.usuarios.atualizar(u.uid, { role });
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível salvar: ${e.message}` : 'Não foi possível mudar o papel.');
    }
  }

  async toggleAtivo(u: Usuario): Promise<void> {
    try {
      await this.usuarios.atualizar(u.uid, { ativo: !u.ativo });
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível salvar: ${e.message}` : 'Não foi possível mudar o status.');
    }
  }
}
