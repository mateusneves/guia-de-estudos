import { Injectable, NgZone, effect, inject, signal } from '@angular/core';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { AuthService } from './auth.service';
import { EventoXp } from '../models/models';

/** Ledger de XP vitalício do usuário logado — `progresso/{uid}/historico`, append-only. */
@Injectable({ providedIn: 'root' })
export class HistoricoService {
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  private readonly _eventos = signal<EventoXp[]>([]);
  readonly eventos = this._eventos.asReadonly();

  private unsub: (() => void) | null = null;

  constructor() {
    effect(() => {
      const uid = this.authService.usuario()?.uid;
      this.unsub?.();
      this.unsub = null;
      this._eventos.set([]);
      if (!uid) return;

      this.unsub = onSnapshot(
        query(collection(db, 'progresso', uid, 'historico'), orderBy('data', 'desc')),
        snap => this.ngZone.run(() => this._eventos.set(snap.docs.map(d => ({ id: d.id, ...d.data() } as EventoXp)))),
        err => console.error('[Histórico] falha ao ler:', err)
      );
    });
  }
}
