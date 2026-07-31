import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { TurmasService } from './turmas.service';
import { temaPorId } from '../shared/temas-catalogo';

export type Modo = 'light' | 'dark';

const CHAVE_MODO = 'guia-estudos-modo';

/**
 * Aplica o tema visual da turma do usuário logado escrevendo `data-tema="<id>"` em
 * `<html>` — todo o resto é CSS puro (`src/styles.css`), nenhum componente lê este
 * serviço para se estilizar. Cai em "moderno" (o tema padrão do app, ver
 * `temaPorId`) pré-login (sem perfil ainda) e para qualquer turma sem
 * `temaId`/com um id desconhecido.
 *
 * Também controla `modo` (claro/escuro) — uma preferência PESSOAL do usuário, não da
 * turma (diferente de `temaAtivo`), guardada em `localStorage` (não no Firestore: é só
 * uma preferência de exibição do navegador, não precisa sincronizar entre dispositivos).
 * Aplicada como `data-modo="<light|dark>"` em `<html>`, lido por regras
 * `[data-tema="moderno"][data-modo="dark"]` em `styles.css` — hoje só o tema Moderno tem
 * uma variante escura definida; nos outros temas o atributo fica presente mas inerte
 * (nenhuma regra CSS reage a ele), então alternar o modo com Padrão/Medieval ativos não
 * tem efeito visual até esses temas ganharem sua própria variante escura, se algum dia
 * fizer sentido.
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  private authService = inject(AuthService);
  private turmasService = inject(TurmasService);

  readonly temaAtivo = computed(() => {
    const turmaId = this.authService.perfil()?.turmaId;
    const turma = turmaId ? this.turmasService.turmas().find(t => t.id === turmaId) : undefined;
    return temaPorId(turma?.temaId);
  });

  readonly modo = signal<Modo>(this.modoInicial());

  constructor() {
    effect(() => {
      const tema = this.temaAtivo();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-tema', tema.id);
      }
    });

    effect(() => {
      const modo = this.modo();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-modo', modo);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CHAVE_MODO, modo);
      }
    });
  }

  alternarModo(): void {
    this.modo.update(m => (m === 'dark' ? 'light' : 'dark'));
  }

  /** Preferência salva > preferência do sistema operacional (`prefers-color-scheme`) > claro. */
  private modoInicial(): Modo {
    if (typeof localStorage !== 'undefined') {
      const salvo = localStorage.getItem(CHAVE_MODO);
      if (salvo === 'light' || salvo === 'dark') return salvo;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
}
