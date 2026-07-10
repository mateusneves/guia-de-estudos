import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DisciplinasService } from '../../../services/disciplinas.service';
import { TurmasService } from '../../../services/turmas.service';
import { AuthService } from '../../../services/auth.service';
import { Disciplina } from '../../../models/models';

@Component({
  selector: 'app-disciplinas-admin',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Disciplinas</h1>
        <p class="text-slate-500 text-sm mt-1">Gerencie as disciplinas de uma turma.</p>
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

      <!-- Formulário -->
      <div class="card">
        <h2 class="font-semibold text-slate-800 mb-4">{{ editandoId() ? 'Editar disciplina' : 'Nova disciplina' }}</h2>
        <form [formGroup]="form" (ngSubmit)="salvar()" class="space-y-4">
          <div class="grid md:grid-cols-4 gap-3">
            <div>
              <label class="text-xs font-medium text-slate-600">Código</label>
              <input formControlName="codigo" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="TP03">
            </div>
            <div class="md:col-span-2">
              <label class="text-xs font-medium text-slate-600">Nome</label>
              <input formControlName="nome" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Aconselhamento 1">
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600">Cor</label>
              <input type="color" formControlName="cor" class="mt-1 w-full border border-slate-200 rounded-lg h-9">
            </div>
          </div>

          <div>
            <label class="text-xs font-medium text-slate-600">Horários (um por linha — Dia | Módulo | Horário)</label>
            <textarea formControlName="horariosTexto" rows="3" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" placeholder="Quinta | M2 | 08:50 às 10:30"></textarea>
          </div>

          <div>
            <label class="text-xs font-medium text-slate-600">Conteúdo programático (um por linha — Unidade | Descrição)</label>
            <textarea formControlName="conteudoTexto" rows="4" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono" placeholder="Unidade 1 | Introdução ao tema"></textarea>
          </div>

          <div>
            <label class="text-xs font-medium text-slate-600">Bibliografia (uma referência por linha)</label>
            <textarea formControlName="bibliografiaTexto" rows="3" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"></textarea>
          </div>

          <div class="flex items-center gap-3">
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
          @for (d of disciplinas.disciplinas(); track d.id) {
            <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold" [style.background-color]="d.cor">{{ d.codigo.substring(0,2) }}</span>
                <div>
                  <p class="text-sm font-medium text-slate-800">{{ d.nome }}</p>
                  <p class="text-xs text-slate-400">{{ d.avaliacoes.length }} atividades</p>
                </div>
              </div>
              <div class="flex gap-3 text-sm">
                <a [routerLink]="['/admin/disciplinas', d.id, 'atividades']" class="text-[#1e3a5f] hover:underline">Atividades</a>
                <button (click)="editar(d)" class="text-[#1e3a5f] hover:underline">Editar</button>
                <button (click)="excluir(d)" class="text-red-500 hover:underline">Excluir</button>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-slate-400">Nenhuma disciplina cadastrada para esta turma.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class DisciplinasAdminComponent {
  private fb = inject(FormBuilder);
  disciplinas = inject(DisciplinasService);
  turmas = inject(TurmasService);
  private auth = inject(AuthService);

  turmaSelecionada = signal<string>('');
  editandoId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    codigo: ['', Validators.required],
    nome: ['', Validators.required],
    cor: ['#1e3a5f', Validators.required],
    horariosTexto: [''],
    conteudoTexto: [''],
    bibliografiaTexto: [''],
  });

  constructor() {
    const inicial = this.auth.perfil()?.turmaId ?? '';
    this.turmaSelecionada.set(inicial);
    this.disciplinas.setTurma(inicial || null);
  }

  mudarTurma(turmaId: string): void {
    this.turmaSelecionada.set(turmaId);
    this.disciplinas.setTurma(turmaId || null);
    this.cancelarEdicao();
  }

  editar(d: Disciplina): void {
    this.editandoId.set(d.id);
    this.form.setValue({
      codigo: d.codigo,
      nome: d.nome,
      cor: d.cor,
      horariosTexto: d.horarios.map(h => `${h.dia} | ${h.modulo} | ${h.horario}`).join('\n'),
      conteudoTexto: d.conteudoProgramatico.map(c => `${c.unidade} | ${c.descricao}`).join('\n'),
      bibliografiaTexto: d.bibliografia.join('\n'),
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ codigo: '', nome: '', cor: '#1e3a5f', horariosTexto: '', conteudoTexto: '', bibliografiaTexto: '' });
  }

  private parseLinhas(texto: string, partes: number): string[][] {
    return texto.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(l => l.split('|').map(p => p.trim()).slice(0, partes));
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    const turmaId = this.turmaSelecionada();
    if (!turmaId) return;
    const v = this.form.getRawValue();

    const dados = {
      turmaId,
      codigo: v.codigo,
      nome: v.nome,
      nomeCompleto: `${v.codigo} - ${v.nome}`,
      cor: v.cor,
      corTexto: '#ffffff',
      horarios: this.parseLinhas(v.horariosTexto, 3).map(([dia, modulo, horario]) => ({ dia, modulo, horario })),
      conteudoProgramatico: this.parseLinhas(v.conteudoTexto, 2).map(([unidade, descricao]) => ({ unidade, descricao })),
      bibliografia: v.bibliografiaTexto.split('\n').map(l => l.trim()).filter(l => l.length > 0),
    };

    const id = this.editandoId();
    if (id) {
      await this.disciplinas.atualizar(id, dados);
    } else {
      await this.disciplinas.criar(dados);
    }
    this.cancelarEdicao();
  }

  async excluir(d: Disciplina): Promise<void> {
    if (!confirm(`Excluir a disciplina "${d.nome}"? As atividades vinculadas a ela não serão excluídas automaticamente.`)) return;
    await this.disciplinas.excluir(d.id);
  }
}
