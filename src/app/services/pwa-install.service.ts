import { Injectable, NgZone, signal } from '@angular/core';

const CHAVE_DISPENSADO = 'guia-estudos-pwa-dispensado';
const DIAS_PARA_REEXIBIR = 14;

export type PlataformaInstalacao = 'android' | 'ios' | null;

/** Evento não-padrão do Chromium — não faz parte do lib.dom.d.ts do TypeScript. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Aviso de "instalar como app" (added 2026-08-05) — mostrado só dentro do app logado
 * (mesmo padrão de escopo de XpToastComponent/QuizDiarioModalComponent), restrito a
 * celular (Android/iOS via user agent; desktop nunca mostra, já tem o ícone nativo de
 * instalação do próprio navegador).
 *
 * Android/Chrome: captura `beforeinstallprompt` (só dispara se o Chrome já considerar
 * o site instalável) e reusa esse evento pra abrir o prompt nativo real via `instalar()`.
 * iOS Safari nunca dispara esse evento (Apple não implementa a API) — não tem como
 * disparar a instalação por código lá, então mostramos instruções manuais direto,
 * sem esperar evento nenhum.
 *
 * "Dispensado" fica em localStorage (preferência do navegador/aparelho, não da conta —
 * mesmo raciocínio do `modo` claro/escuro em TemaService), reaparece depois de 14 dias.
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly plataforma: PlataformaInstalacao = this.detectarPlataforma();
  readonly mostrarAviso = signal(false);

  constructor(private ngZone: NgZone) {
    if (typeof window === 'undefined' || !this.plataforma) return;
    if (this.jaInstalado() || this.dispensadoRecentemente()) return;

    if (this.plataforma === 'ios') {
      // Sem evento pra esperar — se chegou até aqui (iOS, não instalado, não dispensado
      // recentemente), já mostra as instruções manuais.
      this.mostrarAviso.set(true);
      return;
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.ngZone.run(() => this.mostrarAviso.set(true));
    });

    window.addEventListener('appinstalled', () => {
      this.ngZone.run(() => this.mostrarAviso.set(false));
    });
  }

  private detectarPlataforma(): PlataformaInstalacao {
    if (typeof navigator === 'undefined') return null;
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    if (/android/i.test(ua)) return 'android';
    return null;
  }

  private jaInstalado(): boolean {
    const standaloneIos = (navigator as unknown as { standalone?: boolean }).standalone === true;
    return window.matchMedia('(display-mode: standalone)').matches || standaloneIos;
  }

  private dispensadoRecentemente(): boolean {
    const iso = localStorage.getItem(CHAVE_DISPENSADO);
    if (!iso) return false;
    const dias = (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
    return dias < DIAS_PARA_REEXIBIR;
  }

  /** Só existe prompt real (Android/Chrome) até este ponto — no iOS o botão "Instalar" nem aparece no template. */
  async instalar(): Promise<void> {
    if (!this.deferredPrompt) return;
    await this.deferredPrompt.prompt();
    const escolha = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.mostrarAviso.set(false);
    if (escolha.outcome !== 'accepted') this.dispensar();
  }

  dispensar(): void {
    localStorage.setItem(CHAVE_DISPENSADO, new Date().toISOString());
    this.mostrarAviso.set(false);
  }
}
