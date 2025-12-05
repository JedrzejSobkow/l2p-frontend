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
      row.map((cell) => (cell === "W" || cell === "B" || cell === "w" || cell === "b" ? cell : null))
    );
  }
  return Array(8).fill(null).map(() => Array(8).fill(null));
};

interface CheckersGameState {
  board: (string | null)[][];
  move_count: number;
  last_move: any;
  player_colors: Record<string, string>;
  consecutive_non_capture_moves: number;
  position_history: string[];
  current_turn_identifier?: string;
  winner_identifier?: string;
  result?: string;
  timing?: {
    timeout_type?: string;
    timeout_seconds?: number;
    turn_start_time?: string;
  };
}

const CheckersView: GameClientModule["GameView"] = ({
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
  const [validMoves, setValidMoves] = useState<Array<{ row: number; col: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const gameState = useMemo(() => rawState as CheckersGameState, [rawState]);
  const board = useMemo(() => parseBoard(gameState?.board), [gameState]);
  const rows = board.length;
  const cols = board[0]?.length ?? 0;

  const timing = gameState?.timing;
  const timeoutSeconds = timing?.timeout_seconds;
  const turnStartTime = timing?.turn_start_time;

  useEffect(() => {
    setSelectedCell(null);
    setHoveredCell(null);
    setValidMoves([]);
  }, [board]);

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

  const myColor = useMemo(() => {
    return gameState?.player_colors?.[localPlayerId];
  }, [gameState, localPlayerId]);

  const currentTurnColor = useMemo(() => {
    const currentPlayerId = gameState?.current_turn_identifier;
    return gameState?.player_colors?.[currentPlayerId || ""];
  }, [gameState]);

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

  // Helper functions
  const isMyPiece = (piece: string | null): boolean => {
    if (!piece || !myColor) return false;
    return piece.toLowerCase() === myColor[0].toLowerCase();
  };

  const isOpponentPiece = (piece: string | null): boolean => {
    if (!piece || !myColor) return false;
    const opponentColor = myColor === "white" ? "b" : "w";
    return piece.toLowerCase() === opponentColor;
  };

  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < rows && col >= 0 && col < cols;
  };

  const isCaptureMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const distance = Math.abs(toRow - fromRow);
    if (distance < 2) return false;

    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const isKing = piece === piece.toUpperCase();
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    if (distance === 2) {
      // Standard capture
      const midRow = (fromRow + toRow) / 2;
      const midCol = (fromCol + toCol) / 2;
      const midPiece = board[midRow][midCol];
      return midPiece !== null && isOpponentPiece(midPiece);
    }

    // For kings with flying enabled, check path
    if (isKing) {
      const rowDir = rowDiff > 0 ? 1 : -1;
      const colDir = colDiff > 0 ? 1 : -1;
      let currentRow = fromRow + rowDir;
      let currentCol = fromCol + colDir;
      let foundOpponent = false;

      while (currentRow !== toRow) {
        const cellPiece = board[currentRow][currentCol];
        if (cellPiece !== null) {
          if (isOpponentPiece(cellPiece) && !foundOpponent) {
            foundOpponent = true;
          } else {
            return false;
          }
        }
        currentRow += rowDir;
        currentCol += colDir;
      }
      return foundOpponent;
    }

    return false;
  };

  const getCaptureMoves = (fromRow: number, fromCol: number): Array<{ row: number; col: number }> => {
    const piece = board[fromRow][fromCol];
    if (!piece || !isMyPiece(piece)) return [];

    const isKing = piece === piece.toUpperCase();
    const moves: Array<{ row: number; col: number }> = [];
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [dr, dc] of directions) {
      // Standard capture (distance 2)
      const captureRow = fromRow + dr * 2;
      const captureCol = fromCol + dc * 2;

      if (isValidPosition(captureRow, captureCol) && 
          board[captureRow][captureCol] === null &&
          isCaptureMove(fromRow, fromCol, captureRow, captureCol)) {
        
        // Check if backward capture is allowed for non-kings
        if (!isKing) {
          const forwardDir = myColor === "white" ? -1 : 1;
          if (dr !== forwardDir) {
            // This is a backward move, skip unless backward_capture is true
            // For simplicity, we'll allow it (backend will validate)
          }
        }
        
        moves.push({ row: captureRow, col: captureCol });
      }

      // For kings, check multiple distances (flying kings)
      if (isKing) {
        let distance = 3;
        while (distance < rows) {
          const longRow = fromRow + dr * distance;
          const longCol = fromCol + dc * distance;

          if (!isValidPosition(longRow, longCol)) break;
          if (board[longRow][longCol] !== null) break;

          if (isCaptureMove(fromRow, fromCol, longRow, longCol)) {
            moves.push({ row: longRow, col: longCol });
          }

          distance++;
        }
      }
    }

    return moves;
  };

  const getRegularMoves = (fromRow: number, fromCol: number): Array<{ row: number; col: number }> => {
    const piece = board[fromRow][fromCol];
    if (!piece || !isMyPiece(piece)) return [];

    const isKing = piece === piece.toUpperCase();
    const moves: Array<{ row: number; col: number }> = [];

    let directions: number[][];
    if (isKing) {
      directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    } else {
      // Regular pieces move forward only
      const forwardDir = myColor === "white" ? -1 : 1;
      directions = [[forwardDir, -1], [forwardDir, 1]];
    }

    for (const [dr, dc] of directions) {
      // Regular move (distance 1)
      const newRow = fromRow + dr;
      const newCol = fromCol + dc;

      if (isValidPosition(newRow, newCol) && board[newRow][newCol] === null) {
        moves.push({ row: newRow, col: newCol });
      }

      // For flying kings, check multiple distances
      if (isKing) {
        let distance = 2;
        while (distance < rows) {
          const longRow = fromRow + dr * distance;
          const longCol = fromCol + dc * distance;

          if (!isValidPosition(longRow, longCol)) break;
          if (board[longRow][longCol] !== null) break;

          moves.push({ row: longRow, col: longCol });
          distance++;
        }
      }
    }

    return moves;
  };

  const hasAnyCaptureMove = (): boolean => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const piece = board[row][col];
        if (piece && isMyPiece(piece)) {
          const captures = getCaptureMoves(row, col);
          if (captures.length > 0) return true;
        }
      }
    }
    return false;
  };

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) return;

    const cell = board[row]?.[col];

    if (!selectedCell) {
      // Selecting a piece
      if (!cell || !isMyPiece(cell)) return;

      setSelectedCell({ row, col });

      // Calculate valid moves for this piece
      const forcedCapture = hasAnyCaptureMove();
      let moves: Array<{ row: number; col: number }>;

      if (forcedCapture) {
        // Must capture
        moves = getCaptureMoves(row, col);
      } else {
        // Regular moves
        moves = getRegularMoves(row, col);
      }

      setValidMoves(moves);
    } else {
      // Making a move
      const { row: fromRow, col: fromCol } = selectedCell;

      // Check if clicking same piece (deselect)
      if (fromRow === row && fromCol === col) {
        setSelectedCell(null);
        setValidMoves([]);
        return;
      }

      // Check if clicking another own piece (reselect)
      if (cell && isMyPiece(cell)) {
        setSelectedCell({ row, col });

        const forcedCapture = hasAnyCaptureMove();
        let moves: Array<{ row: number; col: number }>;

        if (forcedCapture) {
          moves = getCaptureMoves(row, col);
        } else {
          moves = getRegularMoves(row, col);
        }

        setValidMoves(moves);
        return;
      }

      // Check if this is a valid move
      const isValid = validMoves.some(m => m.row === row && m.col === col);

      if (isValid) {
        // Make the move
        const moveData = { 
          from_row: fromRow, 
          from_col: fromCol, 
          to_row: row, 
          to_col: col 
        };
        onProposeMove(moveData);
        setSelectedCell(null);
        setValidMoves([]);
      } else {
        // Invalid move, deselect
        setSelectedCell(null);
        setValidMoves([]);
      }
    }
  };

  const renderTokens = ({ cellSize, container, lineWidth }: { cellSize: number; container: PIXI.Container; lineWidth: number }) => {
    const tokenRadius = cellSize * 0.35;
    const fontSize = Math.max(12, cellSize * 0.25);

    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (!cell) return;

        const isWhite = cell.toLowerCase() === "w";
        const isKing = cell === cell.toUpperCase();
        
        const x = colIndex * (cellSize + lineWidth) + lineWidth + cellSize / 2;
        const y = rowIndex * (cellSize + lineWidth) + lineWidth + cellSize / 2;

        const tokenContainer = new PIXI.Container();
        tokenContainer.x = x;
        tokenContainer.y = y;

        const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
        const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
        const isValidMove = validMoves.some(m => m.row === rowIndex && m.col === colIndex);

        let canClick = false;
        if (isMyTurn) {
          if (!selectedCell) {
            canClick = isMyPiece(cell);
          } else {
            canClick = isValidMove;
          }
        }

        const scale = canClick && isHovered && !isSelected ? 1.25 : 1;
        tokenContainer.scale.set(scale);

        // Token circle
        const tokenGraphics = new PIXI.Graphics();
        const pieceColor = isWhite ? PLAYER_COLORS.W : PLAYER_COLORS.B;
        tokenGraphics.circle(0, 0, tokenRadius);
        tokenGraphics.fill({ color: pieceColor, alpha: isSelected ? 1 : 0.9 });

        const borderColor = isWhite ? 0xaaaaaa : 0x8b5010;
        tokenGraphics.setStrokeStyle({ width: 3, color: borderColor, alpha: 1 });
        tokenGraphics.circle(0, 0, tokenRadius);
        tokenGraphics.stroke();

        if (isSelected) {
          tokenGraphics.setStrokeStyle({ width: 3, color: 0x2abd69 });
          tokenGraphics.circle(0, 0, tokenRadius);
          tokenGraphics.stroke();
        }

        tokenContainer.addChild(tokenGraphics);

        // Token label - crown for king, circle for regular piece
        const textStyle = new PIXI.TextStyle({
          fill: isKing ? 0xFFD700 : (isWhite ? 0xaaaaaa : 0x8b5010), // Gold for crown
          fontFamily: "Poppins, Inter, sans-serif",
          fontWeight: "900", // Extra bold
          fontSize: isKing ? fontSize * 2.2 : fontSize, // Even larger crown
          align: 'center',
        });

        if (isKing) {
          textStyle.stroke = { color: isWhite ? 0x8b7000 : 0x4a3800, width: 2.5 };
        }

        const label = new PIXI.Text(isKing ? "♔" : "○", textStyle);
        label.anchor.set(0.5, 0.5); // Center both horizontally and vertically
        label.x = 0; // Explicitly center at container origin
        label.y = 0;
        tokenContainer.addChild(label);

        tokenContainer.eventMode = 'static';
        tokenContainer.cursor = canClick ? 'pointer' : 'default';

        container.addChild(tokenContainer);
      });
    });

    // Render valid move indicators
    validMoves.forEach(({ row: moveRow, col: moveCol }) => {
      const x = moveCol * (cellSize + lineWidth) + lineWidth + cellSize / 2;
      const y = moveRow * (cellSize + lineWidth) + lineWidth + cellSize / 2;

      const indicator = new PIXI.Graphics();
      indicator.circle(0, 0, cellSize * 0.15);
      indicator.fill({ color: 0x2abd69, alpha: 0.6 });
      indicator.x = x;
      indicator.y = y;

      container.addChild(indicator);
    });
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 w-full">
      <div className="text-center text-lg font-semibold text-white flex items-center justify-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
          style={{ 
            backgroundColor: currentTurnColor === "white" ? "#ffffff" : "#ff8906",
            color: currentTurnColor === "white" ? "#aaaaaa" : "#8b5010",
            border: "2px solid",
            borderColor: currentTurnColor === "white" ? "#aaaaaa" : "#8b5010"
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

const CheckersModule: GameClientModule = {
  GameView: CheckersView,
};

export default CheckersModule;
