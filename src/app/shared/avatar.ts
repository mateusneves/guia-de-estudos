/**
 * URL do avatar (DiceBear, estilo Open Peeps) gerado a partir de uma seed — mesma seed
 * sempre gera a mesma imagem, desde que os mesmos parâmetros sejam usados em toda
 * renderização (por isso `comBarba` também é persistido em `Usuario.avatarComBarba`,
 * não é só um filtro visual da tela de escolha — ver perfil.component.ts).
 */
export function avatarUrl(seed: string, comBarba = false): string {
  const params = new URLSearchParams({ seed });
  if (comBarba) {
    // Sem isso, barba/bigode aparece raramente no estilo Open Peeps (probabilidade
    // baixa por padrão) — sobe pra 100% quando o usuário pede pra priorizar esse traço.
    params.set('facialHairProbability', '100');
  }
  return `https://api.dicebear.com/9.x/open-peeps/svg?${params.toString()}`;
}

/** Gera uma seed aleatória para oferecer novas opções de avatar. */
export function seedAleatoria(): string {
  return Math.random().toString(36).slice(2, 10);
}
