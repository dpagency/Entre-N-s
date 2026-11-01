export function celebrateLearning(key: string) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('entre-nos-learning-celebration', { detail: key }));
}
