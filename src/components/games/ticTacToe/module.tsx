import { useMemo, useState, useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import type { GameClientModule } from "../GameClientModule";
import { GameBoard } from "../GameBoard";

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
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const gameState = useMemo(() => rawState as any, [rawState]);
  const board = useMemo(() => parseBoard(gameState?.board), [gameState]);
  const dim = useMemo(() => Math.max(1, Math.floor(Math.sqrt(board.length))), [board.length]);

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

  const status = useMemo(() => {
    if (gameState?.result === "draw") {
      return "Draw!";
    }
    if (gameState?.winner_identifier) {
      const winner = players.find((player) => String(player.userId) === String(gameState.winner_identifier));
      return `${winner?.nickname ?? "Unknown player"} wins!`;
    }
    if (String(gameState?.current_turn_identifier) === localPlayerId) {
      const mySymbol = gameState?.player_symbols?.[localPlayerId];
      const myColor = mySymbol === "X" ? "#ffa94d" : "#74c0fc";
      return (
        <>
          <span style={{ color: myColor }}>{mySymbol}</span> Your turn
        </>
      );
    }
    const nextPlayer = players.find((player) => String(player.userId) === String(gameState?.current_turn_identifier));
    const nextSymbol = gameState?.player_symbols?.[gameState?.current_turn_identifier];
    const nextColor = nextSymbol === "X" ? "#ffa94d" : "#74c0fc";
    return (
      <>
        <span style={{ color: nextColor }}>{nextSymbol}</span>
        {" "}{nextPlayer?.nickname ?? " Waiting..."}'s turn
      </>
    );
  }, [gameState, players, localPlayerId]);

  const handleCellClick = (row: number, col: number) => {
    const index = row * dim + col;
    if (!isMyTurn || board[index] !== null) return;
    const moveData = { row, col };
    onProposeMove(moveData);
  };

  const renderTokens = ({ cellSize, container, lineWidth }: { cellSize: number; container: PIXI.Container; lineWidth: number }) => {
    const markStyles = {
      X: new PIXI.TextStyle({ fill: 0xffa94d, fontSize: cellSize * 0.6, fontWeight: "700" }),
      O: new PIXI.TextStyle({ fill: 0x74c0fc, fontSize: cellSize * 0.6, fontWeight: "700" }),
    };

    board.forEach((cell, index) => {
      if (!cell || (cell !== "X" && cell !== "O")) return;
      const row = Math.floor(index / dim);
      const col = index % dim;
      const x = col * (cellSize + lineWidth) + lineWidth + cellSize / 2;
      const y = row * (cellSize + lineWidth) + lineWidth + cellSize / 2;

      const text = new PIXI.Text({
        text: cell,
        style: markStyles[cell],
      });
      text.anchor.set(0.5);
      text.x = x;
      text.y = y;
      container.addChild(text);
    });
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 w-full">
      <div className="text-center text-lg font-semibold text-white">
        {status}
        <br />
        {remainingTime !== null && (
          <span className="text-sm text-gray-400">
            {`Time left: ${Math.floor(remainingTime)}s`}
          </span>
        )}
      </div>
      <GameBoard
        rows={dim}
        cols={dim}
        containerWidth={containerWidth}
        onCellClick={handleCellClick}
      >
        {renderTokens}
      </GameBoard>
    </div>
  );
};

const TicTacToeModule: GameClientModule = {
  GameView: TicTacToeView,
};

export default TicTacToeModule;
