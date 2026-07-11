import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
import { AuthService } from '../../services/auth.service';
import { avatarUrl, seedAleatoria } from '../../shared/avatar';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-[var(--cor-texto-principal)]">Meu Perfil</h1>
        <p class="text-[var(--cor-texto-secundario)] text-sm mt-1">Edite seu nome de exibição, senha e avatar.</p>
      </div>

      <!-- Avatar -->
      <div class="card">
        <h2 class="font-semibold text-[var(--cor-texto-principal)] mb-4">Avatar</h2>
        <div class="flex items-center gap-4 mb-4">
          <img [src]="avatarAtual()" alt="Avatar atual" class="w-20 h-20 rounded-full bg-[var(--cor-fundo-sutil)] border border-[var(--cor-borda-media)]">
          <div>
            <p class="text-sm text-[var(--cor-texto-secundario)]">Este é o seu avatar atual.</p>
            <p class="text-xs text-[var(--cor-texto-terciario)]">Gerado por <a href="https://www.dicebear.com" target="_blank" rel="noopener" class="underline">DiceBear</a> (estilo Open Peeps).</p>
          </div>
        </div>

        <p class="text-xs font-medium text-[var(--cor-texto-secundario)] mb-2">Escolha uma opção ou gere outras:</p>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-3">
          @for (seed of opcoesAvatar(); track seed) {
            <button
              type="button"
              (click)="selecionarAvatar(seed)"
              class="rounded-full border-2 transition-colors p-0.5"
              [style.border-color]="seed === avatarSelecionado() ? 'var(--cor-primaria)' : 'transparent'"
            >
              <img [src]="avatarUrlDe(seed)" [alt]="'Opção de avatar'" class="w-full aspect-square rounded-full bg-[var(--cor-fundo-sutil)]">
            </button>
          }
        </div>
        <div class="flex items-center gap-3">
          <button type="button" (click)="gerarOpcoes()" class="text-xs text-[var(--cor-primaria)] hover:underline font-medium">Gerar outras opções</button>
          <button
            type="button"
            (click)="salvarAvatar()"
            [disabled]="!avatarSelecionado() || avatarSelecionado() === avatarSeedSalva()"
            class="bg-[var(--cor-primaria)] text-white rounded-lg px-4 py-2 text-xs font-medium hover:bg-[var(--cor-primaria-hover)] disabled:opacity-50"
          >Salvar avatar</button>
        </div>
        @if (mensagemAvatar()) {
          <p class="text-xs mt-2" [class.text-green-600]="!erroAvatar()" [class.text-red-600]="erroAvatar()">{{ mensagemAvatar() }}</p>
        }
      </div>

      <!-- Nome -->
      <div class="card">
        <h2 class="font-semibold text-[var(--cor-texto-principal)] mb-4">Nome de exibição</h2>
        <form [formGroup]="formNome" (ngSubmit)="salvarNome()" class="flex flex-wrap items-end gap-3">
          <div class="flex-1 min-w-48">
            <input formControlName="nome" class="w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm" placeholder="Seu nome">
          </div>
          <button type="submit" [disabled]="formNome.invalid" class="bg-[var(--cor-primaria)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] disabled:opacity-50">
            Salvar nome
          </button>
        </form>
        @if (mensagemNome()) {
          <p class="text-xs mt-2" [class.text-green-600]="!erroNome()" [class.text-red-600]="erroNome()">{{ mensagemNome() }}</p>
        }
      </div>

      <!-- Senha -->
      <div class="card">
        <h2 class="font-semibold text-[var(--cor-texto-principal)] mb-4">Alterar senha</h2>
        <form [formGroup]="formSenha" (ngSubmit)="salvarSenha()" class="space-y-3 max-w-sm">
          <div>
            <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Senha atual</label>
            <input type="password" formControlName="senhaAtual" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm">
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Nova senha</label>
            <input type="password" formControlName="novaSenha" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm" placeholder="Mínimo 6 caracteres">
          </div>
          <div>
            <label class="text-xs font-medium text-[var(--cor-texto-secundario)]">Confirmar nova senha</label>
            <input type="password" formControlName="confirmarSenha" class="mt-1 w-full border border-[var(--cor-borda-media)] rounded-lg px-3 py-2 text-sm">
          </div>
          <button type="submit" [disabled]="formSenha.invalid" class="bg-[var(--cor-primaria)] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[var(--cor-primaria-hover)] disabled:opacity-50">
            Alterar senha
          </button>
        </form>
        @if (mensagemSenha()) {
          <p class="text-xs mt-2" [class.text-green-600]="!erroSenha()" [class.text-red-600]="erroSenha()">{{ mensagemSenha() }}</p>
        }
      </div>
    </div>
  `,
})
export class PerfilComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  avatarUrlDe = avatarUrl;

  opcoesAvatar = signal<string[]>([]);
  avatarSelecionado = signal<string>('');
  mensagemAvatar = signal('');
  erroAvatar = signal(false);

  mensagemNome = signal('');
  erroNome = signal(false);

  mensagemSenha = signal('');
  erroSenha = signal(false);

  formNome = this.fb.nonNullable.group({
    nome: [this.auth.perfil()?.nome ?? '', Validators.required],
  });

  formSenha = this.fb.nonNullable.group({
    senhaAtual: ['', Validators.required],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', Validators.required],
  });

  constructor() {
    const seedAtual = this.avatarSeedSalva();
    this.avatarSelecionado.set(seedAtual);
    this.gerarOpcoes();
  }

  avatarSeedSalva(): string {
    return this.auth.perfil()?.avatarSeed || this.auth.usuario()?.uid || '';
  }

  avatarAtual(): string {
    return avatarUrl(this.avatarSelecionado() || this.avatarSeedSalva());
  }

  gerarOpcoes(): void {
    const atual = this.avatarSeedSalva();
    const novas = Array.from({ length: 5 }, () => seedAleatoria());
    this.opcoesAvatar.set([atual, ...novas]);
  }

  selecionarAvatar(seed: string): void {
    this.avatarSelecionado.set(seed);
  }

  async salvarAvatar(): Promise<void> {
    this.mensagemAvatar.set('');
    try {
      await this.auth.atualizarPerfil({ avatarSeed: this.avatarSelecionado() });
      this.erroAvatar.set(false);
      this.mensagemAvatar.set('Avatar atualizado!');
    } catch (e) {
      this.erroAvatar.set(true);
      this.mensagemAvatar.set(e instanceof Error ? e.message : 'Não foi possível salvar o avatar.');
    }
  }

  async salvarNome(): Promise<void> {
    if (this.formNome.invalid) return;
    this.mensagemNome.set('');
    try {
      await this.auth.atualizarPerfil({ nome: this.formNome.getRawValue().nome });
      this.erroNome.set(false);
      this.mensagemNome.set('Nome atualizado!');
    } catch (e) {
      this.erroNome.set(true);
      this.mensagemNome.set(e instanceof Error ? e.message : 'Não foi possível salvar o nome.');
    }
  }

  async salvarSenha(): Promise<void> {
    if (this.formSenha.invalid) return;
    this.mensagemSenha.set('');
    const { senhaAtual, novaSenha, confirmarSenha } = this.formSenha.getRawValue();

    if (novaSenha !== confirmarSenha) {
      this.erroSenha.set(true);
      this.mensagemSenha.set('As senhas não coincidem.');
      return;
    }

    try {
      await this.auth.alterarSenha(senhaAtual, novaSenha);
      this.erroSenha.set(false);
      this.mensagemSenha.set('Senha alterada com sucesso!');
      this.formSenha.reset({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (e) {
      this.erroSenha.set(true);
      this.mensagemSenha.set(this.mensagemErroSenha(e));
    }
  }

  private mensagemErroSenha(e: unknown): string {
    const codigo = e instanceof FirebaseError ? e.code : '';
    const mapa: Record<string, string> = {
      'auth/invalid-credential': 'Senha atual incorreta.',
      'auth/wrong-password': 'Senha atual incorreta.',
      'auth/weak-password': 'A nova senha é muito fraca (mínimo 6 caracteres).',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    };
    return mapa[codigo] ?? 'Não foi possível alterar a senha.';
  }
}
