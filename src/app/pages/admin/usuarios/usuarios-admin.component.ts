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
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Usuários</h1>
          <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">{{ usuarios.usuarios().length }} usuários cadastrados.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            (click)="sincronizarXp()"
            [disabled]="sincronizando()"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style="background-color: var(--cor-fundo-sutil); color: var(--cor-texto-secundario);"
            title="Corrige o XP exibido no /ranking para usuários que ainda não logaram desde que essa sincronização foi ativada"
          >
            <i class="fa-solid fa-arrows-rotate" [class.fa-spin]="sincronizando()"></i>
            {{ sincronizando() ? 'Sincronizando...' : 'Sincronizar XP do Ranking' }}
          </button>
          <button
            (click)="confirmarZerarXp.set(true)"
            [disabled]="zerandoXp()"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 transition-colors disabled:opacity-50 hover:bg-rose-50"
            style="background-color: var(--cor-fundo-sutil);"
            title="Zera o XP vitalício de todos os usuários e registra isso no histórico de cada um"
          >
            <i class="fa-solid fa-rotate-left" [class.fa-spin]="zerandoXp()"></i>
            {{ zerandoXp() ? 'Zerando...' : 'Zerar XP de todos' }}
          </button>
        </div>
      </div>

      @if (mensagemSincronizacao()) {
        <p class="text-sm text-[var(--cor-texto-secundario)] bg-[var(--cor-fundo-sutil)] rounded-lg px-3 py-2">{{ mensagemSincronizacao() }}</p>
      }

      @if (mensagemZerarXp()) {
        <p class="text-sm text-[var(--cor-texto-secundario)] bg-[var(--cor-fundo-sutil)] rounded-lg px-3 py-2">{{ mensagemZerarXp() }}</p>
      }

      @if (confirmarZerarXp()) {
        <div class="p-4 rounded-lg border border-rose-200 bg-rose-50">
          <p class="text-sm font-semibold text-rose-800 mb-1">Zerar o XP vitalício de TODOS os usuários?</p>
          <p class="text-xs text-rose-700 mb-3">
            Isso zera o XP e o espelho usado pelo Ranking de cada usuário, registrando a correção no
            Histórico de cada um (o extrato antigo continua lá, só ganha uma linha nova). Selos e conquistas já
            desbloqueados não são afetados. Essa ação não pode ser desfeita automaticamente.
          </p>
          <div class="flex gap-2">
            <button
              (click)="zerarXpDeTodos()"
              class="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors"
            >Sim, zerar o XP de todos</button>
            <button
              (click)="confirmarZerarXp.set(false)"
              class="px-3 py-1.5 bg-[var(--cor-fundo-sutil)] border border-[var(--cor-borda-media)] text-[var(--cor-texto-secundario)] rounded-lg text-xs font-medium hover:bg-[var(--cor-fundo-sutil)] transition-colors"
            >Cancelar</button>
          </div>
        </div>
      }

      <!-- Filtro por turma -->
      <div class="flex flex-wrap gap-2">
        <button
          (click)="filtroTurma.set(null)"
          class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          [style.background-color]="filtroTurma() === null ? 'var(--cor-primaria)' : 'var(--cor-fundo-sutil)'"
          [style.color]="filtroTurma() === null ? '#fff' : 'var(--cor-texto-secundario)'"
        >Todas as turmas</button>
        @for (t of turmas.turmas(); track t.id) {
          <button
            (click)="filtroTurma.set(t.id)"
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            [style.background-color]="filtroTurma() === t.id ? 'var(--cor-primaria)' : 'var(--cor-fundo-sutil)'"
            [style.color]="filtroTurma() === t.id ? '#fff' : 'var(--cor-texto-secundario)'"
          >{{ t.nome }}</button>
        }
      </div>

      @if (erro()) {
        <p class="text-sm text-[var(--cor-erro-texto)] bg-[var(--cor-erro-fundo)] rounded-lg px-3 py-2">{{ erro() }}</p>
      }

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-[var(--cor-texto-terciario)] uppercase tracking-wider border-b border-[var(--cor-borda-sutil)]">
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
              <tr class="border-b border-[var(--cor-borda-sutil)] last:border-0" [class.opacity-50]="!u.ativo">
                <td class="py-2 pr-3 font-medium text-[var(--cor-texto-principal)]">{{ u.nome }}</td>
                <td class="py-2 pr-3 text-[var(--cor-texto-secundario)]">{{ u.email }}</td>
                <td class="py-2 pr-3">
                  <select
                    class="border border-[var(--cor-borda-media)] rounded-lg px-2 py-1 text-xs"
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
                    class="border border-[var(--cor-borda-media)] rounded-lg px-2 py-1 text-xs"
                    [value]="u.role"
                    (change)="mudarRole(u, $any($event.target).value)"
                    [disabled]="u.uid === auth.usuario()?.uid"
                  >
                    <option value="aluno">Aluno</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </td>
                <td class="py-2 pr-3">
                  <span
                    class="badge"
                    [class.bg-green-100]="u.ativo"
                    [class.text-green-700]="u.ativo"
                    [style.background-color]="u.ativo ? null : 'var(--cor-fundo-sutil)'"
                    [style.color]="u.ativo ? null : 'var(--cor-texto-secundario)'"
                  >
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
              <tr><td colspan="6" class="py-6 text-center text-[var(--cor-texto-terciario)]">Nenhum usuário encontrado.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <p class="text-xs text-[var(--cor-texto-terciario)]">
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
  sincronizando = signal(false);
  mensagemSincronizacao = signal<string | null>(null);
  confirmarZerarXp = signal(false);
  zerandoXp = signal(false);
  mensagemZerarXp = signal<string | null>(null);

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

  async sincronizarXp(): Promise<void> {
    this.sincronizando.set(true);
    this.mensagemSincronizacao.set(null);
    try {
      const atualizados = await this.usuarios.sincronizarXp();
      this.mensagemSincronizacao.set(
        atualizados > 0
          ? `${atualizados} usuário(s) corrigido(s) — o Ranking já reflete o XP real.`
          : 'Tudo já estava sincronizado.'
      );
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível sincronizar: ${e.message}` : 'Não foi possível sincronizar o XP.');
    } finally {
      this.sincronizando.set(false);
    }
  }

  async zerarXpDeTodos(): Promise<void> {
    this.confirmarZerarXp.set(false);
    this.zerandoXp.set(true);
    this.mensagemZerarXp.set(null);
    try {
      const afetados = await this.usuarios.zerarXpDeTodos();
      this.mensagemZerarXp.set(
        afetados > 0
          ? `XP zerado para ${afetados} usuário(s) — cada um ganhou uma linha no próprio Histórico explicando a correção.`
          : 'Ninguém tinha XP para zerar.'
      );
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível zerar o XP: ${e.message}` : 'Não foi possível zerar o XP.');
    } finally {
      this.zerandoXp.set(false);
    }
  }
}
