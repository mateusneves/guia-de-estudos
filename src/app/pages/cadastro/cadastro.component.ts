import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { AuthService } from '../../services/auth.service';
import { ConvitesService } from '../../services/convites.service';
import { ConvitePublico } from '../../models/models';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4" style="background-color: var(--cor-fundo);">
      <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mb-3 shrink-0" style="background-color: var(--cor-primaria);">
            <svg viewBox="0 0 32 32" fill="none" class="h-8 w-8 text-white">
              <path d="M13 9H28C28 9 29 9 29 10V30C29 30 29 31 28 31H4C4 31 3 31 3 30V5M3 5C3 1 7 1 7 1H29M3 5C3 9 7 9 7 9M7 5V17L10 15L13 17V5H27" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="text-[var(--cor-texto-principal)] font-semibold text-lg">Guia de Estudos</h1>
        </div>

        <div class="card">
          @if (resolvendo()) {
            <p class="text-sm text-[var(--cor-texto-secundario)] text-center py-6">Verificando convite...</p>
          } @else if (!convite()) {
            <h2 class="text-lg font-bold text-[var(--cor-texto-principal)] mb-1">Convite necessário</h2>
            <p class="text-sm text-[var(--cor-texto-secundario)]">
              O cadastro só pode ser feito através de um link de convite válido, enviado pelo
              administrador da sua turma. Se você recebeu um link e chegou aqui mesmo assim, ele pode
              ter expirado — peça um novo.
            </p>
          } @else {
            <h2 class="text-lg font-bold text-[var(--cor-texto-principal)] mb-1">Criar conta</h2>
            <p class="text-sm text-[var(--cor-texto-secundario)] mb-5">
              Você foi convidado para a turma <strong>{{ convite()!.turmaNome }}</strong>.
            </p>

            <form [formGroup]="form" (ngSubmit)="cadastrar()" class="space-y-4">
              <div>
                <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Nome completo</label>
                <input
                  type="text"
                  formControlName="nome"
                  class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)]"
                  placeholder="Seu nome"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">E-mail</label>
                <input
                  type="email"
                  formControlName="email"
                  class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)]"
                  placeholder="voce@exemplo.com"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Senha</label>
                <input
                  type="password"
                  formControlName="senha"
                  class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)]"
                  placeholder="Mínimo 6 caracteres"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Código de autorização</label>
                <input
                  type="text"
                  formControlName="codigo"
                  class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)] uppercase"
                  placeholder="Informado pelo administrador"
                >
              </div>

              @if (erro()) {
                <p class="text-xs text-[var(--cor-erro-texto)] bg-[var(--cor-erro-fundo)] rounded-lg px-3 py-2">{{ erro() }}</p>
              }

              <button
                type="submit"
                [disabled]="form.invalid || enviando()"
                class="w-full bg-[var(--cor-primaria)] text-white rounded-full py-2.5 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] transition-colors disabled:opacity-50"
              >{{ enviando() ? 'Criando conta...' : 'Criar conta' }}</button>
            </form>
          }

          <p class="text-center text-sm text-[var(--cor-texto-secundario)] mt-5">
            Já tem conta? <a routerLink="/login" class="text-[var(--cor-primaria)] font-medium hover:underline">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private convites = inject(ConvitesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  resolvendo = signal(true);
  convite = signal<ConvitePublico | null>(null);

  enviando = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    codigo: ['', Validators.required],
  });

  constructor() {
    const token = this.route.snapshot.queryParamMap.get('convite');
    if (!token) {
      this.resolvendo.set(false);
      return;
    }

    this.convites.resolver(token).then(convite => {
      this.convite.set(convite && convite.ativo ? convite : null);
      this.resolvendo.set(false);
    });
  }

  async cadastrar(): Promise<void> {
    if (this.form.invalid) return;
    const convite = this.convite();
    if (!convite) return;

    this.enviando.set(true);
    this.erro.set(null);
    const { nome, email, senha, codigo } = this.form.getRawValue();

    try {
      await this.auth.cadastrar(nome, email, senha, convite.turmaId, codigo.trim().toUpperCase());
      this.router.navigateByUrl('/dashboard');
    } catch (e) {
      this.erro.set(this.mensagemErro(e));
    } finally {
      this.enviando.set(false);
    }
  }

  private mensagemErro(e: unknown): string {
    if (e instanceof Error && e.message === 'CODIGO_INVALIDO') {
      return 'Código de autorização incorreto.';
    }
    const codigo = e instanceof FirebaseError ? e.code : '';
    const mapa: Record<string, string> = {
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres).',
    };
    return mapa[codigo] ?? 'Não foi possível criar a conta. Verifique seus dados e tente novamente.';
  }
}
