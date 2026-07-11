import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PeriodosService } from '../../../services/periodos.service';
import { TurmasService } from '../../../services/turmas.service';
import { AuthService } from '../../../services/auth.service';
import { Periodo } from '../../../models/models';

@Component({
  selector: 'app-periodos-admin',
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Períodos</h1>
        <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">
          Cada período é um semestre letivo de uma turma. Só um período pode estar
          "em curso" por vez — é ele que define as disciplinas/atividades que os alunos veem.
        </p>
      </div>

      <!-- Seletor de turma -->
      <div>
        <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Turma</label>
        <select
          class="mt-1 w-full md:w-72 border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm bg-[var(--cor-fundo-sutil)]"
          [value]="turmaSelecionada()"
          (change)="mudarTurma($any($event.target).value)"
        >
          @for (t of turmas.turmas(); track t.id) {
            <option [value]="t.id">{{ t.nome }}</option>
          }
        </select>
      </div>

      @if (erro()) {
        <p class="text-sm text-[var(--cor-erro-texto)] bg-[var(--cor-erro-fundo)] rounded-lg px-3 py-2">{{ erro() }}</p>
      }

      <!-- Formulário -->
      <div class="card">
        <h2 class="font-semibold text-[var(--cor-texto-principal)] mb-4">{{ editandoId() ? 'Editar período' : 'Novo período' }}</h2>
        <form [formGroup]="form" (ngSubmit)="salvar()" class="grid md:grid-cols-3 gap-3 items-end">
          <div>
            <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Nome</label>
            <input formControlName="nome" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm" placeholder="3º Ano · 1º Semestre 2026">
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Ano/Semestre</label>
            <input formControlName="anoSemestre" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm" placeholder="2026.1">
          </div>
          <div class="flex items-center gap-3">
            <button type="submit" [disabled]="form.invalid || !turmaSelecionada()" class="bg-[var(--cor-primaria)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] disabled:opacity-50">
              {{ editandoId() ? 'Salvar' : 'Criar' }}
            </button>
            @if (editandoId()) {
              <button type="button" (click)="cancelarEdicao()" class="text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-principal)]">Cancelar</button>
            }
          </div>
        </form>
      </div>

      <!-- Lista -->
      <div class="card">
        <div class="space-y-2">
          @for (p of periodosDaTurma(); track p.id) {
            <div class="flex items-center justify-between py-2 border-b border-[var(--cor-borda-sutil)] last:border-0">
              <div>
                <p class="text-sm font-medium text-[var(--cor-texto-principal)]">{{ p.nome }}</p>
                <p class="text-xs text-[var(--cor-texto-terciario)]">{{ p.anoSemestre }}</p>
              </div>
              <div class="flex items-center gap-3 text-sm">
                @if (p.ativo) {
                  <span class="badge bg-green-100 text-green-700">Em curso</span>
                } @else {
                  <button (click)="ativar(p)" class="text-[var(--cor-primaria)] hover:underline">Tornar em curso</button>
                }
                <button (click)="editar(p)" class="text-[var(--cor-primaria)] hover:underline">Editar</button>
                <button (click)="excluir(p)" class="text-red-500 hover:underline">Excluir</button>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-[var(--cor-texto-terciario)]">Nenhum período cadastrado para esta turma.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class PeriodosAdminComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  periodos = inject(PeriodosService);
  turmas = inject(TurmasService);
  private auth = inject(AuthService);

  turmaSelecionada = signal<string>(
    this.route.snapshot.queryParamMap.get('turma') || this.auth.perfil()?.turmaId || ''
  );
  editandoId = signal<string | null>(null);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    anoSemestre: ['', Validators.required],
  });

  periodosDaTurma(): Periodo[] {
    return this.turmaSelecionada() ? this.periodos.porTurma(this.turmaSelecionada()) : [];
  }

  mudarTurma(turmaId: string): void {
    this.turmaSelecionada.set(turmaId);
    this.cancelarEdicao();
  }

  editar(p: Periodo): void {
    this.editandoId.set(p.id);
    this.form.setValue({ nome: p.nome, anoSemestre: p.anoSemestre });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ nome: '', anoSemestre: '' });
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    const turmaId = this.turmaSelecionada();
    if (!turmaId) return;
    this.erro.set(null);
    const v = this.form.getRawValue();

    try {
      const id = this.editandoId();
      if (id) {
        await this.periodos.atualizar(id, v);
      } else {
        // O primeiro período de uma turma já nasce em curso; os seguintes precisam ser ativados manualmente.
        const primeiro = this.periodos.porTurma(turmaId).length === 0;
        await this.periodos.criar({ ...v, turmaId, ativo: primeiro });
      }
      this.cancelarEdicao();
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível salvar: ${e.message}` : 'Não foi possível salvar o período.');
    }
  }

  async ativar(p: Periodo): Promise<void> {
    try {
      await this.periodos.ativar(p.turmaId, p.id);
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível ativar: ${e.message}` : 'Não foi possível ativar o período.');
    }
  }

  async excluir(p: Periodo): Promise<void> {
    if (!confirm(`Excluir o período "${p.nome}"? As disciplinas/atividades vinculadas a ele não serão excluídas automaticamente.`)) return;
    try {
      await this.periodos.excluir(p.id);
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível excluir: ${e.message}` : 'Não foi possível excluir o período.');
    }
  }
}
