import { useMemo, useState, useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import type { GameClientModule } from "../GameClientModule";
import { GameBoard } from "../GameBoard";

const PLAYER_COLORS = {
  W: 0xffffff,
  B: 0xff8906,
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
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const gameState = useMemo(() => rawState as any, [rawState]);
  const board = useMemo(() => parseBoard(gameState?.board), [gameState]);
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  const timing = gameState?.timing;
  const timeoutSeconds = timing?.timeout_seconds;
  const turnStartTime = timing?.turn_start_time;

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    const resizeObserver = new ResizeObserver(updateContainerWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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

  const currentTurnColor = useMemo(() => {
    if (String(gameState?.current_turn_identifier) === localPlayerId) {
      return gameState?.player_colors?.[localPlayerId];
    }
    return gameState?.player_colors?.[gameState?.current_turn_identifier];
  }, [gameState, localPlayerId]);

  const status = useMemo(() => {
    if (gameState?.result === "draw") {
      return "Draw!";
    }
    if (gameState?.winner_identifier) {
      const winner = players.find((player) => String(player.userId) === String(gameState.winner_identifier));
      return `${winner?.nickname ?? "Unknown player"} wins!`;
    }
    if (String(gameState?.current_turn_identifier) === localPlayerId) {
      return "Your turn";
    }
    const nextPlayer = players.find((player) => String(player.userId) === String(gameState?.current_turn_identifier));
    return `${nextPlayer?.nickname ?? "Waiting..."}'s turn`;
  }, [gameState, players, localPlayerId]);

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) return;

    const cell = board[row]?.[col];
    if (!cell) return;

    const myColor = gameState?.player_colors?.[localPlayerId];

    if (!selectedCell) {
      if (cell !== myColor) return;
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
        if (cell === myColor) {
          setSelectedCell({ row, col });
        } else {
          setSelectedCell(null);
        }
      }
    }
  };

  const renderTokens = ({ cellSize, container, lineWidth }: { cellSize: number; container: PIXI.Container; lineWidth: number }) => {
    const tokenRadius = cellSize * 0.35;
    const fontSize = Math.max(12, cellSize * 0.25);
    const myColor = gameState?.player_colors?.[localPlayerId];

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== "W" && cell !== "B") return;

        const x = colIndex * (cellSize + lineWidth) + lineWidth + cellSize / 2;
        const y = rowIndex * (cellSize + lineWidth) + lineWidth + cellSize / 2;

        const tokenContainer = new PIXI.Container();
        tokenContainer.x = x;
        tokenContainer.y = y;

        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
        const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;

        let canClick = false;
        if (isMyTurn) {
          if (!selectedCell) {
            canClick = cell === myColor;
          } else {
            const { row: fromRow, col: fromCol } = selectedCell;
            const isAdjacent =
              (Math.abs(rowIndex - fromRow) === 1 && colIndex === fromCol) ||
              (Math.abs(colIndex - fromCol) === 1 && rowIndex === fromRow);
            canClick = isAdjacent && cell !== myColor;
          }
        }

        const scale = canClick && isHovered && !isSelected ? 1.25 : 1;
        tokenContainer.scale.set(scale);

        // Token circle
        const tokenGraphics = new PIXI.Graphics();
        tokenGraphics.circle(0, 0, tokenRadius);
        tokenGraphics.fill({ color: PLAYER_COLORS[cell], alpha: isSelected ? 1 : 0.9 });

        const borderColor = cell === "W" ? 0xaaaaaa : 0x8b5010;
        tokenGraphics.setStrokeStyle({ width: 3, color: borderColor, alpha: 1 });
        tokenGraphics.circle(0, 0, tokenRadius);
        tokenGraphics.stroke();

        if (isSelected) {
          tokenGraphics.setStrokeStyle({ width: 3, color: 0x2abd69 });
          tokenGraphics.circle(0, 0, tokenRadius);
          tokenGraphics.stroke();
        }

        tokenContainer.addChild(tokenGraphics);

        // Token label
        const label = new PIXI.Text({
          text: "○",
          style: {
            fill: cell === "W" ? 0xaaaaaa : 0x8b5010,
            fontFamily: "Poppins, Inter, sans-serif",
            fontWeight: "700",
            fontSize: fontSize,
          }
        });
        label.anchor.set(0.5);
        tokenContainer.addChild(label);

        tokenContainer.eventMode = 'static';
        tokenContainer.cursor = canClick ? 'pointer' : 'default';

        container.addChild(tokenContainer);
      });
    });
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 w-full">
      <div className="text-center text-lg font-semibold text-white flex items-center justify-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
          style={{ 
            backgroundColor: currentTurnColor === "W" ? "#ffffff" : "#ff8906",
            color: currentTurnColor === "W" ? "#aaaaaa" : "#8b5010",
            border: "2px solid",
            borderColor: currentTurnColor === "W" ? "#aaaaaa" : "#8b5010"
          }}
        >
          ○
        </div>
        <div>
          {status}
          <br />
          {remainingTime !== null && (
            <span className="text-sm text-gray-400">
              {`Time left: ${Math.floor(remainingTime)}s`}
            </span>
          )}
        </div>
      </div>
      <GameBoard
        rows={rows}
        cols={cols}
        containerWidth={containerWidth}
        onCellClick={handleCellClick}
        onCellHover={(row, col) => setHoveredCell({ row, col })}
        onCellLeave={() => setHoveredCell(null)}
      >
        {renderTokens}
      </GameBoard>
    </div>
  );
};

const ClobberModule: GameClientModule = {
  GameView: ClobberView,
};

export default ClobberModule;
