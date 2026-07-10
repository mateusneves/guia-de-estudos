// Script de migração/seed: popula o Firestore com os dados que hoje estão
// hardcoded em src/app/data/curso.data.ts (disciplinas, horários e avaliações),
// criando a turma "Turma Seminário" com o período "3º Ano · 1º Semestre 2026" em curso.
//
// É idempotente: sempre limpa as coleções turmas/periodos/disciplinas/avaliacoes
// antes de semear de novo — só use antes de existirem usuários/progresso reais,
// já que usuarios/progresso não são tocados por este script (se já existir gente
// cadastrada, o script se recusa a rodar; use --force para insistir mesmo assim).
//
// Como rodar:
//   1. Baixe a chave da service account em:
//      Firebase Console → Configurações do projeto → Contas de serviço → Gerar nova chave privada
//   2. Salve o arquivo JSON baixado como scripts/service-account.json (não commitar!)
//   3. Rode: npm run seed

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DISCIPLINAS } from '../src/app/data/curso.data';

const caminhoServiceAccount = join(__dirname, 'service-account.json');
const serviceAccount = JSON.parse(readFileSync(caminhoServiceAccount, 'utf-8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function limparColecao(nome: string): Promise<void> {
  const snap = await db.collection(nome).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  console.log(`Coleção "${nome}" limpa (${snap.size} documento(s)).`);
}

async function verificarSeguranca(): Promise<void> {
  if (process.argv.includes('--force')) return;
  const usuarios = await db.collection('usuarios').get();
  if (usuarios.empty) return;
  console.error(
    `Já existem ${usuarios.size} usuário(s) cadastrado(s). Rodar o seed apagaria a turma/período ` +
    `que essas contas referenciam (usuarios/progresso não são recriados por este script).`
  );
  console.error('Se você tem certeza que quer apagar tudo mesmo assim, rode: npm run seed -- --force');
  process.exit(1);
}

/** Deriva um título curto a partir da descrição longa, só usado para as avaliações antigas (sem campo `nome` próprio). */
function derivarNome(descricao: string): string {
  const antesDoTraco = descricao.split(' — ')[0].trim();
  if (antesDoTraco.length <= 60) return antesDoTraco;
  return antesDoTraco.slice(0, 57).trim() + '...';
}

async function seed(): Promise<void> {
  await verificarSeguranca();

  for (const nome of ['disciplinas', 'avaliacoes', 'periodos', 'turmas']) {
    await limparColecao(nome);
  }

  const turmaRef = db.collection('turmas').doc();
  await turmaRef.set({
    nome: 'Turma Seminário',
    ativa: true,
    criadoEm: new Date().toISOString(),
  });
  console.log(`Turma criada: ${turmaRef.id}`);

  const periodoRef = db.collection('periodos').doc();
  await periodoRef.set({
    turmaId: turmaRef.id,
    nome: '3º Ano · 1º Semestre 2026',
    anoSemestre: '2026.1',
    ativo: true,
    criadoEm: new Date().toISOString(),
  });
  console.log(`Período criado (em curso): ${periodoRef.id}`);

  for (const disciplina of DISCIPLINAS) {
    const { avaliacoes, ...dadosDisciplina } = disciplina;

    await db.collection('disciplinas').doc(disciplina.id).set({
      ...dadosDisciplina,
      periodoId: periodoRef.id,
    });
    console.log(`  Disciplina: ${disciplina.codigo} - ${disciplina.nome}`);

    for (const avaliacao of avaliacoes) {
      await db.collection('avaliacoes').doc(avaliacao.id).set({
        ...avaliacao,
        nome: derivarNome(avaliacao.descricao),
        periodoId: periodoRef.id,
      });
    }
    console.log(`    ${avaliacoes.length} avaliação(ões) migradas.`);
  }

  console.log('\nSeed concluído.');
  console.log('Cadastre-se pelo app selecionando a turma "Turma Seminário".');
}

seed().catch(err => {
  console.error('Erro ao rodar o seed:', err);
  process.exit(1);
});
