import { Component, computed, inject } from '@angular/core';
import { RankingService } from '../../services/ranking.service';
import { AuthService } from '../../services/auth.service';
import { avatarUrl } from '../../shared/avatar';
import { nivelPorXp } from '../../shared/gamificacao-catalogo';
import { Usuario } from '../../models/models';

const CORES_POSICAO: Record<number, string> = {
  1: '#eab308',
  2: '#94a3b8',
  3: '#b45309',
};

interface ItemPodio {
  u: Usuario;
  posicao: number; // 1, 2 ou 3 — usado pra cor/coroa, não pra ordem visual
  ordem: number; // ordem visual no flex: 2º-1º-3º (pódio clássico)
  avatarPx: number;
  pedestalPx: number;
}

// Config do pódio por posição real (índice 0/1/2 = 1º/2º/3º) — 1º fica maior e ao
// centro (ordem 2), 2º à esquerda (ordem 1), 3º à direita (ordem 3), como um pódio físico.
const CONFIG_PODIO: Omit<ItemPodio, 'u'>[] = [
  { posicao: 1, ordem: 2, avatarPx: 96, pedestalPx: 72 },
  { posicao: 2, ordem: 1, avatarPx: 72, pedestalPx: 48 },
  { posicao: 3, ordem: 3, avatarPx: 64, pedestalPx: 32 },
];

@Component({
  selector: 'app-ranking',
  imports: [],
  template: `
    <div class="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      <div>
        <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Ranking</h1>
        <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">Classificação da turma por XP acumulado.</p>
      </div>

      @if (ranking.erro()) {
        <div class="px-3 py-2 rounded-lg bg-[var(--cor-erro-fundo)] text-[var(--cor-erro-texto)] text-xs">
          {{ ranking.erro() }}
        </div>
      }

      @if (ranking.carregando()) {
        <div class="card flex flex-col items-center justify-center py-12 text-center">
          <p class="text-sm text-[var(--cor-texto-terciario)]">Carregando ranking...</p>
        </div>
      } @else if (ranking.ranking().length === 0) {
        <div class="card flex flex-col items-center justify-center py-12 text-center">
          <i class="fa-solid fa-ranking-star text-3xl text-[var(--cor-texto-terciario)] mb-2"></i>
          <p class="text-sm text-[var(--cor-texto-terciario)]">Ainda não há colegas para exibir no ranking.</p>
        </div>
      } @else {

        <!-- Pódio — 1º/2º/3º lugar lado a lado, 1º maior e ao centro -->
        <div class="card">
          <div class="flex items-end justify-center gap-4 md:gap-8 pt-2">
            @for (item of podio(); track item.u.uid) {
              <div class="flex flex-col items-center" [style.order]="item.ordem">
                <div class="relative">
                  <img
                    [src]="avatarUrlDe(item.u.avatarSeed || item.u.uid, !!item.u.avatarComBarba)"
                    alt=""
                    class="rounded-full bg-white ring-4"
                    [style.width.px]="item.avatarPx"
                    [style.height.px]="item.avatarPx"
                    [style.--tw-ring-color]="corPosicao(item.posicao)"
                    style="box-shadow: 0 4px 14px rgba(0,0,0,0.12);"
                  >
                  <span
                    class="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
                    [style.background-color]="corPosicao(item.posicao)"
                  >{{ item.posicao }}</span>
                </div>
                <p class="text-sm font-semibold mt-2.5 text-center max-w-[6.5rem] md:max-w-[8rem] truncate text-[var(--cor-texto-principal)]">
                  {{ item.u.nome }}
                </p>
                @if (item.u.uid === meuUid()) {
                  <span class="text-[0.65rem] font-medium text-[var(--cor-texto-terciario)]">(você)</span>
                }
                <p class="text-xs mt-0.5 flex items-center gap-1" [style.color]="nivelDe(item.u).cor">
                  <i [class]="nivelDe(item.u).icone"></i>
                  <span>{{ nivelDe(item.u).titulo }}</span>
                </p>
                <p class="text-sm font-bold mt-1 text-[var(--cor-texto-principal)]">{{ item.u.xp ?? 0 }} <span class="text-xs font-normal text-[var(--cor-texto-terciario)]">XP</span></p>

                <!-- Pedestal -->
                <div
                  class="mt-3 w-20 md:w-24 rounded-t-lg"
                  [style.height.px]="item.pedestalPx"
                  [style.background-color]="corPosicao(item.posicao)"
                  style="opacity: 0.85;"
                ></div>
              </div>
            }
          </div>
        </div>

        <!-- Demais colocações -->
        @if (resto().length > 0) {
          <div class="card">
            <div class="space-y-2">
              @for (u of resto(); track u.uid; let i = $index) {
                <div
                  class="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  [class.bg-green-50]="u.uid === meuUid()"
                  [style.background-color]="u.uid === meuUid() ? null : 'var(--cor-fundo-sutil)'"
                >
                  <!-- Posição -->
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 text-[var(--cor-texto-secundario)]"
                    style="background-color: var(--cor-fundo-sutil-forte);"
                  >{{ i + 4 }}</span>

                  <!-- Avatar -->
                  <img
                    [src]="avatarUrlDe(u.avatarSeed || u.uid, !!u.avatarComBarba)"
                    alt=""
                    class="w-12 h-12 rounded-full bg-white shrink-0"
                  >

                  <!-- Nome + nível -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold leading-snug truncate text-[var(--cor-texto-principal)]">
                      {{ u.nome }}
                      @if (u.uid === meuUid()) {
                        <span class="text-xs font-normal text-[var(--cor-texto-terciario)]">(você)</span>
                      }
                    </p>
                    <p class="text-xs mt-0.5 flex items-center gap-1.5" [style.color]="nivelDe(u).cor">
                      <i [class]="nivelDe(u).icone"></i>
                      <span>{{ nivelDe(u).titulo }}</span>
                    </p>
                  </div>

                  <!-- XP -->
                  <div class="shrink-0 text-right">
                    <p class="text-sm font-bold text-[var(--cor-texto-principal)]">{{ u.xp ?? 0 }}</p>
                    <p class="text-xs text-[var(--cor-texto-terciario)]">XP</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }

    </div>
  `,
})
export class RankingComponent {
  ranking = inject(RankingService);
  private auth = inject(AuthService);

  avatarUrlDe = avatarUrl;
  nivelPorXp = nivelPorXp;

  podio = computed<ItemPodio[]>(() => {
    const lista = this.ranking.ranking();
    return CONFIG_PODIO
      .filter(c => lista[c.posicao - 1])
      .map(c => ({ ...c, u: lista[c.posicao - 1] }));
  });

  resto = computed(() => this.ranking.ranking().slice(3));

  meuUid(): string | undefined {
    return this.auth.usuario()?.uid;
  }

  nivelDe(u: Usuario) {
    return nivelPorXp(u.xp ?? 0);
  }

  corPosicao(posicao: number): string {
    return CORES_POSICAO[posicao] ?? 'var(--cor-fundo-sutil-forte)';
  }
}
