export type DialoguePage = { start: number; end: number };
type Turn = { speaker: string; text: string };
const words = (text: string) => text.trim().split(/\s+/).length;

/** Keep original turn offsets: old saves still identify the same passage. */
export function dialoguePages(turns: readonly Turn[], wordLimit = 70): DialoguePage[] {
  const pages: DialoguePage[] = [];
  const count = (page: DialoguePage) => turns.slice(page.start, page.end + 1).reduce((sum, turn) => sum + words(turn.text), 0);
  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const last = pages.at(-1);
    // The original decision prompt follows the final exchange without another click.
    if (turn.speaker === 'Pergunta ao jogador' && last && count(last) + words(turn.text) <= wordLimit) {
      last.end = i; continue;
    }
    const next = turns[i + 1];
    const sameSection = next && next.speaker !== 'Pergunta ao jogador'
      && (turn.speaker === 'Contexto') === (next.speaker === 'Contexto');
    const end = sameSection && words(turn.text) + words(next.text) <= wordLimit ? i + 1 : i;
    pages.push({ start: i, end }); i = end;
  }
  return pages;
}

export function dialoguePageIndex(pages: readonly DialoguePage[], position: number): number {
  const index = pages.findIndex(page => position >= page.start && position <= page.end);
  return index < 0 ? 0 : index;
}
