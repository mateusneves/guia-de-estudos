import { Injectable, NgZone, computed, signal } from '@angular/core';
import {
  EmailAuthProvider,
  User,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { FirestoreError, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
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

  /**
   * O código de autorização nunca é lido do Firestore antes deste ponto — ele só é validado
   * pela própria regra de segurança do `create`, comparando com o valor real da turma sem
   * nunca expor esse valor a quem ainda não está autenticado. Se o código estiver errado,
   * a regra rejeita a escrita e a conta de autenticação recém-criada é apagada (rollback),
   * para não deixar o e-mail "presa" numa conta órfã sem perfil.
   */
  async cadastrar(nome: string, email: string, senha: string, turmaId: string, codigoConvite: string): Promise<void> {
    const credencial = await createUserWithEmailAndPassword(auth, email, senha);

    const perfil: Usuario = {
      uid: credencial.user.uid,
      nome,
      email,
      role: 'aluno',
      turmaId,
      ativo: true,
      criadoEm: new Date().toISOString(),
      codigoConvite,
    };

    try {
      await setDoc(doc(db, 'usuarios', credencial.user.uid), { ...perfil, criadoEm: serverTimestamp() });
    } catch (e) {
      // Qualquer falha aqui deixaria uma conta de autenticação órfã (sem perfil) — desfaz sempre.
      await deleteUser(credencial.user).catch(() => {});
      const negado = e instanceof FirestoreError && e.code === 'permission-denied';
      throw negado ? new Error('CODIGO_INVALIDO') : e;
    }

    await updateProfile(credencial.user, { displayName: nome });
  }

  async login(email: string, senha: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, senha);
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  /** Atualiza nome de exibição e/ou avatar do próprio usuário logado. */
  async atualizarPerfil(dados: Partial<Pick<Usuario, 'nome' | 'avatarSeed' | 'avatarComBarba'>>): Promise<void> {
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
