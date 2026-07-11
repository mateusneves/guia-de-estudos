import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvaliacoesService } from '../../../services/avaliacoes.service';
import { DisciplinasService } from '../../../services/disciplinas.service';
import { TurmasService } from '../../../services/turmas.service';
import { PeriodosService } from '../../../services/periodos.service';
import { Avaliacao } from '../../../models/models';

@Component({
  selector: 'app-atividades-admin',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Atividades</h1>
        <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">
          Cadastre atividades avaliativas do período em curso e escolha a qual disciplina cada uma pertence.
        </p>
        @if (periodoAtual()) {
          <p class="text-xs text-[var(--cor-texto-terciario)] mt-1">
            Período em curso: <strong>{{ turmas.getNome(periodoAtual()!.turmaId) }} — {{ periodoAtual()!.nome }}</strong>
          </p>
        }
      </div>

      @if (erro()) {
        <p class="text-sm text-[var(--cor-erro-texto)] bg-[var(--cor-erro-fundo)] rounded-lg px-3 py-2">{{ erro() }}</p>
      }

      @if (!periodoAtual()) {
        <p class="text-sm text-amber-600">
          Sua turma ainda não tem um período em curso. Crie e ative um em <a routerLink="/admin/periodos" class="underline">Períodos</a>.
        </p>
      } @else if (disciplinas.disciplinas().length === 0) {
        <p class="text-sm text-amber-600">
          Este período ainda não tem disciplinas cadastradas. Cadastre em Administração → Disciplinas primeiro.
        </p>
      } @else {
        <!-- Formulário -->
        <div class="card">
          <h2 class="font-semibold text-[var(--cor-texto-principal)] mb-4">{{ editandoId() ? 'Editar atividade' : 'Nova atividade' }}</h2>
          <form [formGroup]="form" (ngSubmit)="salvar()" class="space-y-3">
            <div>
              <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Disciplina</label>
              <select formControlName="disciplinaId" class="mt-1 w-full md:w-72 border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm bg-[var(--cor-fundo-sutil)]">
                <option value="" disabled>Selecione a disciplina</option>
                @for (d of disciplinas.disciplinas(); track d.id) {
                  <option [value]="d.id">{{ d.nome }}</option>
                }
              </select>
            </div>
            <div>
              <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Nome da atividade</label>
              <input formControlName="nome" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm" placeholder="Ex: Prova Final">
            </div>
            <div>
              <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Descrição (opcional)</label>
              <textarea formControlName="descricao" rows="2" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm"></textarea>
            </div>
            <div class="grid md:grid-cols-3 gap-3">
              <div>
                <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Data de entrega (deixe vazio se contínua)</label>
                <input type="date" formControlName="data" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm">
              </div>
              <div>
                <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Se sem data, exibir como</label>
                <input formControlName="dataDisplayManual" placeholder="Ex: Contínuo, Semana de provas" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm">
              </div>
              <div>
                <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Valor (pontos)</label>
                <input type="number" formControlName="pontos" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm">
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Categoria</label>
              <select formControlName="tipo" class="mt-1 w-full md:w-56 border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm bg-[var(--cor-fundo-sutil)]">
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
              <button type="submit" [disabled]="form.invalid" class="bg-[var(--cor-primaria)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] disabled:opacity-50">
                {{ editandoId() ? 'Salvar' : 'Criar' }}
              </button>
              @if (editandoId()) {
                <button type="button" (click)="cancelarEdicao()" class="text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-principal)]">Cancelar</button>
              }
            </div>
          </form>
        </div>

        <!-- Filtro por disciplina -->
        <div class="flex flex-wrap gap-2">
          <button
            (click)="filtroDisciplina.set('')"
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            [style.background-color]="filtroDisciplina() === '' ? 'var(--cor-primaria)' : 'var(--cor-fundo-sutil)'"
            [style.color]="filtroDisciplina() === '' ? '#fff' : 'var(--cor-texto-secundario)'"
          >Todas as disciplinas</button>
          @for (d of disciplinas.disciplinas(); track d.id) {
            <button
              (click)="filtroDisciplina.set(d.id)"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              [style.background-color]="filtroDisciplina() === d.id ? 'var(--cor-primaria)' : 'var(--cor-fundo-sutil)'"
              [style.color]="filtroDisciplina() === d.id ? '#fff' : 'var(--cor-texto-secundario)'"
            >{{ d.nome }}</button>
          }
        </div>

        <!-- Lista -->
        <div class="card">
          <div class="space-y-2">
            @for (a of atividadesFiltradas(); track a.id) {
              <div class="flex items-start justify-between py-2 border-b border-[var(--cor-borda-sutil)] last:border-0 gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-[var(--cor-texto-principal)]">{{ a.nome || a.descricao }}</p>
                  <p class="text-xs text-[var(--cor-texto-terciario)]">{{ nomeDisciplina(a.disciplinaId) }} · {{ a.dataDisplay }} · {{ a.pontos }} pts · {{ a.tipo }}</p>
                </div>
                <div class="flex gap-3 text-sm shrink-0">
                  <button (click)="editar(a)" class="text-[var(--cor-primaria)] hover:underline">Editar</button>
                  <button (click)="excluir(a)" class="text-red-500 hover:underline">Excluir</button>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-[var(--cor-texto-terciario)]">Nenhuma atividade cadastrada.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AtividadesAdminComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  avaliacoesService = inject(AvaliacoesService);
  disciplinas = inject(DisciplinasService);
  turmas = inject(TurmasService);
  periodos = inject(PeriodosService);

  /** Uma atividade só pode ser cadastrada no período em curso da turma — sem seletor manual de período aqui. */
  periodoAtual = computed(() => this.periodos.periodos().find(p => p.id === this.disciplinas.periodoId()));

  filtroDisciplina = signal<string>('');
  editandoId = signal<string | null>(null);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    disciplinaId: ['', Validators.required],
    nome: ['', Validators.required],
    descricao: [''],
    data: [''],
    dataDisplayManual: [''],
    pontos: [10, [Validators.required, Validators.min(0)]],
    tipo: ['trabalho', Validators.required],
  });

  constructor() {
    const disciplinaQuery = this.route.snapshot.queryParamMap.get('disciplina');
    if (disciplinaQuery) {
      this.filtroDisciplina.set(disciplinaQuery);
      this.form.patchValue({ disciplinaId: disciplinaQuery });
    }
  }

  nomeDisciplina(id: string): string {
    return this.disciplinas.disciplinas().find(d => d.id === id)?.nome ?? id;
  }

  atividadesFiltradas(): Avaliacao[] {
    const disciplinaId = this.filtroDisciplina();
    const todas = this.avaliacoesService.avaliacoes();
    return disciplinaId ? todas.filter(a => a.disciplinaId === disciplinaId) : todas;
  }

  editar(a: Avaliacao): void {
    this.editandoId.set(a.id);
    this.erro.set(null);
    this.form.setValue({
      disciplinaId: a.disciplinaId,
      nome: a.nome || a.descricao,
      descricao: a.nome ? a.descricao : '',
      data: a.data ?? '',
      dataDisplayManual: a.data ? '' : a.dataDisplay,
      pontos: a.pontos,
      tipo: a.tipo,
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ disciplinaId: '', nome: '', descricao: '', data: '', dataDisplayManual: '', pontos: 10, tipo: 'trabalho' });
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    const periodoId = this.disciplinas.periodoId();
    if (!periodoId) return;
    this.erro.set(null);
    const v = this.form.getRawValue();
    const data = v.data || null;
    const dataDisplay = data ? this.formatarData(data) : (v.dataDisplayManual || 'Contínuo');

    const dados = {
      periodoId,
      disciplinaId: v.disciplinaId,
      nome: v.nome,
      descricao: v.descricao,
      data,
      dataDisplay,
      pontos: v.pontos,
      tipo: v.tipo,
    };

    try {
      const id = this.editandoId();
      if (id) {
        await this.avaliacoesService.atualizar(id, dados);
      } else {
        await this.avaliacoesService.criar(dados);
      }
      this.cancelarEdicao();
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível salvar: ${e.message}` : 'Não foi possível salvar a atividade.');
    }
  }

  async excluir(a: Avaliacao): Promise<void> {
    if (!confirm(`Excluir a atividade "${a.nome || a.descricao}"?`)) return;
    try {
      await this.avaliacoesService.excluir(a.id);
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível excluir: ${e.message}` : 'Não foi possível excluir a atividade.');
    }
  }

  private formatarData(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
}
