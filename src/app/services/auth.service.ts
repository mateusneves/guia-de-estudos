import { Injectable, NgZone, computed, signal } from '@angular/core';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Usuario } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly usuario = signal<User | null>(null);
  readonly perfil = signal<Usuario | null>(null);
  readonly carregando = signal(true);

  readonly isAdmin = computed(() => this.perfil()?.role === 'administrador');
  readonly logado = computed(() => this.usuario() !== null);

  /** Resolve depois que o estado inicial de autenticação (usuário + perfil) é conhecido — usado pelos guards de rota. */
  readonly pronto: Promise<void>;
  private marcarPronto!: () => void;

  private unsubPerfil: (() => void) | null = null;

  constructor(private ngZone: NgZone) {
    this.pronto = new Promise(resolve => { this.marcarPronto = resolve; });

    onAuthStateChanged(auth, (user) => {
      this.ngZone.run(() => {
        this.usuario.set(user);
        this.unsubPerfil?.();
        this.unsubPerfil = null;

        if (!user) {
          this.perfil.set(null);
          this.carregando.set(false);
          this.marcarPronto();
          return;
        }

        this.unsubPerfil = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
          this.ngZone.run(() => {
            this.perfil.set(snap.exists() ? (snap.data() as Usuario) : null);
            this.carregando.set(false);
            this.marcarPronto();
          });
        });
      });
    });
  }

  async cadastrar(nome: string, email: string, senha: string, turmaId: string): Promise<void> {
    const credencial = await createUserWithEmailAndPassword(auth, email, senha);
    await updateProfile(credencial.user, { displayName: nome });

    const perfil: Usuario = {
      uid: credencial.user.uid,
      nome,
      email,
      role: 'aluno',
      turmaId,
      ativo: true,
      criadoEm: new Date().toISOString(),
    };
    await setDoc(doc(db, 'usuarios', credencial.user.uid), { ...perfil, criadoEm: serverTimestamp() });
  }

  async login(email: string, senha: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }
}
