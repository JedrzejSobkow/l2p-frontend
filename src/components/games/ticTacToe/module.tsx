import { useCallback, useMemo } from "react"
import { Application, extend } from "@pixi/react"
import { Container, Graphics, Text, TextStyle, type Graphics as PixiGraphics } from "pixi.js"
import type { GameClientModule } from "../GameClientModule"

extend({ Container, Graphics, Text })

type PlayerMark = "X" | "O"
type CellValue = PlayerMark | null

type TicTacToeState = {
  board: CellValue[]
  nextPlayerId?: string
  winnerId?: string | null
  winningCombination?: number[]
  draw?: boolean
}

type TicTacToeMove =
  | { position: number }
  | { index: number }

const BOARD_SIZE = 9
const CELL_SIZE = 120
const BOARD_PIXELS = CELL_SIZE * 3
const BORDER_RADIUS = 24

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null

const parseBoard = (raw: unknown): CellValue[] => {
  if (Array.isArray(raw) && raw.length === BOARD_SIZE) {
    return raw.map((cell) => (cell === "X" || cell === "O" ? cell : null))
  }
  if (isRecord(raw) && Array.isArray(raw.board) && raw.board.length === BOARD_SIZE) {
    return raw.board.map((cell) => (cell === "X" || cell === "O" ? cell : null))
  }
  return Array<CellValue>(BOARD_SIZE).fill(null)
}

const parseState = (rawState: unknown): TicTacToeState => {
  const board = parseBoard(rawState)

  let nextPlayerId: string | undefined
  let winnerId: string | null | undefined
  let winningCombination: number[] | undefined
  let draw: boolean | undefined

  if (isRecord(rawState)) {
    if (typeof rawState.nextPlayerId === "string") nextPlayerId = rawState.nextPlayerId
    if (typeof rawState.currentPlayerId === "string") nextPlayerId = rawState.currentPlayerId
    if (typeof rawState.winnerId === "string") winnerId = rawState.winnerId
    if (rawState.winnerId === null) winnerId = null
    if (
      Array.isArray(rawState.winningCombination) &&
      rawState.winningCombination.every((idx) => typeof idx === "number")
    ) {
      winningCombination = rawState.winningCombination as number[]
    }
    if (typeof rawState.draw === "boolean") draw = rawState.draw
  }

  return { board, nextPlayerId, winnerId, winningCombination, draw }
}

const deriveMarks = (players: Array<{ userId: string; nickname: string }>): Record<string, PlayerMark> => {
  const assignments: Record<string, PlayerMark> = {}
  if (players[0]) assignments[players[0].userId] = "X"
  if (players[1]) assignments[players[1].userId] = "O"
  return assignments
}

const calculateWinner = (board: CellValue[], marksByPlayer: Record<string, PlayerMark>) => {
  for (const line of WIN_LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      const mark = board[a]
      const winnerId =
        Object.entries(marksByPlayer).find(([, assignedMark]) => assignedMark === mark)?.[0]
      return { winnerId, line, draw: false as const }
    }
  }
  const isDraw = board.every((cell) => cell !== null)
  return { winnerId: undefined, line: undefined, draw: isDraw }
}

const resolveState = (
  rawState: unknown,
  players: Array<{ userId: string; nickname: string }>,
): TicTacToeState & { marksByPlayer: Record<string, PlayerMark> } => {
  const base = parseState(rawState)
  const marksByPlayer = deriveMarks(players)

  const { winnerId, line, draw } = calculateWinner(base.board, marksByPlayer)
  const boardDraw = draw || base.draw

  const xCount = base.board.filter((cell) => cell === "X").length
  const oCount = base.board.filter((cell) => cell === "O").length
  const nextMark: PlayerMark = xCount === oCount ? "X" : "O"
  const inferredNextPlayerId =
    Object.entries(marksByPlayer).find(([, mark]) => mark === nextMark)?.[0] ?? base.nextPlayerId

  return {
    board: base.board,
    nextPlayerId: base.nextPlayerId ?? inferredNextPlayerId,
    winnerId: winnerId ?? base.winnerId,
    winningCombination: line ?? base.winningCombination,
    draw: boardDraw,
    marksByPlayer,
  }
}

const isTicTacToeMove = (move: unknown): move is TicTacToeMove => {
  if (!isRecord(move)) return false
  if ("position" in move && typeof move.position === "number") return Number.isInteger(move.position)
  if ("index" in move && typeof move.index === "number") return Number.isInteger(move.index)
  return false
}

const extractMoveIndex = (move: TicTacToeMove): number => ("index" in move ? move.index : move.position)

const TicTacToeView: GameClientModule["GameView"] = ({
  state: rawState,
  players,
  localPlayerId,
  lastMove,
  isMyTurn,
  onProposeMove,
}) => {
  const resolved = useMemo(() => resolveState(rawState, players), [rawState, players])

  const handleCellClick = useCallback(
    (index: number) => {
      if (!isMyTurn) return
      if (resolved.board[index] !== null) return
      if (resolved.winnerId !== undefined || resolved.draw) return
      onProposeMove({ position: index })
    },
    [isMyTurn, onProposeMove, resolved.board, resolved.draw, resolved.winnerId],
  )

  const localMark = resolved.marksByPlayer[localPlayerId]
  const status = useMemo(() => {
    if (resolved.winnerId) {
      const winner =
        players.find((player) => player.userId === resolved.winnerId)?.nickname ?? "Unknown player"
      return `${winner} wins!`
    }
    if (resolved.draw) {
      return "Draw!"
    }
    const nextPlayer =
      players.find((player) => player.userId === resolved.nextPlayerId)?.nickname ?? "Waiting..."
    return resolved.nextPlayerId === localPlayerId ? "Your turn" : `${nextPlayer}'s turn`
  }, [localPlayerId, players, resolved.draw, resolved.nextPlayerId, resolved.winnerId])

  const lastMoveIndex = useMemo(() => {
    if (isTicTacToeMove(lastMove) && resolved.board[extractMoveIndex(lastMove)] !== null) {
      return extractMoveIndex(lastMove)
    }
    return undefined
  }, [lastMove, resolved.board])

  const markStyles = useMemo(
    () => ({
      X: new TextStyle({
        fill: 0xffa94d,
        fontFamily: "Poppins, Inter, sans-serif",
        fontWeight: "700",
        fontSize: 72,
      }),
      O: new TextStyle({
        fill: 0x74c0fc,
        fontFamily: "Poppins, Inter, sans-serif",
        fontWeight: "700",
        fontSize: 72,
      }),
    }),
    [],
  )

  const drawGrid = useCallback((g: PixiGraphics) => {
    g.clear()
    g.setStrokeStyle({ width: 6, color: 0xffffff, alpha: 0.35 })
    g.roundRect(0, 0, BOARD_PIXELS, BOARD_PIXELS, BORDER_RADIUS)
    g.stroke()

    g.setStrokeStyle({ width: 4, color: 0xffffff, alpha: 0.25 })
    const offset = CELL_SIZE
    for (let i = 1; i < 3; i += 1) {
      const pos = i * offset
      g.moveTo(pos, 20)
      g.lineTo(pos, BOARD_PIXELS - 20)
      g.moveTo(20, pos)
      g.lineTo(BOARD_PIXELS - 20, pos)
    }
    g.stroke()
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-lg font-semibold text-white">{status}</div>
      <div className="relative rounded-3xl border border-white/10 bg-[rgba(21,20,34,0.65)] p-3 shadow-lg">
        <Application width={BOARD_PIXELS} height={BOARD_PIXELS} backgroundAlpha={0} antialias>
          <pixiContainer x={0} y={0}>
            <pixiGraphics draw={drawGrid} />
            {resolved.board.map((cell, index) => {
              const row = Math.floor(index / 3)
              const col = index % 3
              const isWinningCell = resolved.winningCombination?.includes(index)
              const isLastMove = lastMoveIndex === index && !isWinningCell
              const fillColor = isWinningCell ? 0x37b24d : isLastMove ? 0xffffff : 0x000000
              const fillAlpha = isWinningCell ? 0.35 : isLastMove ? 0.15 : 0.01
              return (
                <pixiContainer key={index} x={col * CELL_SIZE} y={row * CELL_SIZE}>
                <pixiGraphics
                  draw={(g: PixiGraphics) => {
                    g.clear()
                    g.fill({ color: fillColor, alpha: fillAlpha })
                    g.roundRect(10, 10, CELL_SIZE - 20, CELL_SIZE - 20, 18)
                    g.fill()
                  }}
                />
                  {cell && (
                    <pixiText
                      text={cell}
                      anchor={0.5}
                      x={CELL_SIZE / 2}
                      y={CELL_SIZE / 2}
                      style={markStyles[cell]}
                    />
                  )}
                </pixiContainer>
              )
            })}
          </pixiContainer>
        </Application>
        <div className="pointer-events-none absolute inset-3 grid grid-cols-3">
          {resolved.board.map((cell, index) => {
            const disabled =
              !isMyTurn || cell !== null || resolved.winnerId !== undefined || resolved.draw
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleCellClick(index)}
                disabled={disabled}
                className="pointer-events-auto h-full w-full bg-transparent"
              />
            )
          })}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 text-sm text-white/70">
        <div>
          You play as <span className="font-semibold text-white">{localMark ?? "?"}</span>
        </div>
        <div className="flex items-center gap-3">
          {players.map((player, index) => (
            <div key={player.userId} className="flex items-center gap-2">
              <span
                className={
                  resolved.marksByPlayer[player.userId] === "X"
                    ? "text-orange-300"
                    : resolved.marksByPlayer[player.userId] === "O"
                    ? "text-sky-300"
                    : "text-white/60"
                }
              >
                {resolved.marksByPlayer[player.userId] ?? (index === 0 ? "X" : "O")}
              </span>
              <span className="text-white/80">{player.nickname}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const validateLocalMove: NonNullable<GameClientModule["validateLocalMove"]> = (state, move, playerId) => {
  if (!isTicTacToeMove(move)) return false
  const resolved = resolveState(state, [])
  if (resolved.winnerId !== undefined || resolved.draw) return false
  if (resolved.board[extractMoveIndex(move)] !== null) return false
  if (resolved.nextPlayerId && resolved.nextPlayerId !== playerId) return false
  return true
}

const TicTacToeModule: GameClientModule = {
  GameView: TicTacToeView,
  validateLocalMove,
}

export default TicTacToeModule
