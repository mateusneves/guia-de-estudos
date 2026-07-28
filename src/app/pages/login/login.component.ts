import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
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
          <h2 class="text-lg font-bold text-[var(--cor-texto-principal)] mb-1">Entrar</h2>
          <p class="text-sm text-[var(--cor-texto-secundario)] mb-5">Acesse com seu e-mail e senha.</p>

          <form [formGroup]="form" (ngSubmit)="entrar()" class="space-y-4">
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
                placeholder="••••••••"
              >
            </div>

            @if (erro()) {
              <p class="text-xs text-[var(--cor-erro-texto)] bg-[var(--cor-erro-fundo)] rounded-lg px-3 py-2">{{ erro() }}</p>
            }

            <button
              type="submit"
              [disabled]="form.invalid || enviando()"
              class="w-full bg-[var(--cor-primaria)] text-white rounded-full py-2.5 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] transition-colors disabled:opacity-50"
            >{{ enviando() ? 'Entrando...' : 'Entrar' }}</button>
          </form>

          <p class="text-center text-sm text-[var(--cor-texto-secundario)] mt-5">
            Não tem conta? Pergunte ao administrador da sua turma pelo link de convite de cadastro.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  enviando = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  async entrar(): Promise<void> {
    if (this.form.invalid) return;
    this.enviando.set(true);
    this.erro.set(null);
    const { email, senha } = this.form.getRawValue();

    try {
      await this.auth.login(email, senha);
      this.router.navigateByUrl('/dashboard');
    } catch (e) {
      this.erro.set(this.mensagemErro(e));
    } finally {
      this.enviando.set(false);
    }
  }

  private mensagemErro(e: unknown): string {
    const codigo = e instanceof FirebaseError ? e.code : '';
    const mapa: Record<string, string> = {
      'auth/invalid-credential': 'E-mail ou senha incorretos.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    };
    return mapa[codigo] ?? 'Não foi possível entrar. Verifique seus dados e tente novamente.';
  }
}
