import { Injectable } from '@angular/core';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ConvitePublico } from '../models/models';

// Sem 0/O e 1/I — evita confusão ao ler o código em voz alta ou escrito à mão.
const CHARSET_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function gerarToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

function gerarCodigo(): string {
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += CHARSET_CODIGO[Math.floor(Math.random() * CHARSET_CODIGO.length)];
  }
  return codigo;
}

@Injectable({ providedIn: 'root' })
export class ConvitesService {
  /**
   * Busca os dados públicos de um convite pelo token — leitura única (sem realtime),
   * é a única coisa que a tela de cadastro pode ler antes do login. Nunca inclui o código.
   */
  async resolver(token: string): Promise<ConvitePublico | null> {
    const snap = await getDoc(doc(db, 'convites', token));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as ConvitePublico;
  }

  /**
   * Gera um novo link (token) e código de autorização para a turma, e grava o
   * código na própria turma (só admin lê). Se `tokenAntigo` for informado, o
   * convite anterior é removido — invalidando o link/código anteriores.
   */
  async gerar(turmaId: string, turmaNome: string, tokenAntigo?: string): Promise<{ token: string; codigo: string }> {
    if (tokenAntigo) {
      await deleteDoc(doc(db, 'convites', tokenAntigo)).catch(() => {});
    }

    const token = gerarToken();
    const codigo = gerarCodigo();

    await setDoc(doc(db, 'convites', token), { turmaId, turmaNome, ativo: true });
    await updateDoc(doc(db, 'turmas', turmaId), { conviteToken: token, codigoConvite: codigo });

    return { token, codigo };
  }
}
