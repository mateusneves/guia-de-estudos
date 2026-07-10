import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurmasService } from '../../../services/turmas.service';
import { Turma } from '../../../models/models';

@Component({
  selector: 'app-turmas-admin',
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Turmas</h1>
        <p class="text-slate-500 text-sm mt-1">Gerencie as turmas que usam o sistema.</p>
      </div>

      <!-- Formulário -->
      <div class="card">
        <h2 class="font-semibold text-slate-800 mb-4">{{ editandoId() ? 'Editar turma' : 'Nova turma' }}</h2>
        <form [formGroup]="form" (ngSubmit)="salvar()" class="grid md:grid-cols-3 gap-3 items-end">
          <div class="md:col-span-1">
            <label class="text-xs font-medium text-slate-600">Nome</label>
            <input formControlName="nome" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="3º Ano · 1º Semestre 2026">
          </div>
          <div class="md:col-span-1">
            <label class="text-xs font-medium text-slate-600">Ano/Semestre</label>
            <input formControlName="anoSemestre" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="2026.1">
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" formControlName="ativa"> Ativa
            </label>
            <button type="submit" [disabled]="form.invalid" class="bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2d5a8e] disabled:opacity-50">
              {{ editandoId() ? 'Salvar' : 'Criar' }}
            </button>
            @if (editandoId()) {
              <button type="button" (click)="cancelarEdicao()" class="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
            }
          </div>
        </form>
      </div>

      <!-- Lista -->
      <div class="card">
        <div class="space-y-2">
          @for (t of turmas.turmas(); track t.id) {
            <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <p class="text-sm font-medium text-slate-800">{{ t.nome }}</p>
                <p class="text-xs text-slate-400">{{ t.anoSemestre }} · {{ t.ativa ? 'Ativa' : 'Inativa' }}</p>
              </div>
              <div class="flex gap-3 text-sm">
                <button (click)="editar(t)" class="text-[#1e3a5f] hover:underline">Editar</button>
                <button (click)="excluir(t)" class="text-red-500 hover:underline">Excluir</button>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-slate-400">Nenhuma turma cadastrada ainda.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class TurmasAdminComponent {
  private fb = inject(FormBuilder);
  turmas = inject(TurmasService);

  editandoId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    anoSemestre: ['', Validators.required],
    ativa: [true],
  });

  editar(t: Turma): void {
    this.editandoId.set(t.id);
    this.form.setValue({ nome: t.nome, anoSemestre: t.anoSemestre, ativa: t.ativa });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ nome: '', anoSemestre: '', ativa: true });
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    const dados = this.form.getRawValue();
    const id = this.editandoId();
    if (id) {
      await this.turmas.atualizar(id, dados);
    } else {
      await this.turmas.criar(dados);
    }
    this.cancelarEdicao();
  }

  async excluir(t: Turma): Promise<void> {
    if (!confirm(`Excluir a turma "${t.nome}"? Isso não exclui alunos/disciplinas já vinculados a ela.`)) return;
    await this.turmas.excluir(t.id);
  }
}
