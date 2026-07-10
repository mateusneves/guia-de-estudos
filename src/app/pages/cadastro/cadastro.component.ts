import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { AuthService } from '../../services/auth.service';
import { TurmasService } from '../../services/turmas.service';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4" style="background: linear-gradient(180deg, #1a2e4a 0%, #0f1e31 100%);">
      <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
          <img src="logo-curso.webp" alt="Logo Seminário" class="h-16 w-auto object-contain rounded mb-3">
          <h1 class="text-white font-semibold text-lg">Guia de Estudos</h1>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-6">
          <h2 class="text-lg font-bold text-slate-800 mb-1">Criar conta</h2>
          <p class="text-sm text-slate-500 mb-5">Cadastre-se selecionando sua turma.</p>

          <form [formGroup]="form" (ngSubmit)="cadastrar()" class="space-y-4">
            <div>
              <label class="text-xs font-medium text-slate-600">Nome completo</label>
              <input
                type="text"
                formControlName="nome"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                placeholder="Seu nome"
              >
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600">E-mail</label>
              <input
                type="email"
                formControlName="email"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                placeholder="voce@exemplo.com"
              >
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600">Senha</label>
              <input
                type="password"
                formControlName="senha"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                placeholder="Mínimo 6 caracteres"
              >
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600">Turma</label>
              <select
                formControlName="turmaId"
                class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 bg-white"
              >
                <option value="" disabled>Selecione sua turma</option>
                @for (t of turmas.turmasAtivas(); track t.id) {
                  <option [value]="t.id">{{ t.nome }}</option>
                }
              </select>
              @if (turmas.turmasAtivas().length === 0) {
                <p class="text-xs text-amber-600 mt-1">Nenhuma turma disponível ainda. Fale com o administrador.</p>
              }
            </div>

            @if (erro()) {
              <p class="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ erro() }}</p>
            }

            <button
              type="submit"
              [disabled]="form.invalid || enviando()"
              class="w-full bg-[#1e3a5f] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#2d5a8e] transition-colors disabled:opacity-50"
            >{{ enviando() ? 'Criando conta...' : 'Criar conta' }}</button>
          </form>

          <p class="text-center text-sm text-slate-500 mt-5">
            Já tem conta? <a routerLink="/login" class="text-[#1e3a5f] font-medium hover:underline">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  turmas = inject(TurmasService);

  enviando = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    turmaId: ['', Validators.required],
  });

  async cadastrar(): Promise<void> {
    if (this.form.invalid) return;
    this.enviando.set(true);
    this.erro.set(null);
    const { nome, email, senha, turmaId } = this.form.getRawValue();

    try {
      await this.auth.cadastrar(nome, email, senha, turmaId);
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
      'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
      'auth/invalid-email': 'E-mail inválido.',
      'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres).',
    };
    return mapa[codigo] ?? 'Não foi possível criar a conta. Verifique seus dados e tente novamente.';
  }
}
