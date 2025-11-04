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
    <ViewComponent
      state={state}
      players={players}
      localPlayerId={localPlayerId}
      lastMove={lastMove}
      isMyTurn={isMyTurn}
      onProposeMove={handleProposeMove}
    />
  )
}

export default GameShell
