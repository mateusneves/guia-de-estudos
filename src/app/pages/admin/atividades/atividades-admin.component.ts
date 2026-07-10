import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvaliacoesService } from '../../../services/avaliacoes.service';
import { DisciplinasService } from '../../../services/disciplinas.service';
import { Avaliacao } from '../../../models/models';

@Component({
  selector: 'app-atividades-admin',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-2 text-sm">
        <a routerLink="/admin/disciplinas" class="text-slate-400 hover:text-[#1e3a5f]">Disciplinas</a>
        <span class="text-slate-300">›</span>
        <span class="text-slate-700 font-medium">{{ disciplina()?.nome ?? disciplinaId }}</span>
      </div>

      <div>
        <h1 class="text-2xl font-bold text-slate-800">Atividades</h1>
        <p class="text-slate-500 text-sm mt-1">{{ atividades().length }} atividades cadastradas.</p>
      </div>

      <!-- Formulário -->
      <div class="card">
        <h2 class="font-semibold text-slate-800 mb-4">{{ editandoId() ? 'Editar atividade' : 'Nova atividade' }}</h2>
        <form [formGroup]="form" (ngSubmit)="salvar()" class="space-y-3">
          <div>
            <label class="text-xs font-medium text-slate-600">Descrição</label>
            <textarea formControlName="descricao" rows="2" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"></textarea>
          </div>
          <div class="grid md:grid-cols-3 gap-3">
            <div>
              <label class="text-xs font-medium text-slate-600">Data (deixe vazio se contínua)</label>
              <input type="date" formControlName="data" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600">Se sem data, exibir como</label>
              <input formControlName="dataDisplayManual" placeholder="Ex: Contínuo, Semana de provas" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600">Pontos</label>
              <input type="number" formControlName="pontos" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-600">Tipo</label>
            <select formControlName="tipo" class="mt-1 w-full md:w-56 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="prova">Prova</option>
              <option value="teste">Teste</option>
              <option value="trabalho">Trabalho</option>
              <option value="projeto">Projeto</option>
              <option value="leitura">Leitura</option>
              <option value="declaracao">Declaração</option>
              <option value="continuo">Contínuo</option>
            </select>
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
          @for (a of atividades(); track a.id) {
            <div class="flex items-start justify-between py-2 border-b border-slate-50 last:border-0 gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-800">{{ a.descricao }}</p>
                <p class="text-xs text-slate-400">{{ a.dataDisplay }} · {{ a.pontos }} pts · {{ a.tipo }}</p>
              </div>
              <div class="flex gap-3 text-sm shrink-0">
                <button (click)="editar(a)" class="text-[#1e3a5f] hover:underline">Editar</button>
                <button (click)="excluir(a)" class="text-red-500 hover:underline">Excluir</button>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-slate-400">Nenhuma atividade cadastrada para esta disciplina.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class AtividadesAdminComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private avaliacoesService = inject(AvaliacoesService);
  private disciplinasService = inject(DisciplinasService);

  disciplinaId = this.route.snapshot.paramMap.get('id')!;
  disciplina = computed(() => this.disciplinasService.disciplinas().find(d => d.id === this.disciplinaId));
  atividades = computed(() => this.avaliacoesService.porDisciplina(this.disciplinaId));

  editandoId = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    descricao: ['', Validators.required],
    data: [''],
    dataDisplayManual: [''],
    pontos: [10, [Validators.required, Validators.min(0)]],
    tipo: ['trabalho', Validators.required],
  });

  editar(a: Avaliacao): void {
    this.editandoId.set(a.id);
    this.form.setValue({
      descricao: a.descricao,
      data: a.data ?? '',
      dataDisplayManual: a.data ? '' : a.dataDisplay,
      pontos: a.pontos,
      tipo: a.tipo,
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ descricao: '', data: '', dataDisplayManual: '', pontos: 10, tipo: 'trabalho' });
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const data = v.data || null;
    const dataDisplay = data ? this.formatarData(data) : (v.dataDisplayManual || 'Contínuo');

    const dados = {
      turmaId: this.disciplina()?.turmaId ?? '',
      disciplinaId: this.disciplinaId,
      descricao: v.descricao,
      data,
      dataDisplay,
      pontos: v.pontos,
      tipo: v.tipo,
    };

    const id = this.editandoId();
    if (id) {
      await this.avaliacoesService.atualizar(id, dados);
    } else {
      await this.avaliacoesService.criar(dados);
    }
    this.cancelarEdicao();
  }

  async excluir(a: Avaliacao): Promise<void> {
    if (!confirm(`Excluir a atividade "${a.descricao}"?`)) return;
    await this.avaliacoesService.excluir(a.id);
  }

  private formatarData(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
