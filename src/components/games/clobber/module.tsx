import { useMemo, useState, useEffect } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Text, TextStyle, type Graphics as PixiGraphics } from "pixi.js";
import type { GameClientModule } from "../GameClientModule";

extend({ Container, Graphics, Text });

const CELL_SIZE = 80;
const BOARD_MARGIN = 20;
const TOKEN_RADIUS = 28;
const BORDER_RADIUS = 24;

const GRID_LINE_COLOR = 0xffffff;
const PLAYER_COLORS = {
  W: 0xffffff,
  B: 0x000000,
};

const parseBoard = (raw: unknown): (string | null)[][] => {
  if (Array.isArray(raw) && raw.every((row) => Array.isArray(row))) {
    return raw.map((row) =>
      row.map((cell) => (cell === "W" || cell === "B" ? cell : null))
    );
  }
  return Array(5).fill(null).map(() => Array(6).fill(null));
};

const ClobberView: GameClientModule["GameView"] = ({
  state: rawState,
  players,
  localPlayerId,
  isMyTurn,
  onProposeMove,
}) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const board = useMemo(() => parseBoard((rawState as any)?.board), [rawState]);
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  const timing = (rawState as any)?.timing;
  const timeoutSeconds = timing?.timeout_seconds;
  const turnStartTime = timing?.turn_start_time;

  const cellSize = useMemo(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) return 50;
    if (screenWidth < 1024) return 65;
    return CELL_SIZE;
  }, []);

  const boardWidth = cols * cellSize + BOARD_MARGIN * 2;
  const boardHeight = rows * cellSize + BOARD_MARGIN * 2;

  useEffect(() => {
    if (timing?.timeout_type === "per_turn" && timeoutSeconds && turnStartTime) {
      const calculateRemainingTime = () => {
        const startTime = new Date(turnStartTime).getTime();
        const elapsedTime = (Date.now() - startTime) / 1000;
        const timeLeft = Math.max(0, timeoutSeconds - elapsedTime);
        setRemainingTime(timeLeft);
      };

      calculateRemainingTime();
      const interval = setInterval(calculateRemainingTime, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingTime(null);
    }
  }, [timing, timeoutSeconds, turnStartTime]);

  const status = useMemo(() => {
    const gameState = rawState as any;
    if (gameState?.result === "draw") {
      return "Draw!";
    }
    if (gameState?.winner_id) {
      const winner = players.find((player) => String(player.userId) === String(gameState.winner_id));
      return `${winner?.nickname ?? "Unknown player"} wins!`;
    }
    if (String(gameState?.current_turn_player_id) === localPlayerId) {
      return "Your turn";
    }
    const nextPlayer = players.find((player) => String(player.userId) === String(gameState?.current_turn_player_id));
    return `${nextPlayer?.nickname ?? "Waiting..."}'s turn`;
  }, [rawState, players, localPlayerId]);

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) return;

    const cell = board[row]?.[col];
    console.log("CLICKED")
    console.log(cell)
    if (!cell) return;

    if (!selectedCell) {
      setSelectedCell({ row, col });
    } else {
      const { row: fromRow, col: fromCol } = selectedCell;
      const isAdjacent =
        (Math.abs(row - fromRow) === 1 && col === fromCol) ||
        (Math.abs(col - fromCol) === 1 && row === fromRow);

      if (isAdjacent && board[row][col] && board[row][col] !== board[fromRow][fromCol]) {
        const moveData = { from_row: fromRow, from_col: fromCol, to_row: row, to_col: col };
        onProposeMove(moveData);
        setSelectedCell(null);
      } else {
        setSelectedCell({ row, col });
      }
    }
  };

  const drawBoard = (g: PixiGraphics) => {
    g.clear();
    g.fill({ color: 0x000000, alpha: 0 });
    g.roundRect(0, 0, boardWidth, boardHeight, BORDER_RADIUS);
    g.fill();

    g.setStrokeStyle({ width: 2, color: GRID_LINE_COLOR, alpha: 0.12 });
    const startX = BOARD_MARGIN;
    const startY = BOARD_MARGIN;
    for (let r = 0; r <= rows; r += 1) {
      const y = startY + r * cellSize;
      g.moveTo(startX, y);
      g.lineTo(startX + cols * cellSize, y);
    }
    for (let c = 0; c <= cols; c += 1) {
      const x = startX + c * cellSize;
      g.moveTo(x, startY);
      g.lineTo(x, startY + rows * cellSize);
    }
    g.stroke();
  };

  const tokenLabelStyles = useMemo(
    () => ({
      W: new TextStyle({
        fill: 0x000000,
        fontFamily: "Poppins, Inter, sans-serif",
        fontWeight: "700",
        fontSize: 20,
      }),
      B: new TextStyle({
        fill: 0xffffff,
        fontFamily: "Poppins, Inter, sans-serif",
        fontWeight: "700",
        fontSize: 20,
      }),
    }),
    []
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center text-lg font-semibold text-white">
        {status}
        <br />
        {remainingTime !== null && (
          <span className="text-sm text-gray-400">
            {`Time left: ${Math.floor(remainingTime)}s`}
          </span>
        )}
      </div>
      <div className="relative">
        <Application width={boardWidth} height={boardHeight} backgroundAlpha={0}>
          <pixiContainer>
            <pixiGraphics draw={drawBoard} />
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                if (cell !== "W" && cell !== "B") return null;
                const x = BOARD_MARGIN + colIndex * cellSize + cellSize / 2;
                const y = BOARD_MARGIN + rowIndex * cellSize + cellSize / 2;
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const label = cell === "W" ? "○" : "●";
                return (
                  <pixiContainer key={`${rowIndex}-${colIndex}`}>
                    <pixiGraphics
                      draw={(g: PixiGraphics) => {
                        g.clear();
                        g.fill({ color: PLAYER_COLORS[cell], alpha: isSelected ? 1 : 0.9 });
                        g.circle(x, y, TOKEN_RADIUS);
                        g.fill();
                        if (isSelected) {
                          g.setStrokeStyle({ width: 3, color: 0xffff00 });
                          g.circle(x, y, TOKEN_RADIUS);
                          g.stroke();
                        }
                      }}
                    />
                    <pixiText text={label} anchor={0.5} x={x} y={y} style={tokenLabelStyles[cell]} />
                  </pixiContainer>
                );
              })
            )}
          </pixiContainer>
        </Application>
        <div 
          className="absolute top-0 left-0 grid" 
          style={{ 
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            width: `${boardWidth}px`,
            height: `${boardHeight}px`
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((_, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className="w-full h-full bg-transparent"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ClobberModule: GameClientModule = {
  GameView: ClobberView,
};

export default ClobberModule;
