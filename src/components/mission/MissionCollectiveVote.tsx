import React from 'react';
import { MissionDef, RoomState } from '../../types/game';
import { ActionCard } from '../cards/CardView';
import { CharacterAvatar } from '../characters/CharacterAvatar';
import { socketService } from '../../services/socket';
import { Vote, RefreshCw, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

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
          Qual decisão coletiva a Cidade dos Encontros tomará?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Vocês podem reconsiderar e alterar seu voto a qualquer momento antes do fechamento. O consenso ou a maioria qualificada constrói o desfecho.
        </p>

        {round > 1 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Empate na rodada anterior!</strong> Conversem novamente para alinhar prioridades. Se o empate persistir nesta rodada, a decisão será registrada como não consensual e ambos os caminhos serão ponderados sem favorecer ninguém.
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

      {/* Action cards with dynamic vote count */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mission.actions.map((action) => {
          const isSelected = myCollectiveVote === action.id;
          const count = votesPerAction[action.id] || 0;

          return (
            <ActionCard
              key={action.id}
              action={action}
              isSelected={isSelected}
              onSelect={() => handleVote(action.id)}
              voteCount={count}
            />
          );
        })}
      </div>

      {/* Footer information and actions */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-slate-300">
          {myCollectiveVote ? (
            <span className="text-teal-300 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              Seu voto coletivo está registrado! Você pode alterá-lo se a deliberação em grupo mudar seu ponto de vista.
            </span>
          ) : (
            <span className="text-amber-300 font-medium">
              Escolha a ação coletiva que você apoia para a equipe.
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
