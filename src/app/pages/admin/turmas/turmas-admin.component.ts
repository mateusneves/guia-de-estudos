import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TurmasService } from '../../../services/turmas.service';
import { ConvitesService } from '../../../services/convites.service';
import { Turma } from '../../../models/models';
import { TEMAS, temaPorId } from '../../../shared/temas-catalogo';

@Component({
  selector: 'app-turmas-admin',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Turmas</h1>
        <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">
          O grupo de alunos que entrou junto — persiste por todo o curso. Os semestres de cada
          turma são gerenciados em <a routerLink="/admin/periodos" class="text-[var(--cor-primaria)] hover:underline">Períodos</a>.
        </p>
      </div>

      @if (erro()) {
        <p class="text-sm text-[var(--cor-erro-texto)] bg-[var(--cor-erro-fundo)] rounded-lg px-3 py-2">{{ erro() }}</p>
      }

      <!-- Formulário -->
      <div class="card">
        <h2 class="font-semibold text-[var(--cor-texto-principal)] mb-4">{{ editandoId() ? 'Editar turma' : 'Nova turma' }}</h2>
        <form [formGroup]="form" (ngSubmit)="salvar()" class="flex flex-wrap gap-3 items-end">
          <div class="flex-1 min-w-48">
            <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Nome</label>
            <input formControlName="nome" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm" placeholder="Turma Seminário">
          </div>
          <div class="min-w-40">
            <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Tema visual</label>
            <select formControlName="tema" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm">
              @for (t of temas; track t.id) {
                <option [value]="t.id">{{ t.nome }}</option>
              }
            </select>
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-[var(--cor-texto-secundario)]">
              <input type="checkbox" formControlName="ativa"> Ativa
            </label>
            <button type="submit" [disabled]="form.invalid" class="bg-[var(--cor-primaria)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] disabled:opacity-50">
              {{ editandoId() ? 'Salvar' : 'Criar' }}
            </button>
            @if (editandoId()) {
              <button type="button" (click)="cancelarEdicao()" class="text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-principal)]">Cancelar</button>
            }
          </div>
        </form>
        <p class="text-xs text-[var(--cor-texto-terciario)] mt-2">{{ temaSelecionadoDescricao() }}</p>
      </div>

      <!-- Lista -->
      <div class="card">
        <div class="space-y-4">
          @for (t of turmas.turmas(); track t.id) {
            <div class="py-3 border-b border-[var(--cor-borda-sutil)] last:border-0">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-[var(--cor-texto-principal)]">{{ t.nome }}</p>
                  <p class="text-xs text-[var(--cor-texto-terciario)]">{{ t.ativa ? 'Ativa' : 'Inativa' }} · Tema: {{ nomeTema(t) }}</p>
                </div>
                <div class="flex gap-3 text-sm">
                  <a [routerLink]="['/admin/periodos']" [queryParams]="{ turma: t.id }" class="text-[var(--cor-primaria)] hover:underline">Períodos</a>
                  <a [routerLink]="['/admin/modulos-horario']" [queryParams]="{ turma: t.id }" class="text-[var(--cor-primaria)] hover:underline">Módulos</a>
                  <button (click)="editar(t)" class="text-[var(--cor-primaria)] hover:underline">Editar</button>
                  <button (click)="excluir(t)" class="text-red-500 hover:underline">Excluir</button>
                </div>
              </div>

              <!-- Convite de cadastro -->
              <div class="mt-3 bg-[var(--cor-fundo-sutil)] rounded-lg p-3">
                @if (t.conviteToken) {
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-medium text-[var(--cor-texto-secundario)] shrink-0">Link de convite:</span>
                    <input readonly [value]="linkConvite(t)" class="flex-1 min-w-48 text-xs bg-[var(--cor-fundo-sutil)] border border-[var(--cor-borda-media)] rounded px-2 py-1 font-mono">
                    <button (click)="copiar(t.id, 'link', linkConvite(t))" class="text-xs text-[var(--cor-primaria)] hover:underline shrink-0">
                      {{ copiado() === t.id + 'link' ? 'Copiado!' : 'Copiar' }}
                    </button>
                  </div>
                  <div class="flex flex-wrap items-center gap-2 mt-2">
                    <span class="text-xs font-medium text-[var(--cor-texto-secundario)] shrink-0">Código de autorização:</span>
                    <span class="text-sm font-mono font-semibold text-[var(--cor-texto-principal)]">{{ t.codigoConvite }}</span>
                    <button (click)="copiar(t.id, 'codigo', t.codigoConvite!)" class="text-xs text-[var(--cor-primaria)] hover:underline">
                      {{ copiado() === t.id + 'codigo' ? 'Copiado!' : 'Copiar' }}
                    </button>
                  </div>
                  <p class="text-xs text-[var(--cor-texto-terciario)] mt-2">
                    Envie o link para quem vai se cadastrar e informe o código por um canal separado (ex: fale em sala).
                  </p>
                  <button (click)="gerarConvite(t)" class="text-xs text-amber-600 hover:underline font-medium mt-2">
                    Gerar novo convite (invalida o link/código atuais)
                  </button>
                } @else {
                  <p class="text-xs text-[var(--cor-texto-secundario)] mb-2">Esta turma ainda não tem um convite de cadastro.</p>
                  <button (click)="gerarConvite(t)" class="text-xs text-[var(--cor-primaria)] hover:underline font-medium">Gerar convite</button>
                }
              </div>
            </div>
          } @empty {
            <p class="text-sm text-[var(--cor-texto-terciario)]">Nenhuma turma cadastrada ainda.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class TurmasAdminComponent {
  private fb = inject(FormBuilder);
  turmas = inject(TurmasService);
  private convites = inject(ConvitesService);

  editandoId = signal<string | null>(null);
  erro = signal<string | null>(null);
  copiado = signal<string | null>(null);

  temas = TEMAS;

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    ativa: [true],
    tema: ['padrao', Validators.required],
  });

  temaSelecionadoDescricao(): string {
    return temaPorId(this.form.controls.tema.value).descricao;
  }

  nomeTema(t: Turma): string {
    return temaPorId(t.temaId).nome;
  }

  linkConvite(t: Turma): string {
    // Resolve relativo ao <base href> real da build (em dev é "/", no GitHub Pages é "/guia-de-estudos/").
    return new URL(`cadastro?convite=${t.conviteToken}`, document.baseURI).toString();
  }

  async copiar(turmaId: string, tipo: 'link' | 'codigo', valor: string): Promise<void> {
    await navigator.clipboard.writeText(valor);
    this.copiado.set(turmaId + tipo);
    setTimeout(() => this.copiado.set(null), 2000);
  }

  editar(t: Turma): void {
    this.editandoId.set(t.id);
    this.form.setValue({ nome: t.nome, ativa: t.ativa, tema: t.temaId ?? 'padrao' });
  }

  cancelarEdicao(): void {
    this.editandoId.set(null);
    this.form.reset({ nome: '', ativa: true, tema: 'padrao' });
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) return;
    this.erro.set(null);
    const { tema, ...resto } = this.form.getRawValue();
    const dados = { ...resto, temaId: tema };

    try {
      const id = this.editandoId();
      if (id) {
        await this.turmas.atualizar(id, dados);
      } else {
        const novoId = await this.turmas.criar(dados);
        await this.convites.gerar(novoId, dados.nome);
      }
      this.cancelarEdicao();
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível salvar: ${e.message}` : 'Não foi possível salvar a turma.');
    }
  }

  async gerarConvite(t: Turma): Promise<void> {
    if (t.conviteToken && !confirm('O link e o código atuais deixarão de funcionar. Continuar?')) return;
    try {
      await this.convites.gerar(t.id, t.nome, t.conviteToken);
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível gerar o convite: ${e.message}` : 'Não foi possível gerar o convite.');
    }
  }

  async excluir(t: Turma): Promise<void> {
    if (!confirm(`Excluir a turma "${t.nome}"? Isso não exclui alunos/períodos já vinculados a ela.`)) return;
    try {
      await this.turmas.excluir(t.id);
    } catch (e) {
      this.erro.set(e instanceof Error ? `Não foi possível excluir: ${e.message}` : 'Não foi possível excluir a turma.');
    }
  }
}
