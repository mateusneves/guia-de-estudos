import { Component, effect, inject, signal } from '@angular/core';
import { AvisosService } from '../../services/avisos.service';
import { ProgressoService } from '../../services/progresso.service';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-avisos',
  imports: [ModalComponent],
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Avisos</h1>
          <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">Comunicados da turma.</p>
        </div>
        @if (auth.isAdmin()) {
          <button
            type="button"
            class="shrink-0 px-4 py-2 rounded-full text-sm font-medium text-white transition-colors"
            style="background-color: var(--cor-primaria);"
            (click)="abrirModalNovo()"
          >+ Novo Aviso</button>
        }
      </div>

      @if (erro()) {
        <div class="px-3 py-2 rounded-lg bg-[var(--cor-erro-fundo)] text-[var(--cor-erro-texto)] text-xs">
          {{ erro() }}
        </div>
      }

      @if (avisos.carregando()) {
        <div class="card flex flex-col items-center justify-center py-12 text-center">
          <p class="text-sm text-[var(--cor-texto-terciario)]">Carregando avisos...</p>
        </div>
      } @else if (avisos.avisos().length === 0) {
        <div class="card flex flex-col items-center justify-center py-12 text-center">
          <i class="fa-solid fa-bullhorn text-3xl text-[var(--cor-texto-terciario)] mb-2"></i>
          <p class="text-sm text-[var(--cor-texto-terciario)]">Nenhum aviso por enquanto.</p>
        </div>
      } @else {
        <div class="space-y-4">
          @for (a of avisos.avisos(); track a.id) {
            <div class="card">
              <div class="flex items-start justify-between gap-3 mb-2">
                <h2 class="font-semibold text-[var(--cor-texto-principal)] leading-snug">{{ a.titulo }}</h2>
                @if (auth.isAdmin()) {
                  <button
                    type="button"
                    class="shrink-0 text-red-500 hover:text-red-600 text-xs"
                    (click)="excluir(a.id, a.titulo)"
                  >Excluir</button>
                }
              </div>
              <p class="text-sm text-[var(--cor-texto-principal)] leading-relaxed whitespace-pre-wrap">{{ a.mensagem }}</p>
              <p class="text-xs text-[var(--cor-texto-terciario)] mt-3">{{ a.autorNome }} · {{ formatarData(a.criadoEm) }}</p>
            </div>
          }
        </div>
      }

    </div>

    <app-modal [aberto]="modalAberto()" titulo="Novo aviso" (fechar)="fecharModal()">
      <div class="space-y-3">
        <div>
          <label class="text-xs font-medium text-[var(--cor-texto-secundario)] mb-1">Título</label>
          <input
            type="text"
            class="w-full text-sm border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)]"
            placeholder="Ex: Aula de amanhã cancelada"
            [value]="novoTitulo()"
            (input)="novoTitulo.set($any($event.target).value)"
          />
        </div>
        <div>
          <label class="text-xs font-medium text-[var(--cor-texto-secundario)] mb-1">Mensagem</label>
          <textarea
            class="w-full text-sm border border-[var(--cor-borda-media)] rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)]"
            rows="4"
            placeholder="Detalhes do aviso..."
            [value]="novaMensagem()"
            (input)="novaMensagem.set($any($event.target).value)"
          ></textarea>
        </div>
        <button
          type="button"
          class="w-full px-4 py-2.5 rounded-full text-sm font-medium text-white transition-colors disabled:opacity-40"
          style="background-color: var(--cor-primaria);"
          [disabled]="!novoTitulo().trim() || !novaMensagem().trim() || postando()"
          (click)="postar()"
        >{{ postando() ? 'Postando...' : 'Postar aviso' }}</button>
      </div>
    </app-modal>
  `,
})
export class AvisosComponent {
  avisos = inject(AvisosService);
  auth = inject(AuthService);
  private progresso = inject(ProgressoService);

  erro = signal<string | null>(null);
  modalAberto = signal(false);
  novoTitulo = signal('');
  novaMensagem = signal('');
  postando = signal(false);

  constructor() {
    // Marca o aviso mais recente como visto sempre que a lista (já carregada) mudar —
    // inclusive se um aviso novo chegar via onSnapshot com a página já aberta, já que
    // nesse caso o usuário está literalmente vendo o quadro. Só grava quando o valor
    // realmente muda, pra não escrever no Firestore a cada re-emissão idêntica do snapshot.
    effect(() => {
      const lista = this.avisos.avisos();
      if (lista.length === 0) return;
      const maisRecente = lista[0].criadoEm;
      if (this.progresso.ultimoAvisoVistoEm() !== maisRecente) {
        this.progresso.marcarAvisosVistos(maisRecente);
      }
    });
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  abrirModalNovo(): void {
    this.novoTitulo.set('');
    this.novaMensagem.set('');
    this.erro.set(null);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  async postar(): Promise<void> {
    const titulo = this.novoTitulo().trim();
    const mensagem = this.novaMensagem().trim();
    if (!titulo || !mensagem) return;
    this.postando.set(true);
    try {
      await this.avisos.criar(titulo, mensagem);
      this.fecharModal();
    } catch (e) {
      this.erro.set('Não foi possível postar o aviso. Tente novamente.');
      console.error('[Avisos] falha ao postar:', e);
    } finally {
      this.postando.set(false);
    }
  }

  async excluir(id: string, titulo: string): Promise<void> {
    if (!confirm(`Excluir o aviso "${titulo}"?`)) return;
    try {
      await this.avisos.excluir(id);
    } catch (e) {
      this.erro.set('Não foi possível excluir o aviso. Tente novamente.');
      console.error('[Avisos] falha ao excluir:', e);
    }
  }
}
