import { useId, useState } from 'react';
import type { MissionDef, SanitizedRoomState } from '../../types/game';
import { PlayerAvatar } from '../characters/PlayerAvatar';
import { socketService } from '../../services/socket';

export function ParticipantReveal({ state, mission, myPlayerId }: { state: SanitizedRoomState; mission: MissionDef; myPlayerId: string }) {
  const [details, setDetails] = useState(false);
  const reviewId = useId();
  const participants = Object.values(state.players).filter(p => p.id === myPlayerId || p.isBot);
  return <div className="w-full max-w-5xl mx-auto space-y-5">
    <section className="rounded-3xl border border-teal-500/50 bg-slate-900 p-5 sm:p-8 space-y-3">
      <p className="text-sm text-teal-200">{mission.title}</p><h1 className="text-3xl font-black">Diferentes escolhas, novos olhares</h1>
      <p className="text-base text-slate-200">Sua decisão permanece registrada. Os outros três avatares fizeram escolhas independentes, sem perfis fixos ou pontuação por concordância.</p>
    </section>
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Escolhas dos quatro participantes">
      {participants.map(participant => {
        const action = mission.actions.find(a => a.id === state.revealedIndividualChoices?.[participant.id]);
        return <article key={participant.id} className={`rounded-2xl border p-5 space-y-3 text-center ${participant.id === myPlayerId ? 'border-teal-400 bg-teal-950/40' : 'border-slate-700 bg-slate-900'}`}>
          <PlayerAvatar index={participant.variantIndex} name={participant.id === myPlayerId ? 'Seu avatar' : participant.nickname} />
          <h2 className="text-xl font-bold">{participant.id === myPlayerId ? `${participant.nickname} · você` : participant.nickname}</h2>
          {participant.isBot && <p className="text-sm text-slate-400">Participante virtual</p>}
          <p className="font-bold text-teal-200">{action?.title}</p>
        </article>;
      })}
    </section>
    <button type="button" aria-expanded={details} aria-controls={reviewId} onClick={() => setDetails(v => !v)} className={`rounded-xl border-2 px-5 py-3 font-bold text-teal-200 ${details ? 'border-teal-400 bg-teal-950' : 'border-slate-600 bg-slate-900'}`}>{details ? 'Ocultar detalhes' : 'Rever detalhes das alternativas'}</button>
    <section id={reviewId} hidden={!details} aria-label="Revisão das alternativas" className="rounded-2xl border border-teal-400 bg-slate-900 p-5 space-y-4">
      <h2 className="text-xl font-bold text-teal-200">Todas as alternativas desta missão</h2>
      <p className="text-base text-slate-300">Consulta para reflexão. Sua decisão já está registrada e não será alterada.</p>
      {mission.actions.map(action => <article key={action.id} className="border-t border-slate-600 pt-4 space-y-2"><h3 className="text-lg font-bold">{action.title}</h3><p data-narration="story" className="text-base">{action.description}</p></article>)}
    </section>
    <button type="button" onClick={() => socketService.send({ type: 'OPEN_COLLECTIVE_VOTE' })} className="w-full rounded-xl bg-teal-400 p-4 font-black text-slate-950">Ver o que aconteceu</button>
  </div>;
}
