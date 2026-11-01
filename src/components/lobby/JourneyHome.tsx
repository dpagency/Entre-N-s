import { useEffect, useId, useRef, useState } from 'react';
import { JOURNEYS, isJourneyAvailable } from '../../data/journeys';
import { browserStorage } from '../../services/browserStorage';
import { savedJourneyAttempts } from '../../services/journeySelection';
import type { SavedAttempt } from '../../services/journeyStorage';
import { socketService } from '../../services/socket';
import { CityImage } from '../board/CityImage';
import { WelcomeScreen } from './WelcomeScreen';

export function JourneyHome() {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [launch, setLaunch] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Record<string, SavedAttempt[]>>({});
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try { setAttempts(Object.fromEntries(JOURNEYS.map(j => [j.id, savedJourneyAttempts(browserStorage, j.id)]))); }
    catch { setError('Não foi possível ler as partidas salvas. Os registros foram preservados; não inicie outra partida antes de verificar o armazenamento.'); }
    finally { setLoaded(true); }
  }, []);
  useEffect(() => { if (!launch) heading.current?.focus(); }, [launch]);

  if (launch) return <WelcomeScreen journeyDefinitionId={launch} onBack={() => setLaunch(null)} />;
  const buttonClass = 'min-h-12 rounded-xl px-5 py-3 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300';
  return <div className="mx-auto w-full max-w-5xl space-y-6 text-slate-100">
    <header className="space-y-3 text-center">
      <h1 ref={heading} tabIndex={-1} className="text-3xl sm:text-4xl font-black focus:outline-none">Entre Nós — Cidade dos Encontros</h1>
      <p className="text-base sm:text-lg text-slate-300">Cada jornada abre caminhos para refletir sobre a convivência ética.</p>
      <CityImage className="mx-auto block h-auto w-full max-w-full rounded-2xl border border-slate-700 object-contain" />
      <h2 className="text-2xl font-bold">Escolha sua jornada</h2>
      <p className="text-base text-slate-300">Explore as jornadas disponíveis ou continue de onde parou. Seu progresso fica salvo separadamente.</p>
    </header>
    {error && <p role="alert" className="rounded-xl border border-amber-400 p-4">{error}</p>}
    <div role="group" aria-label="Jornadas educativas" aria-busy={!loaded} className="space-y-3">
      {JOURNEYS.map((journey, index) => {
        const expanded = open === journey.id;
        const available = isJourneyAvailable(journey);
        const saved = attempts[journey.id] || [];
        const latest = saved[0];
        const room = latest?.snapshot.rooms[0][1];
        const completed = !!room && ['GAME_SUMMARY', 'FEEDBACK'].includes(room.phase) && journey.missionIds.length > 0 && journey.missionIds.every(m => room.completedMissionIds.includes(m));
        const panelId = `${id}-${journey.id}-panel`;
        const titleId = `${id}-${journey.id}-title`;
        return <section key={journey.id} data-journey={journey.id} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
          <div className="grid items-center gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
          <div className={`min-w-0 space-y-2 lg:flex lg:flex-wrap lg:items-center lg:gap-x-5 lg:gap-y-2 lg:space-y-0 ${!available ? 'lg:col-span-2' : ''}`}>
          <h3 className="lg:shrink-0">
            <button type="button" ref={node => { triggers.current[index] = node; }} id={titleId}
              aria-expanded={expanded} aria-controls={panelId}
              onClick={() => { setOpen(expanded ? null : journey.id); browserStorage.setItem('entre-nos-selected-journey', journey.id); }}
              onKeyDown={event => {
                const next = event.key === 'ArrowDown' ? (index + 1) % JOURNEYS.length
                  : event.key === 'ArrowUp' ? (index - 1 + JOURNEYS.length) % JOURNEYS.length
                  : event.key === 'Home' ? 0 : event.key === 'End' ? JOURNEYS.length - 1 : null;
                if (next !== null) { event.preventDefault(); triggers.current[next]?.focus(); }
              }}
              aria-label={`${expanded ? 'Ocultar' : 'Ver'} informações de ${journey.title}`}
              className="flex min-h-12 w-full items-center justify-between gap-4 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300 lg:w-auto">
              <span className="min-w-0 break-words text-xl font-black">{journey.title}</span>
              <span aria-hidden="true" className="shrink-0 text-2xl">{expanded ? '−' : '+'}</span>
            </button>
          </h3>
          <p className="min-w-0 text-base leading-relaxed text-slate-200 lg:min-w-48 lg:flex-1">{journey.description}</p>
          <div className="space-y-1 lg:ml-auto lg:max-w-48 lg:shrink-0">
          <p className={`text-sm font-semibold ${available ? 'text-teal-200' : 'text-amber-200'}`}>{available ? (journey.localOnly ? 'Disponível · teste local' : 'Disponível') : 'Em desenvolvimento'}</p>
          {room && <p data-journey-progress className="text-sm font-bold text-teal-200">{completed ? 'Jornada concluída' : 'Jornada em andamento'} · {journey.missionIds.filter(m => room.completedMissionIds.includes(m)).length} de {journey.missionIds.length} missões concluídas</p>}
          </div>
          </div>
          {available && <div data-journey-actions className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
            {latest && <button type="button" disabled={!loaded || !!error} onClick={() => socketService.resumeAttempt(journey.id, latest.attempt)} className={`${buttonClass} bg-teal-400 text-slate-950 disabled:opacity-50`}>{completed ? 'Ver resumo' : 'Retomar'}</button>}
            <button type="button" data-start-journey disabled={!loaded || !!error} onClick={() => {
              if (!latest || window.confirm('Recomeçar esta jornada? Uma nova tentativa será criada. Sua partida anterior continuará salva.')) setLaunch(journey.id);
            }} className={`${buttonClass} ${latest ? 'border border-teal-400 text-teal-200' : 'bg-teal-400 text-slate-950'} disabled:opacity-50`}>{latest ? 'Recomeçar' : 'Começar'}</button>
          </div>}
          </div>
          <div id={panelId} role="region" aria-labelledby={titleId} hidden={!expanded} className="space-y-4 border-t border-slate-700 p-5">
            {!available ? <>
              <p className="text-base text-amber-100">Em revisão editorial. O acesso será liberado após a aprovação do roteiro completo.</p>
              {journey.plannedMissions && <ol className="list-decimal space-y-3 pl-6">{journey.plannedMissions.map(m => <li key={m.id}><strong>{m.title}</strong><span className="block text-sm text-slate-300">{m.theme}</span></li>)}</ol>}
            </> : <>
              <p className="text-base text-slate-300">Seu avatar representa você, sem determinar suas decisões. As regras continuam disponíveis no menu superior.</p>
              {saved.length > 1 && <div className="space-y-3 border-t border-slate-700 pt-4">
                <h4 className="font-bold">Partidas anteriores preservadas</h4>
                <ul className="space-y-2">{saved.slice(1).map((record, i) => {
                  const prior = record.snapshot.rooms[0][1];
                  const count = journey.missionIds.filter(m => prior.completedMissionIds.includes(m)).length;
                  return <li key={record.attempt}><button type="button" disabled={!loaded || !!error} onClick={() => socketService.resumeAttempt(journey.id, record.attempt)} className={`${buttonClass} w-full border border-slate-600 text-left text-slate-200`}>Retomar partida anterior {saved.length - i - 1} · {count} de {journey.missionIds.length} missões concluídas</button></li>;
                })}</ul>
              </div>}
            </>}
          </div>
        </section>;
      })}
    </div>
  </div>;
}
