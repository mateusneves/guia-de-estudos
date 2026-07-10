import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModulosHorarioService } from '../../../services/modulos-horario.service';
import { TurmasService } from '../../../services/turmas.service';
import { AuthService } from '../../../services/auth.service';
import { ModuloHorario } from '../../../models/models';

@Component({
  selector: 'app-modulos-horario-admin',
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Módulos de Horário</h1>
        <p class="text-slate-500 text-sm mt-1">
          Cadastre aqui os blocos de horário da turma (ex: "M1" = 07:00 às 08:40).
          Ao criar uma disciplina, você seleciona esses módulos em vez de digitar o horário —
          evita erro de digitação e mantém a grade de horários consistente.
        </p>
      </div>

      <!-- Seletor de turma -->
      <div>
        <label class="text-xs font-medium text-slate-600">Turma</label>
        <select
          class="mt-1 w-full md:w-72 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          [value]="turmaSelecionada()"
          (change)="mudarTurma($any($event.target).value)"
        >
          @for (t of turmas.turmas(); track t.id) {
            <option [value]="t.id">{{ t.nome }}</option>
          }
        </select>
      </div>

      @if (erro()) {
        <p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ erro() }}</p>
      }

      <!-- Formulário -->
      <div class="card">
        <h2 class="font-semibold text-slate-800 mb-4">{{ editandoId() ? 'Editar módulo' : 'Novo módulo' }}</h2>
        <form [formGroup]="form" (ngSubmit)="salvar()" class="grid md:grid-cols-3 gap-3 items-end">
          <div>
            <label class="text-xs font-medium text-slate-600">Código</label>
            <input formControlName="codigo" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="M1">
          </div>
          <div class="md:col-span-2">
            <label class="text-xs font-medium text-slate-600">Horário</label>
            <input formControlName="horario" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="07:00 às 08:40">
          </div>
          <div class="flex items-center gap-3 md:col-span-3">
            <button type="submit" [disabled]="form.invalid || !turmaSelecionada()" class="bg-[#1e3a5f] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#2d5a8e] disabled:opacity-50">
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
          @for (m of modulosDaTurma(); track m.id) {
            <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <span class="font-mono text-sm font-semibold text-slate-800">{{ m.codigo }}</span>
                <span class="text-sm text-slate-500 ml-2">{{ m.horario }}</span>
              </div>
              <div class="flex gap-3 text-sm">
                <button (click)="editar(m)" class="text-[#1e3a5f] hover:underline">Editar</button>
                <button (click)="excluir(m)" class="text-red-500 hover:underline">Excluir</button>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-slate-400">Nenhum módulo cadastrado para esta turma.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class ModulosHorarioAdminComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  modulos = inject(ModulosHorarioService);
  turmas = inject(TurmasService);
  private auth = inject(AuthService);

  turmaSelecionada = signal<string>(
    this.route.snapshot.queryParamMap.get('turma') || this.auth.perfil()?.turmaId || ''
  );
  editandoId = signal<string | null>(null);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    codigo: ['', Validators.required],
    horario: ['', Validators.required],
  });

  modulosDaTurma(): ModuloHorario[] {
    return this.turmaSelecionada() ? this.modulos.porTurma(this.turmaSelecionada()) : [];
  }

  mudarTurma(turmaId: string): void {
    this.turmaSelecionada.set(turmaId);
    this.cancelarEdicao();
  }

  editar(m: ModuloHorario): void {
    this.editandoId.set(m.id);
    this.form.setValue({ codigo: m.codigo, horario: m.horario });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ codigo: '', horario: '' });
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
        await this.modulos.atualizar(id, v);
      } else {
        await this.modulos.criar({ ...v, turmaId });
      }
      this.cancelarEdicao();
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível salvar: ${e.message}` : 'Não foi possível salvar o módulo.');
    }
  }

  async excluir(m: ModuloHorario): Promise<void> {
    if (!confirm(`Excluir o módulo "${m.codigo}"? Disciplinas que já usam esse horário não serão alteradas.`)) return;
    try {
      await this.modulos.excluir(m.id);
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível excluir: ${e.message}` : 'Não foi possível excluir o módulo.');
    }
  }
}
