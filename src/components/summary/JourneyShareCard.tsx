import React, { useState } from 'react';
import { CHARACTERS } from '../../data/characters';
import type { CharacterId } from '../../types/game';

interface Props { guardianId: CharacterId; playerAvatarIndex: number; }

const REFLECTION = 'Nem sempre escolhemos o mesmo caminho. Mas podemos aprender a caminhar juntos.';
const PLAYER_AVATARS = ['exploradora', 'observador', 'construtora', 'estrategista'];
const GUARDIAN_FILES: Record<CharacterId, string> = { alex: 'rin', joana: 'wa', ravi: 'satori', bia: 'yuki' };
const playerImage = (index: number) => '/personagens/avatar_' + PLAYER_AVATARS[index % PLAYER_AVATARS.length] + '_corpo.png';
const guardianImage = (id: CharacterId) => '/personagens/' + GUARDIAN_FILES[id] + '_corpo.png';
async function loadPortrait(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Não foi possível carregar a ilustração.')); image.src = src; });
  return image;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export const JourneyShareCard: React.FC<Props> = ({ guardianId, playerAvatarIndex }) => {
  const [message, setMessage] = useState('');
  const guardian = CHARACTERS[guardianId];

  const createImage = async (): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Seu navegador não permite criar a imagem.');
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#0a3d38'); gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1080, 1080);
    ctx.strokeStyle = '#b5d8c6'; ctx.lineWidth = 5; ctx.strokeRect(42, 42, 996, 996);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d9f5e8'; ctx.font = 'bold 76px Georgia, serif'; ctx.fillText('Entre Nós', 540, 152);
    ctx.font = '30px sans-serif'; ctx.fillText('GUARDIÕES DA CONVIVÊNCIA', 540, 210);
    ctx.fillStyle = '#164e49'; ctx.beginPath(); ctx.arc(340, 420, 160, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e0f2fe'; ctx.beginPath(); ctx.arc(740, 420, 160, 0, Math.PI * 2); ctx.fill();
    const [playerPortrait, guardianPortrait] = await Promise.all([loadPortrait(playerImage(playerAvatarIndex)), loadPortrait(guardianImage(guardianId))]);
    ctx.drawImage(playerPortrait, 195, 270, 290, 330);
    ctx.drawImage(guardianPortrait, 595, 270, 290, 330);
    ctx.fillStyle = '#d9f5e8'; ctx.font = 'bold 36px sans-serif'; ctx.fillText('Minha jornada', 340, 625);
    ctx.fillText(guardian.name, 740, 625);
    ctx.font = '27px sans-serif'; ctx.fillText('Meu Guardião', 740, 664);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 41px Georgia, serif';
    const lines = wrapLines(ctx, '“' + REFLECTION + '”', 890);
    lines.forEach((line, i) => ctx.fillText(line, 540, 770 + i * 54));
    ctx.font = '27px sans-serif'; ctx.fillStyle = '#a7f3d0';
    ctx.fillText('E você, que caminhos escolheria?', 540, 945);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Não foi possível gerar a imagem.')), 'image/png'));
  };

  const download = async () => {
    try {
      const blob = await createImage();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'entre-nos-minha-jornada.png';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Imagem pronta para salvar ou compartilhar.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível criar a imagem.'); }
  };

  const share = async () => {
    try {
      const blob = await createImage();
      const file = new File([blob], 'entre-nos-minha-jornada.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Entre Nós — Guardiões da Convivência', text: REFLECTION });
        setMessage('Compartilhamento aberto.');
      } else {
        await download();
        setMessage('Seu navegador não permite compartilhar a imagem diretamente. Salve-a e compartilhe pelo aplicativo desejado.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setMessage(error instanceof Error ? error.message : 'Não foi possível compartilhar.');
    }
  };

  const invite = async () => {
    const url = window.location.origin + '/';
    const text = 'Venha conhecer o Entre Nós — Guardiões da Convivência. Que caminhos você escolheria?';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Entre Nós — Guardiões da Convivência', text, url });
        setMessage('Convite pronto para compartilhar.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text + '\n' + url);
        setMessage('Convite copiado. Envie para quem quiser convidar.');
      } else {
        setMessage('Compartilhe este endereço: ' + url);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(text + '\n' + url);
        setMessage('Convite copiado. Envie para quem quiser convidar.');
      } catch {
        setMessage('Compartilhe este endereço: ' + url);
      }
    }
  };

  return <section className="rounded-3xl border border-teal-500/40 bg-slate-900 p-5 space-y-4" aria-label="Compartilhe sua jornada">
    <h2 className="text-xl font-black text-teal-200">Compartilhe sua jornada</h2>
    <p className="text-sm text-slate-300">Uma lembrança com seu avatar e o Guardião que acompanhou você, sem revelar decisões ou pontuações.</p>
    <div className="rounded-2xl bg-gradient-to-br from-teal-950 to-slate-950 border border-teal-600/40 p-5 text-center space-y-3">
      <h3 className="text-2xl font-black text-teal-100">Entre Nós</h3>
      <p className="text-xs tracking-wide text-teal-200">GUARDIÕES DA CONVIVÊNCIA</p>
      <div className="flex items-center justify-center gap-8">
        <div className="flex-1 min-w-0"><img src={playerImage(playerAvatarIndex)} alt="Seu avatar" className="h-44 sm:h-60 w-full object-contain" /><p className="text-xs mt-2">Você</p></div>
        <div className="flex-1 min-w-0"><img src={guardianImage(guardianId)} alt={guardian.name} className="h-44 sm:h-60 w-full object-contain" /><p className="text-xs mt-2">{guardian.name} · seu Guardião</p></div>
      </div>
      <p className="font-semibold text-lg text-white">“{REFLECTION}”</p>
      <p className="text-sm text-teal-200">E você, que caminhos escolheria?</p>
    </div>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={share} className="flex-1 rounded-xl bg-teal-500 px-4 py-3 font-bold text-slate-950">Compartilhar imagem</button>
      <button type="button" onClick={download} className="flex-1 rounded-xl border border-teal-500/50 px-4 py-3 font-bold text-teal-100">Salvar imagem</button>
      <button type="button" onClick={() => { void invite(); }} className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm">Convidar alguém para jogar</button>
    </div>
    {message && <p role="status" className="text-xs text-teal-200">{message}</p>}
  </section>;
};
