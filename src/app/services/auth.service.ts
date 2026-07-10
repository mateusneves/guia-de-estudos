import { Injectable, NgZone, computed, signal } from '@angular/core';
import {
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
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

  /** Atualiza nome de exibição e/ou avatar do próprio usuário logado. */
  async atualizarPerfil(dados: Partial<Pick<Usuario, 'nome' | 'avatarSeed'>>): Promise<void> {
    const user = this.usuario();
    if (!user) throw new Error('Você precisa estar logado.');

    await updateDoc(doc(db, 'usuarios', user.uid), dados);
    if (dados.nome) {
      await updateProfile(user, { displayName: dados.nome });
    }
  }

  /** Troca a senha do usuário logado — exige a senha atual para reautenticar antes (exigência do Firebase Auth). */
  async alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    const user = this.usuario();
    if (!user?.email) throw new Error('Você precisa estar logado.');

    const credencial = EmailAuthProvider.credential(user.email, senhaAtual);
    await reauthenticateWithCredential(user, credencial);
    await updatePassword(user, novaSenha);
  }
}
