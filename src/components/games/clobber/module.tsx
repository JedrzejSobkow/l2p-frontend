import { useMemo } from "react"
import { Application, extend } from "@pixi/react"
import { Container, Graphics, Text, TextStyle, type Graphics as PixiGraphics } from "pixi.js"
import type { GameClientModule } from "../GameClientModule"

extend({ Container, Graphics, Text })

type CellValue = "P1" | "P2" | null

type ClobberState = {
  board: CellValue[][]
}

const DEFAULT_ROWS = 6
const DEFAULT_COLS = 6
const CELL_SIZE = 88
const BOARD_MARGIN = 28
const TOKEN_RADIUS = 26

const BOARD_BG = 0x1d1b2f
const GRID_LINE_COLOR = 0xffffff
const PLAYER_COLORS: Record<Exclude<CellValue, null>, number> = {
  P1: 0xff7a45,
  P2: 0x3c8dff,
}

const parseState = (raw: unknown): ClobberState => {
  if (
    raw &&
    typeof raw === "object" &&
    Array.isArray((raw as any).board) &&
    (raw as any).board.every((row: any) => Array.isArray(row))
  ) {
    return raw as ClobberState
  }

  const board: CellValue[][] = Array.from({ length: DEFAULT_ROWS }, (_, row) =>
    Array.from({ length: DEFAULT_COLS }, () => (row < DEFAULT_ROWS / 2 ? "P1" : "P2")),
  )
  return { board }
}

const ClobberView: GameClientModule["GameView"] = ({
  state,
  players,
  localPlayerId,
  isMyTurn,
}) => {
  const parsed = useMemo(() => parseState(state), [state])
  const rows = parsed.board.length
  const cols = parsed.board[0]?.length ?? 0

  const boardWidth = cols * CELL_SIZE + BOARD_MARGIN * 2
  const boardHeight = rows * CELL_SIZE + BOARD_MARGIN * 2

  const drawBoard = (g: PixiGraphics) => {
    g.clear()
    g.fill({ color: BOARD_BG })
    g.roundRect(0, 0, boardWidth, boardHeight, 36)
    g.fill()

    g.setStrokeStyle({ width: 2, color: GRID_LINE_COLOR, alpha: 0.12 })
    const startX = BOARD_MARGIN
    const startY = BOARD_MARGIN
    for (let r = 0; r <= rows; r += 1) {
      const y = startY + r * CELL_SIZE
      g.moveTo(startX, y)
      g.lineTo(startX + cols * CELL_SIZE, y)
    }
    for (let c = 0; c <= cols; c += 1) {
      const x = startX + c * CELL_SIZE
      g.moveTo(x, startY)
      g.lineTo(x, startY + rows * CELL_SIZE)
    }
    g.stroke()
  }

  const tokenLabelStyles = useMemo(
    () => ({
      P1: new TextStyle({
        fill: 0xffffff,
        fontFamily: "Poppins, Inter, sans-serif",
        fontWeight: "700",
        fontSize: 20,
      }),
      P2: new TextStyle({
        fill: 0xffffff,
        fontFamily: "Poppins, Inter, sans-serif",
        fontWeight: "700",
        fontSize: 20,
      }),
    }),
    [],
  )

  return (
    <div className="flex flex-col gap-6 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Clobber</h2>
          <p className="text-sm text-white/60">
            {isMyTurn ? "Your move" : "Waiting for opponent"}
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: "#ff7a45" }} />
            <span>{players[0]?.nickname ?? "Player 1"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: "#3c8dff" }} />
            <span>{players[1]?.nickname ?? "Player 2"}</span>
          </div>
          <span className="rounded-full border border-white/15 px-4 py-1 text-xs font-semibold text-white/60">
            Playing as {players.find((p) => p.userId === localPlayerId)?.nickname ?? "You"}
          </span>
        </div>
      </header>

      <div className="rounded-[34px] border border-white/10 bg-[rgba(21,20,34,0.65)] p-3 shadow-[0_20px_50px_rgba(12,10,40,0.55)]">
        <Application width={boardWidth} height={boardHeight} backgroundAlpha={0} antialias>
          <pixiContainer x={0} y={0}>
            <pixiGraphics draw={drawBoard} />
            {parsed.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                if (!cell) return null
                const x = BOARD_MARGIN + colIndex * CELL_SIZE + CELL_SIZE / 2
                const y = BOARD_MARGIN + rowIndex * CELL_SIZE + CELL_SIZE / 2
                const label = cell === "P1" ? "◎" : "◉"
                return (
                  <pixiContainer key={`${rowIndex}-${colIndex}`}>
                    <pixiGraphics
                      draw={(g: PixiGraphics) => {
                        g.clear()
                        g.fill({ color: PLAYER_COLORS[cell], alpha: 0.94 })
                        g.circle(x, y, TOKEN_RADIUS)
                        g.fill()
                      }}
                    />
                    <pixiText text={label} anchor={0.5} x={x} y={y} style={tokenLabelStyles[cell]} />
                  </pixiContainer>
                )
              }),
            )}
          </pixiContainer>
        </Application>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
        <h3 className="text-sm font-semibold text-white">How to play (preview)</h3>
        <p className="mt-2 leading-relaxed">
          Each turn, move one of your pieces onto an orthogonally adjacent opponent piece to capture it.
          Whoever cannot move loses. This preview shows only the board rendering – gameplay logic will be added later.
        </p>
      </section>
    </div>
  )
}

const ClobberModule: GameClientModule = {
  GameView: ClobberView,
}

export default ClobberModule
