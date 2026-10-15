import React, { useEffect, useState } from 'react';
import { MissionDef, RoomState } from '../../types/game';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { socketService } from '../../services/socket';
import { Vote, AlertTriangle, CheckCircle2, ArrowRight, ChevronLeft, BookOpen } from 'lucide-react';

interface MissionCollectiveVoteProps {
  mission: MissionDef;
  state: RoomState;
  myPlayerId: string;
}

export const MissionCollectiveVote: React.FC<MissionCollectiveVoteProps> = ({
  mission,
  state,
  myPlayerId,
}) => {
  const isHost = state.hostId === myPlayerId;
  const myCollectiveVote = state.collectiveVotes[myPlayerId];
  const round = state.collectiveVoteRound;
  // Local analysis never sends a vote. Only the final priority is submitted.
  const [step, setStep] = useState(0);
  const [support, setSupport] = useState<Record<string, boolean>>({});
  const [showDetails, setShowDetails] = useState(false);
  const [review, setReview] = useState(false);
  useEffect(() => {
    setStep(0);
    setSupport({});
    setShowDetails(false);
    setReview(false);
  }, [mission.id, round]);
  const action = mission.actions[step];

  // Active connected players
  const activePlayers = Object.values(state.players).filter((p) => p.isConnected);
  const totalActive = activePlayers.length;

  // Count votes
  const votesPerAction: Record<string, number> = {};
  mission.actions.forEach((a) => (votesPerAction[a.id] = 0));
  Object.values(state.collectiveVotes).forEach((actId) => {
    if (votesPerAction[actId] !== undefined) {
      votesPerAction[actId]++;
    }
  });

  const totalVoted = Object.keys(state.collectiveVotes).length;

  const handleVote = (actionId: string) => {
    socketService.send({
      type: 'SUBMIT_COLLECTIVE_VOTE',
      actionId,
    });
  };

  const handleContinueWithoutDisconnected = () => {
    socketService.send({
      type: 'CONTINUE_WITHOUT_DISCONNECTED',
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-slate-100">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Vote className="w-3.5 h-3.5 text-amber-400" />
              Fase 4 de 4 • Votação Coletiva da Equipe (Rodada {round})
            </span>
            {round > 1 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Segunda Rodada (Reconsideração)
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400">
            {totalVoted}/{totalActive} Guardiões Votaram
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
          Qual decisão coletiva a Vila dos Encontros tomará?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Analise as possibilidades em sequência e depois escolha uma prioridade. Você pode alterar seu voto antes do encerramento.
        </p>

        {round > 1 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Empate na rodada anterior!</strong> Reavaliem as prioridades antes de votar novamente. Se o empate persistir nesta rodada, a decisão será registrada como não consensual e ambos os caminhos serão ponderados sem favorecer ninguém.
            </span>
          </div>
        )}
      </div>

      {/* Live vote progress bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">
            Status da Votação:
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
            {totalVoted} de {totalActive} votos registrados
          </span>
        </div>

        {/* Player pills */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.values(state.players).map((p) => {
            const hasVoted = !!state.collectiveVotes[p.id];
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                  hasVoted
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
                } ${!p.isConnected ? 'opacity-50' : ''}`}
                title={p.isConnected ? (hasVoted ? 'Votou' : 'Pensando...') : 'Desconectado'}
              >
                <CharacterAvatar characterId={p.characterId} variantIndex={p.variantIndex} size="sm" showBadge={false} />
                <span>{p.nickname}</span>
                <span>{hasVoted ? '✓' : '…'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sequential analysis: only the final choice is transmitted to the engine. */}
      <section className="bg-slate-900 border border-slate-700 rounded-2xl p-5 sm:p-7 space-y-4" aria-label="Análise das ações">
        {!review ? (
          <>
            <div className="flex justify-between items-center text-xs text-teal-300 font-bold">
              <span>Analise uma possibilidade por vez</span>
              <span>Ação {step + 1} de {mission.actions.length}</span>
            </div>
            <div className="flex gap-1.5" aria-hidden="true">
              {mission.actions.map((item, i) => <div key={item.id} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-teal-500' : 'bg-slate-700'}`} />)}
            </div>
            <h3 className="text-lg sm:text-xl font-bold">{action.title}</h3>
            <p className="text-sm text-slate-200 leading-relaxed">{action.description}</p>
            <button type="button" onClick={() => setShowDetails(!showDetails)} aria-expanded={showDetails} className="text-sm text-teal-300 underline underline-offset-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> {showDetails ? 'Ocultar fundamentação' : 'Ler fundamentação'}
            </button>
            {showDetails && <p className="p-3 bg-slate-950 rounded-xl text-sm text-slate-300">{action.justification}</p>}
            <p className="font-semibold text-sm">Você apoiaria esta possibilidade?</p>
            <div className="grid grid-cols-2 gap-3">
              {([true, false] as const).map((value) => (
                <button key={String(value)} type="button" aria-pressed={support[action.id] === value} onClick={() => setSupport((prev) => ({ ...prev, [action.id]: value }))}
                  className={`rounded-xl border px-4 py-3 font-bold ${support[action.id] === value ? 'bg-teal-700 border-teal-300 text-white' : 'bg-slate-800 border-slate-600'}`}>
                  {value ? 'Sim' : 'Não'}
                </button>
              ))}
            </div>
            <div className="flex justify-between gap-3 pt-2">
              <button type="button" disabled={step === 0} onClick={() => { setStep((i) => i - 1); setShowDetails(false); }} className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-40 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Anterior</button>
              <button type="button" disabled={support[action.id] === undefined} onClick={() => { if (step === mission.actions.length - 1) setReview(true); else setStep((i) => i + 1); setShowDetails(false); }} className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold disabled:opacity-40 flex items-center gap-1">
                {step === mission.actions.length - 1 ? 'Comparar e decidir' : 'Próxima'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold">Qual ação você priorizaria para a equipe?</h3>
            <p className="text-sm text-slate-300">Você pode apoiar mais de uma possibilidade ou nenhuma. Para a votação coletiva, escolha uma prioridade. Somente esta escolha será enviada ao jogo.</p>
            <div className="space-y-2">
              {mission.actions.map((item) => (
                <button key={item.id} type="button" onClick={() => handleVote(item.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-colors ${myCollectiveVote === item.id ? 'border-teal-400 bg-teal-950/60' : 'border-slate-700 bg-slate-800 hover:border-teal-500'}`}>
                  <span className="font-bold text-sm">{item.title}</span>
                  <span className="block text-xs text-slate-400 mt-1">{support[item.id] ? 'Você considerou aceitável' : 'Você não apoiou inicialmente'} · {votesPerAction[item.id] || 0} voto(s) registrados</span>
                  {myCollectiveVote === item.id && <span className="text-xs text-teal-300 font-semibold">Seu voto registrado ✓</span>}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => { setReview(false); setStep(0); }} className="text-sm text-teal-300 underline underline-offset-4">Rever possibilidades</button>
          </>
        )}
      </section>

      {/* Footer information and actions */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300">
          {myCollectiveVote ? (
            <span className="text-teal-300 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Seu voto coletivo está registrado! Você pode alterá-lo enquanto a votação estiver aberta.
            </span>
          ) : (
            <span className="text-amber-300 font-medium">
              Analise as possibilidades e escolha uma prioridade para a equipe.
            </span>
          )}
        </div>

        {/* Fallback button if player disconnected */}
        {totalVoted > 0 && totalVoted < totalActive && isHost && (
          <button
            onClick={handleContinueWithoutDisconnected}
            className="px-3 py-2 text-xs text-amber-300 hover:bg-slate-800 rounded-lg transition-colors border border-amber-500/30"
          >
            Apurar com os guardiões ativos conectados
          </button>
        )}
      </div>
    </div>
  );
};
