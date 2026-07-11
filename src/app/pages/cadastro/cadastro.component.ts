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
    <div class="min-h-screen flex items-center justify-center p-4" style="background: linear-gradient(180deg, var(--cor-sidebar-inicio) 0%, var(--cor-sidebar-fim) 100%);">
      <div class="w-full max-w-sm">
        <div class="flex flex-col items-center mb-6">
          <img src="logo-curso.webp" alt="Logo Seminário" class="h-16 w-auto object-contain rounded mb-3">
          <h1 class="text-white font-semibold text-lg">Guia de Estudos</h1>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-6">
          @if (resolvendo()) {
            <p class="text-sm text-slate-500 text-center py-6">Verificando convite...</p>
          } @else if (!convite()) {
            <h2 class="text-lg font-bold text-slate-800 mb-1">Convite necessário</h2>
            <p class="text-sm text-slate-500">
              O cadastro só pode ser feito através de um link de convite válido, enviado pelo
              administrador da sua turma. Se você recebeu um link e chegou aqui mesmo assim, ele pode
              ter expirado — peça um novo.
            </p>
          } @else {
            <h2 class="text-lg font-bold text-slate-800 mb-1">Criar conta</h2>
            <p class="text-sm text-slate-500 mb-5">
              Você foi convidado para a turma <strong>{{ convite()!.turmaNome }}</strong>.
            </p>

            <form [formGroup]="form" (ngSubmit)="cadastrar()" class="space-y-4">
              <div>
                <label class="text-xs font-medium text-slate-600">Nome completo</label>
                <input
                  type="text"
                  formControlName="nome"
                  class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)]"
                  placeholder="Seu nome"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-slate-600">E-mail</label>
                <input
                  type="email"
                  formControlName="email"
                  class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)]"
                  placeholder="voce@exemplo.com"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-slate-600">Senha</label>
                <input
                  type="password"
                  formControlName="senha"
                  class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)]"
                  placeholder="Mínimo 6 caracteres"
                >
              </div>
              <div>
                <label class="text-xs font-medium text-slate-600">Código de autorização</label>
                <input
                  type="text"
                  formControlName="codigo"
                  class="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria-30)] uppercase"
                  placeholder="Informado pelo administrador"
                >
              </div>

              @if (erro()) {
                <p class="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ erro() }}</p>
              }

              <button
                type="submit"
                [disabled]="form.invalid || enviando()"
                class="w-full bg-[var(--cor-primaria)] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] transition-colors disabled:opacity-50"
              >{{ enviando() ? 'Criando conta...' : 'Criar conta' }}</button>
            </form>
          }

          <p class="text-center text-sm text-slate-500 mt-5">
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
