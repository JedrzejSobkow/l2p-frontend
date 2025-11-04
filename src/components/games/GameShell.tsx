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
    <div className="relative flex min-h-[calc(100vh-6rem)] w-full items-center justify-center overflow-hidden px-6 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
      </div>
      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-8">
        <div className="rounded-[32px] border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-md transition">
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
    </div>
  )
}

export default GameShell
