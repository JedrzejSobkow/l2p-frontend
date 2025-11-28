import { useMemo, useState, useEffect, useRef } from "react";
import { Application, extend } from "@pixi/react";
import { Container, Graphics, Text, TextStyle, type Graphics as PixiGraphics } from "pixi.js";
import type { GameClientModule } from "../GameClientModule";

extend({ Container, Graphics, Text });

// const BOARD_MARGIN = 20;
const BORDER_RADIUS = 24;
const LINE_WIDTH = 2

const GRID_LINE_COLOR = 0xffffff;
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

  const { boardWidth, boardHeight, cellSize } = useMemo(() => {
    const availableWidth = containerWidth * 0.8;
    console.log("AVAILABLE WIDTH: ")
    console.log(availableWidth)
    const calculatedCellSize = (availableWidth - (cols + 1) * LINE_WIDTH) / cols;
    console.log("CALCULATED CELL SIZE: ")
    console.log(calculatedCellSize)
    const calculatedBoardWidth = cols * calculatedCellSize + (LINE_WIDTH * (cols + 1));
    console.log("CALCULATED BOARD WIDTH: ")
    console.log(calculatedBoardWidth)
    const calculatedBoardHeight = rows * calculatedCellSize + (LINE_WIDTH * (rows + 1));
    console.log("CALCULATED BOARD HEIGHT: ")
    console.log(calculatedBoardHeight)
    
    return {
      boardWidth: calculatedBoardWidth,
      boardHeight: calculatedBoardHeight,
      cellSize: calculatedCellSize
    };
  }, [containerWidth, cols, rows]);

  const tokenRadius = useMemo(() => cellSize * 0.35, [cellSize]);
  const fontSize = useMemo(() => Math.max(12, cellSize * 0.25), [cellSize]);

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
    if (gameState?.winner_id) {
      const winner = players.find((player) => String(player.userId) === String(gameState.winner_id));
      return `${winner?.nickname ?? "Unknown player"} wins!`;
    }
    if (String(gameState?.current_turn_player_id) === localPlayerId) {
      return "Your turn";
    }
    const nextPlayer = players.find((player) => String(player.userId) === String(gameState?.current_turn_player_id));
    return `${nextPlayer?.nickname ?? "Waiting..."}'s turn`;
  }, [gameState, players, localPlayerId]);

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) return;

    const cell = board[row]?.[col];
    console.log("CLICKED")
    console.log(cell)
    if (!cell) return;

    const myColor = gameState?.player_colors?.[localPlayerId];

    if (!selectedCell) {
      // First click - only allow selecting a token that matches the player's color
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
        // Allow reselecting if the clicked cell matches the player's color
        if (cell === myColor) {
          setSelectedCell({ row, col });
        } else {
          setSelectedCell(null);
        }
      }
    }
  };

  const drawBoard = (g: PixiGraphics) => {
    g.clear();
    g.fill({ color: 0x000000, alpha: 0 });
    g.roundRect(0, 0, boardWidth, boardHeight, BORDER_RADIUS);
    g.fill();

    g.setStrokeStyle({ width: LINE_WIDTH, color: GRID_LINE_COLOR, alpha: 0.12 });
    const startX = 0;
    const startY = 0;
    for (let r = 0; r <= rows; r += 1) {
      const y = startY + r * (cellSize + LINE_WIDTH) ;
      g.moveTo(startX, y);
      g.lineTo(startX + cols * (cellSize + LINE_WIDTH), y);
    }
    for (let c = 0; c <= cols; c += 1) {
      const x = startX + c * (cellSize + LINE_WIDTH);
      g.moveTo(x, startY);
      g.lineTo(x, startY + rows * (cellSize + LINE_WIDTH));
    }
    g.stroke();
  };

  const tokenLabelStyles = useMemo(
    () => ({
      W: new TextStyle({
        fill: 0xaaaaaa,
        fontFamily: "Poppins, Inter, sans-serif",
        fontWeight: "700",
        fontSize: fontSize,
      }),
      B: new TextStyle({
        fill: 0x8b5010,
        fontFamily: "Poppins, Inter, sans-serif",
        fontWeight: "700",
        fontSize: fontSize,
      }),
    }),
    [fontSize]
  );

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 w-full">
      <div className="text-center text-lg font-semibold text-white flex items-center justify-center gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
          style={{ 
            backgroundColor: String(gameState?.current_turn_player_id) === localPlayerId 
              ? (gameState?.player_colors?.[localPlayerId] === "W" ? "#ffffff" : "#ff8906")
              : (gameState?.player_colors?.[gameState?.current_turn_player_id] === "W" ? "#ffffff" : "#ff8906"),
            color: String(gameState?.current_turn_player_id) === localPlayerId 
              ? (gameState?.player_colors?.[localPlayerId] === "W" ? "#aaaaaa" : "#8b5010")
              : (gameState?.player_colors?.[gameState?.current_turn_player_id] === "W" ? "#aaaaaa" : "#8b5010"),
            border: "2px solid",
            borderColor: String(gameState?.current_turn_player_id) === localPlayerId 
              ? (gameState?.player_colors?.[localPlayerId] === "W" ? "#aaaaaa" : "#8b5010")
              : (gameState?.player_colors?.[gameState?.current_turn_player_id] === "W" ? "#aaaaaa" : "#8b5010")
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
      {containerWidth > 0 && boardWidth > 0 && (
        <div className="relative" style={{ width: boardWidth, height: boardHeight }}>
          <Application 
            key={`${boardWidth}-${boardHeight}`}
            width={boardWidth} 
            height={boardHeight} 
            backgroundAlpha={0}
          >
            <pixiContainer>
              <pixiGraphics draw={drawBoard} />
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  if (cell !== "W" && cell !== "B") return null;
                  const x = colIndex * (cellSize + LINE_WIDTH) + LINE_WIDTH + cellSize / 2 ;
                  const y = rowIndex * (cellSize + LINE_WIDTH) + LINE_WIDTH + cellSize / 2 ;
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                  const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
                  
                  const myColor = gameState?.player_colors?.[localPlayerId];
                  let canClick = false;
                  
                  if (isMyTurn) {
                    if (!selectedCell) {
                      // First click - can click own color
                      canClick = cell === myColor;
                    } else {
                      // Second click - can click adjacent opponent tokens
                      const { row: fromRow, col: fromCol } = selectedCell;
                      const isAdjacent =
                        (Math.abs(rowIndex - fromRow) === 1 && colIndex === fromCol) ||
                        (Math.abs(colIndex - fromCol) === 1 && rowIndex === fromRow);
                      canClick = isAdjacent && cell !== myColor;
                    }
                  }
                  
                  const scale = canClick && isHovered && !isSelected ? 1.25 : 1;
                  const label = "○"
                  
                  return (
                    <pixiContainer key={`${rowIndex}-${colIndex}`} x={x} y={y} scale={scale}>
                      <pixiGraphics
                        draw={(g: PixiGraphics) => {
                          g.clear();
                          g.fill({ color: PLAYER_COLORS[cell], alpha: isSelected ? 1 : 0.9 });
                          g.circle(0, 0, tokenRadius);
                          g.fill();
                          
                          // Border around token
                          const borderColor = cell === "W" ? 0xaaaaaa : 0x8b5010;
                          g.setStrokeStyle({ width: 3, color: borderColor, alpha: 1 });
                          g.circle(0, 0, tokenRadius);
                          g.stroke();
                          
                          if (isSelected) {
                            g.setStrokeStyle({ width: 3, color: 0x2abd69 });
                            g.circle(0, 0, tokenRadius);
                            g.stroke();
                          }
                        }}
                      />
                      <pixiText text={label} anchor={0.5} x={0} y={0} style={tokenLabelStyles[cell]} />
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
                  onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className="w-full h-full bg-transparent"
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ClobberModule: GameClientModule = {
  GameView: ClobberView,
};

export default ClobberModule;
