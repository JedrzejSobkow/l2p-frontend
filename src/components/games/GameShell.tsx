import { useCallback } from "react"
import type { GameClientModule } from "./GameClientModule"

export type GamePlayer = {
  userId: string
  nickname: string
}

type GameShellProps = {
  module: GameClientModule
  state: unknown
  players: GamePlayer[]
  localPlayerId: string
  lastMove?: unknown
  isMyTurn: boolean
  onProposeMove: (move: unknown) => void
}

const GameShell = ({
  module,
  state,
  players,
  localPlayerId,
  lastMove,
  isMyTurn,
  onProposeMove,
}: GameShellProps) => {
  const handleProposeMove = useCallback(
    (move: unknown) => {
      if (!module.validateLocalMove || module.validateLocalMove(state, move, localPlayerId)) {
        onProposeMove(move)
      }
    },
    [module, onProposeMove, state, localPlayerId],
  )

  const ViewComponent = module.GameView

  return (
    <div className="relative h-full text-white">
        <div className="border border-white/10 bg-white/5 px-3 py-3 h-full rounded-2xl">
          <ViewComponent
            state={state}
            players={players}
            localPlayerId={localPlayerId}
            lastMove={lastMove}
            isMyTurn={isMyTurn}
            onProposeMove={handleProposeMove}
          />
        </div>
    </div>
  )
}

export default GameShell
