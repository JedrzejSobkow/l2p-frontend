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
    g.roundRect(0, 0, CELL_SIZE * dim, CELL_SIZE * dim, BORDER_RADIUS);
    g.stroke();

    g.setStrokeStyle({ width: 4, color: 0xffffff, alpha: 0.25 });
    for (let i = 1; i < dim; i++) {
      const pos = i * CELL_SIZE;
      g.moveTo(pos, 0).lineTo(pos, CELL_SIZE * dim);
      g.moveTo(0, pos).lineTo(CELL_SIZE * dim, pos);
    }
    g.stroke();
  };

  const markStyles = useMemo(
    () => ({
      X: new TextStyle({ fill: 0xffa94d, fontSize: 72, fontWeight: "700" }),
      O: new TextStyle({ fill: 0x74c0fc, fontSize: 72, fontWeight: "700" }),
    }),
    []
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center text-lg font-semibold text-white">
        {status}
        <br/>
        {remainingTime !== null && (
          <span className="text-sm text-gray-400">
            {`Time left: ${Math.floor(remainingTime)}s`}
          </span>
        )}
      </div>
      <div className="relative">
        <Application width={CELL_SIZE * dim} height={CELL_SIZE * dim} backgroundAlpha={0}>
          <pixiContainer>
            <pixiGraphics draw={drawGrid} />
            {board.map((cell, index) => {
              const row = Math.floor(index / dim);
              const col = index % dim;
              return (
                <pixiContainer key={index} x={col * CELL_SIZE} y={row * CELL_SIZE}>
                  {cell && (cell === "X" || cell === "O") && (
                    <pixiText
                      text={cell}
                      anchor={0.5}
                      x={CELL_SIZE / 2}
                      y={CELL_SIZE / 2}
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
