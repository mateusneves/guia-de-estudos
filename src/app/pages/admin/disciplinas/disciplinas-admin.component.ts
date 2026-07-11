import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DisciplinasService } from '../../../services/disciplinas.service';
import { TurmasService } from '../../../services/turmas.service';
import { PeriodosService } from '../../../services/periodos.service';
import { ModulosHorarioService } from '../../../services/modulos-horario.service';
import { AuthService } from '../../../services/auth.service';
import { AulaHorario, Disciplina, ModuloHorario } from '../../../models/models';

interface LinhaHorario {
  dia: string;
  moduloId: string;
  /** Preenchido quando a disciplina já tinha um horário que não bate com nenhum módulo cadastrado — preserva o valor até ser trocado. */
  legado: ModuloHorario | null;
}

@Component({
  selector: 'app-disciplinas-admin',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Disciplinas</h1>
        <p class="text-slate-500 text-sm mt-1">Gerencie as disciplinas de um período letivo.</p>
      </div>

      <!-- Seletor de período (já traz a turma no rótulo — uma disciplina pertence a um período, não à turma diretamente) -->
      <div>
        <label class="text-xs font-medium text-slate-600">Período</label>
        <select
          class="mt-1 w-full md:w-80 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
          [value]="periodoSelecionado()"
          (change)="mudarPeriodo($any($event.target).value)"
        >
          <option value="" disabled>Selecione um período</option>
          @for (p of periodos.periodos(); track p.id) {
            <option [value]="p.id">{{ turmas.getNome(p.turmaId) }} — {{ p.nome }}{{ p.ativo ? ' (em curso)' : '' }}</option>
          }
        </select>
        @if (periodos.periodos().length === 0) {
          <p class="text-xs text-amber-600 mt-1">
            Nenhum período cadastrado ainda. Crie um em <a routerLink="/admin/periodos" class="underline">Períodos</a>.
          </p>
        }
      </div>

      @if (erro()) {
        <p class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ erro() }}</p>
      }

      @if (periodoSelecionado()) {
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
              <label class="text-xs font-medium text-slate-600">Horários</label>
              <div class="space-y-2 mt-1">
                @for (linha of horariosLinhas(); track $index) {
                  <div class="flex flex-wrap gap-2 items-center">
                    <select
                      class="border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                      [value]="linha.dia"
                      (change)="atualizarLinha($index, 'dia', $any($event.target).value)"
                    >
                      @for (d of diasSemana; track d) {
                        <option [value]="d">{{ d }}</option>
                      }
                    </select>
                    <select
                      class="flex-1 min-w-40 border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                      [value]="linha.moduloId"
                      (change)="atualizarLinha($index, 'moduloId', $any($event.target).value)"
                    >
                      <option value="" disabled>Selecione o módulo</option>
                      @for (m of opcoesModulo(linha); track m.id) {
                        <option [value]="m.id">{{ m.codigo }} — {{ m.horario }}{{ linha.legado?.id === m.id ? ' (não cadastrado)' : '' }}</option>
                      }
                    </select>
                    <button type="button" (click)="removerHorario($index)" class="text-red-500 hover:text-red-600 text-sm px-2">Remover</button>
                  </div>
                } @empty {
                  <p class="text-xs text-slate-400">Nenhum horário definido para esta disciplina.</p>
                }
                <button type="button" (click)="adicionarHorario()" class="text-xs text-[var(--cor-primaria)] hover:underline font-medium">+ Adicionar horário</button>
              </div>
              @if (modulosHorario.porTurma(turmaIdAtual()).length === 0) {
                <p class="text-xs text-amber-600 mt-1">
                  Nenhum módulo cadastrado para esta turma ainda. Cadastre em
                  <a routerLink="/admin/modulos-horario" [queryParams]="{ turma: turmaIdAtual() }" class="underline">Módulos de Horário</a>.
                </p>
              }
            </div>

            <div>
              <label class="text-xs font-medium text-slate-600">Conteúdo programático</label>
              <textarea formControlName="conteudoProgramatico" rows="5" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Descreva o conteúdo programático da disciplina..."></textarea>
            </div>

            <div>
              <label class="text-xs font-medium text-slate-600">Bibliografia (uma referência por linha)</label>
              <textarea formControlName="bibliografiaTexto" rows="3" class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"></textarea>
            </div>

            <div class="flex items-center gap-3">
              <button type="submit" [disabled]="form.invalid" class="bg-[var(--cor-primaria)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] disabled:opacity-50">
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
                  <a [routerLink]="['/admin/atividades']" [queryParams]="{ disciplina: d.id }" class="text-[var(--cor-primaria)] hover:underline">Atividades</a>
                  <button (click)="editar(d)" class="text-[var(--cor-primaria)] hover:underline">Editar</button>
                  <button (click)="excluir(d)" class="text-red-500 hover:underline">Excluir</button>
                </div>
              </div>
            } @empty {
              <p class="text-sm text-slate-400">Nenhuma disciplina cadastrada para este período.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DisciplinasAdminComponent {
  private fb = inject(FormBuilder);
  disciplinas = inject(DisciplinasService);
  turmas = inject(TurmasService);
  periodos = inject(PeriodosService);
  modulosHorario = inject(ModulosHorarioService);
  private auth = inject(AuthService);

  private periodoOverride = signal<string | null>(null);
  /** Sem escolha manual, cai no período em curso da própria turma do admin — some ao carregar os dados, sem truque nenhum. */
  private periodoPadrao = computed(() => {
    const turmaId = this.auth.perfil()?.turmaId;
    return turmaId ? this.periodos.ativoDaTurma(turmaId)?.id ?? '' : '';
  });
  periodoSelecionado = computed(() => this.periodoOverride() ?? this.periodoPadrao());

  editandoId = signal<string | null>(null);
  horariosLinhas = signal<LinhaHorario[]>([]);
  erro = signal<string | null>(null);

  /** A turma é sempre derivada do período selecionado, nunca escolhida diretamente aqui. */
  turmaIdAtual = computed(() => this.periodos.periodos().find(p => p.id === this.periodoSelecionado())?.turmaId ?? '');

  diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  form = this.fb.nonNullable.group({
    codigo: ['', Validators.required],
    nome: ['', Validators.required],
    cor: ['#1e3a5f', Validators.required],
    conteudoProgramatico: [''],
    bibliografiaTexto: [''],
  });

  opcoesModulo(linha: LinhaHorario): ModuloHorario[] {
    const reais = this.modulosHorario.porTurma(this.turmaIdAtual());
    return linha.legado ? [linha.legado, ...reais] : reais;
  }

  mudarPeriodo(periodoId: string): void {
    this.periodoOverride.set(periodoId);
    this.disciplinas.setPeriodo(periodoId || null);
    this.cancelarEdicao();
  }

  adicionarHorario(): void {
    this.horariosLinhas.update(ls => [...ls, { dia: 'Segunda', moduloId: '', legado: null }]);
  }

  removerHorario(indice: number): void {
    this.horariosLinhas.update(ls => ls.filter((_, i) => i !== indice));
  }

  atualizarLinha(indice: number, campo: 'dia' | 'moduloId', valor: string): void {
    this.horariosLinhas.update(ls => ls.map((l, i) => (i === indice ? { ...l, [campo]: valor } : l)));
  }

  editar(d: Disciplina): void {
    this.editandoId.set(d.id);
    this.erro.set(null);
    const modulosReais = this.modulosHorario.porTurma(this.turmaIdAtual());

    this.horariosLinhas.set(d.horarios.map(h => {
      const encontrado = modulosReais.find(m => m.codigo === h.modulo && m.horario === h.horario);
      if (encontrado) return { dia: h.dia, moduloId: encontrado.id, legado: null };

      const legadoId = `legado-${h.modulo}-${h.horario}`;
      return {
        dia: h.dia,
        moduloId: legadoId,
        legado: { id: legadoId, turmaId: this.turmaIdAtual(), codigo: h.modulo, horario: h.horario },
      };
    }));

    this.form.setValue({
      codigo: d.codigo,
      nome: d.nome,
      cor: d.cor,
      conteudoProgramatico: d.conteudoProgramatico,
      bibliografiaTexto: d.bibliografia.join('\n'),
    });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.horariosLinhas.set([]);
    this.form.reset({ codigo: '', nome: '', cor: '#1e3a5f', conteudoProgramatico: '', bibliografiaTexto: '' });
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    const periodoId = this.periodoSelecionado();
    if (!periodoId) return;
    this.erro.set(null);
    const v = this.form.getRawValue();
    const modulosReais = this.modulosHorario.porTurma(this.turmaIdAtual());

    const horarios: AulaHorario[] = this.horariosLinhas()
      .map(l => {
        const m = l.legado && l.legado.id === l.moduloId ? l.legado : modulosReais.find(mm => mm.id === l.moduloId);
        return m ? { dia: l.dia, modulo: m.codigo, horario: m.horario } : null;
      })
      .filter((h): h is AulaHorario => h !== null);

    const dados = {
      periodoId,
      codigo: v.codigo,
      nome: v.nome,
      nomeCompleto: `${v.codigo} - ${v.nome}`,
      cor: v.cor,
      corTexto: '#ffffff',
      horarios,
      conteudoProgramatico: v.conteudoProgramatico,
      bibliografia: v.bibliografiaTexto.split('\n').map(l => l.trim()).filter(l => l.length > 0),
    };

    try {
      const id = this.editandoId();
      if (id) {
        await this.disciplinas.atualizar(id, dados);
      } else {
        await this.disciplinas.criar(dados);
      }
      this.cancelarEdicao();
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível salvar: ${e.message}` : 'Não foi possível salvar a disciplina.');
    }
  }

  async excluir(d: Disciplina): Promise<void> {
    if (!confirm(`Excluir a disciplina "${d.nome}"? As atividades vinculadas a ela não serão excluídas automaticamente.`)) return;
    try {
      await this.disciplinas.excluir(d.id);
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível excluir: ${e.message}` : 'Não foi possível excluir a disciplina.');
    }
  }
}
