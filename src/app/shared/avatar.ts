/** URL do avatar (DiceBear, estilo Open Peeps) gerado a partir de uma seed — mesma seed sempre gera a mesma imagem. */
export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/open-peeps/svg?seed=${encodeURIComponent(seed)}`;
}

/** Gera uma seed aleatória para oferecer novas opções de avatar. */
export function seedAleatoria(): string {
  return Math.random().toString(36).slice(2, 10);
}
