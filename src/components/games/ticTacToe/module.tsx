import { useMemo, useState, useEffect } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Text, TextStyle, type Graphics as PixiGraphics } from "pixi.js";
import type { GameClientModule } from "../GameClientModule";

extend({ Container, Graphics, Text });

const CELL_SIZE = 120;
const BORDER_RADIUS = 24;

const parseBoard = (raw: unknown): (string | null)[] => {
  if (Array.isArray(raw)) {
    return raw.flat().map((cell) => (cell === "X" || cell === "O" ? cell : null));
  }
  return Array(9).fill(null);
};

const TicTacToeView: GameClientModule["GameView"] = ({
  state: rawState,
  players,
  localPlayerId,
  lastMove,
  isMyTurn,
  onProposeMove,
}) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Dynamically calculate cell size based on screen width
  const cellSize = useMemo(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) return 60; // Small screens (e.g., mobile)
    if (screenWidth < 1024) return 90; // Medium screens (e.g., tablets)
    return CELL_SIZE; // Default size for larger screens
  }, []);

  const board = useMemo(() => parseBoard((rawState as any)?.board), [rawState]);
  const dim = useMemo(() => Math.max(1, Math.floor(Math.sqrt(board.length))), [board.length]);

  const timing = (rawState as any)?.timing;
  const timeoutSeconds = timing?.timeout_seconds;
  const turnStartTime = timing?.turn_start_time;

  useEffect(() => {
    if (timing?.timeout_type === "per_turn" && timeoutSeconds && turnStartTime) {
      const calculateRemainingTime = () => {
        const startTime = new Date(turnStartTime).getTime();
        const elapsedTime = (Date.now() - startTime) / 1000; // elapsed time in seconds
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
      return "Your turn"; // Display "Your turn" for the local player
    }
    const nextPlayer = players.find((player) => String(player.userId) === String(gameState?.current_turn_player_id));
    return `${nextPlayer?.nickname ?? "Waiting..."}'s turn`;
  }, [rawState, players, localPlayerId]);

  const handleCellClick = (index: number) => {
    if (!isMyTurn || board[index] !== null) return;
    onProposeMove({ position: index });
  };

  const drawGrid = (g: PixiGraphics) => {
    g.clear();
    g.setStrokeStyle({ width: 6, color: 0xffffff, alpha: 0.35 });
    g.roundRect(0, 0, cellSize * dim, cellSize * dim, BORDER_RADIUS);
    g.stroke();

    g.setStrokeStyle({ width: 4, color: 0xffffff, alpha: 0.25 });
    for (let i = 1; i < dim; i++) {
      const pos = i * cellSize;
      g.moveTo(pos, 0).lineTo(pos, cellSize * dim);
      g.moveTo(0, pos).lineTo(cellSize * dim, pos);
    }
    g.stroke();
  };

  const markStyles = useMemo(
    () => ({
      X: new TextStyle({ fill: 0xffa94d, fontSize: cellSize * 0.6, fontWeight: "700" }),
      O: new TextStyle({ fill: 0x74c0fc, fontSize: cellSize * 0.6, fontWeight: "700" }),
    }),
    [cellSize]
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
        <Application width={cellSize * dim} height={cellSize * dim} backgroundAlpha={0}>
          <pixiContainer>
            <pixiGraphics draw={drawGrid} />
            {board.map((cell, index) => {
              const row = Math.floor(index / dim);
              const col = index % dim;
              return (
                <pixiContainer key={index} x={col * cellSize} y={row * cellSize}>
                  {cell && (cell === "X" || cell === "O") && (
                    <pixiText
                      text={cell}
                      anchor={0.5}
                      x={cellSize / 2}
                      y={cellSize / 2}
                      style={markStyles[cell]}
                    />
                  )}
                </pixiContainer>
              );
            })}
          </pixiContainer>
        </Application>
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${dim}, 1fr)` }}>
          {board.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleCellClick(index)}
              className="w-full h-full bg-transparent"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const TicTacToeModule: GameClientModule = {
  GameView: TicTacToeView,
};

export default TicTacToeModule;
