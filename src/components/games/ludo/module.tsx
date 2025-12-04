import React, { useMemo, useState, useEffect, useRef } from "react";
import { Application, extend } from "@pixi/react";
import {
  Container,
  Graphics,
  Text,
  TextStyle,
  type Graphics as PixiGraphics,
} from "pixi.js";
import type { GameClientModule } from "../GameClientModule";

extend({ Container, Graphics, Text });

// Player colors - vibrant for dark mode
const PLAYER_COLORS = {
  0: 0xff5555, // Red (brighter)
  1: 0x55ff55, // Green (brighter)
  2: 0xffdd55, // Yellow (brighter)
  3: 0x5599ff, // Blue (brighter)
};

const PLAYER_COLOR_NAMES = {
  0: "Red",
  1: "Green",
  2: "Yellow",
  3: "Blue",
};

// Board configuration matching backend
const BOARD_SQUARES = 52;
const HOME_PATH_LENGTH = 6;
const PIECES_PER_PLAYER = 4;
const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Starting positions for each player
const STARTING_POSITIONS = {
  0: 0, // Red
  1: 13, // Green
  2: 26, // Yellow
  3: 39, // Blue
};

// Home entry positions
const HOME_ENTRY_POSITIONS = {
  0: 50, // Red
  1: 11, // Green
  2: 24, // Yellow
  3: 37, // Blue
};

interface Piece {
  id: string;
  position: string; // "yard" | "track_X" | "home_X" | "finished"
  is_safe: boolean;
}

interface GameState {
  pieces: Record<string, Piece[]>;
  current_dice_roll: number | null;
  dice_rolled: boolean;
  move_made: boolean;
  extra_turn_pending: boolean;
  current_turn_player_id?: string;
  winner_id?: string;
  timing?: {
    timeout_type?: string;
    timeout_seconds?: number;
    turn_start_time?: string;
  };
  moves_history?: Array<{
    player_id: string;
    action: string;
    dice_value?: number;
    [key: string]: any;
  }>;
}

/**
 * Calculate position coordinates for board squares
 * Board layout: 13 squares per side in a square path
 */
/**
 * Calculate position coordinates for board squares
 * Board layout: 15x15 grid
 * Track follows the cross shape
 */
const getSquarePosition = (
  squareIndex: number,
  boardSize: number
): { x: number; y: number } => {
  const squareSize = boardSize / 15;
  let x = 0;
  let y = 0;

  // Map 0-51 index to 15x15 grid coordinates
  if (squareIndex >= 0 && squareIndex <= 4) {
    // Red ascent (Bottom arm, left side)
    x = 6;
    y = 13 - squareIndex;
  } else if (squareIndex >= 5 && squareIndex <= 10) {
    // Left arm, bottom side
    x = 5 - (squareIndex - 5);
    y = 8;
  } else if (squareIndex === 11) {
    // Left end, middle
    x = 0;
    y = 7;
  } else if (squareIndex === 12) {
    // Left end, top
    x = 0;
    y = 6;
  } else if (squareIndex >= 13 && squareIndex <= 17) {
    // Left arm, top side
    x = 1 + (squareIndex - 13);
    y = 6;
  } else if (squareIndex >= 18 && squareIndex <= 23) {
    // Top arm, left side
    x = 6;
    y = 5 - (squareIndex - 18);
  } else if (squareIndex === 24) {
    // Top end, middle
    x = 7;
    y = 0;
  } else if (squareIndex === 25) {
    // Top end, right
    x = 8;
    y = 0;
  } else if (squareIndex >= 26 && squareIndex <= 30) {
    // Top arm, right side
    x = 8;
    y = 1 + (squareIndex - 26);
  } else if (squareIndex >= 31 && squareIndex <= 36) {
    // Right arm, top side
    x = 9 + (squareIndex - 31);
    y = 6;
  } else if (squareIndex === 37) {
    // Right end, middle
    x = 14;
    y = 7;
  } else if (squareIndex === 38) {
    // Right end, bottom
    x = 14;
    y = 8;
  } else if (squareIndex >= 39 && squareIndex <= 43) {
    // Right arm, bottom side
    x = 13 - (squareIndex - 39);
    y = 8;
  } else if (squareIndex >= 44 && squareIndex <= 49) {
    // Bottom arm, right side
    x = 8;
    y = 9 + (squareIndex - 44);
  } else if (squareIndex === 50) {
    // Bottom end, middle
    x = 7;
    y = 14;
  } else if (squareIndex === 51) {
    // Bottom end, left
    x = 6;
    y = 14;
  }

  return {
    x: x * squareSize,
    y: y * squareSize,
  };
};

/**
 * Calculate position for home path squares
 */
const getHomePosition = (
  playerIdx: number,
  homeSquare: number,
  boardSize: number
): { x: number; y: number } => {
  const squareSize = boardSize / 15;
  let x = 0;
  let y = 0;

  // homeSquare is 0-5
  switch (playerIdx) {
    case 0: // Red (Bottom) - Moves Up
      x = 7;
      y = 13 - homeSquare;
      break;
    case 1: // Green (Left) - Moves Right
      x = 1 + homeSquare;
      y = 7;
      break;
    case 2: // Yellow (Top) - Moves Down
      x = 7;
      y = 1 + homeSquare;
      break;
    case 3: // Blue (Right) - Moves Left
      x = 13 - homeSquare;
      y = 7;
      break;
  }

  return {
    x: x * squareSize,
    y: y * squareSize,
  };
};

/**
 * Calculate position for yard squares
 */
const getYardPosition = (
  playerIdx: number,
  pieceIdx: number,
  boardSize: number
): { x: number; y: number } => {
  const squareSize = boardSize / 15;

  // Base coordinates for 6x6 yards
  // Red: Bottom-Left (0-5, 9-14)
  // Green: Top-Left (0-5, 0-5)
  // Yellow: Top-Right (9-14, 0-5)
  // Blue: Bottom-Right (9-14, 9-14)

  let baseX = 0;
  let baseY = 0;

  switch (playerIdx) {
    case 0: // Red (Bottom-Left)
      baseX = 0;
      baseY = 9;
      break;
    case 1: // Green (Top-Left)
      baseX = 0;
      baseY = 0;
      break;
    case 2: // Yellow (Top-Right)
      baseX = 9;
      baseY = 0;
      break;
    case 3: // Blue (Bottom-Right)
      baseX = 9;
      baseY = 9;
      break;
  }

  // Center pieces in the 6x6 yard
  // Use a 2x2 arrangement in the center of the 6x6 area
  // Center of 6x6 is at 3,3 relative to base
  // Offsets: (-1,-1), (1,-1), (-1,1), (1,1) scaled by some factor?
  // Or just place them at specific squares: (1,1), (4,1), (1,4), (4,4) relative to base?
  // Let's put them at (1.5, 1.5), (4.5, 1.5), etc?
  // Let's use squares 1,1; 4,1; 1,4; 4,4 relative to base (0-5)

  const positions = [
    { dx: 1.5, dy: 1.5 },
    { dx: 4.5, dy: 1.5 },
    { dx: 1.5, dy: 4.5 },
    { dx: 4.5, dy: 4.5 },
  ];

  const pos = positions[pieceIdx];

  return {
    x: (baseX + pos.dx) * squareSize,
    y: (baseY + pos.dy) * squareSize,
  };
};

const getPiecePosition = (
  position: string,
  playerIdx: number,
  pieceIdx: number,
  boardSize: number,
  stackIndex: number = 0,
  stackSize: number = 1
): { x: number; y: number } => {
  const squareSize = boardSize / 15;
  const halfSquare = squareSize / 2;

  // Calculate base position
  let baseX = 0;
  let baseY = 0;

  if (position === "yard") {
    // Yard positions are already centered in their sub-squares by getYardPosition
    return getYardPosition(playerIdx, pieceIdx, boardSize);
  }

  if (position.startsWith("track_")) {
    const squareIndex = parseInt(position.split("_")[1]);
    const pos = getSquarePosition(squareIndex, boardSize);
    baseX = pos.x + halfSquare;
    baseY = pos.y + halfSquare;
  } else if (position.startsWith("home_")) {
    const homeIndex = parseInt(position.split("_")[1]);
    const pos = getHomePosition(playerIdx, homeIndex, boardSize);
    baseX = pos.x + halfSquare;
    baseY = pos.y + halfSquare;
  } else if (position === "finished") {
    // Place in center triangle based on playerIdx
    const centerX = boardSize / 2;
    const centerY = boardSize / 2;
    const squareSize = boardSize / 15;

    // Base position for finished pieces in the center triangle
    switch (playerIdx) {
      case 0: // Red (Bottom)
        baseX = centerX;
        baseY = centerY + squareSize;
        break;
      case 1: // Green (Left)
        baseX = centerX - squareSize;
        baseY = centerY;
        break;
      case 2: // Yellow (Top)
        baseX = centerX;
        baseY = centerY - squareSize;
        break;
      case 3: // Blue (Right)
        baseX = centerX + squareSize;
        baseY = centerY;
        break;
    }
  } else {
    return { x: 0, y: 0 };
  }

  // Apply stacking offset for multiple pieces on same square
  if (stackSize > 1) {
    const radius = squareSize * 0.15; // Distance from center
    if (stackSize === 2) {
      // For 2 pieces, place them side by side horizontally
      const offsetX = stackIndex === 0 ? -radius : radius;
      baseX += offsetX;
    } else if (stackSize === 3) {
      // For 3 pieces, arrange in triangle
      const angles = [0, 120, 240]; // degrees
      const angle = (angles[stackIndex] * Math.PI) / 180;
      baseX += radius * Math.cos(angle);
      baseY += radius * Math.sin(angle);
    } else {
      // For 4+ pieces, distribute evenly in a circle
      const angle = (stackIndex * 2 * Math.PI) / stackSize;
      baseX += radius * Math.cos(angle);
      baseY += radius * Math.sin(angle);
    }
  }

  return { x: baseX, y: baseY };
};

const getPath = (start: string, end: string, playerIdx: number): string[] => {
  if (start === end) return [];
  if (start === "yard" || end === "yard") return [end];
  if (start === "finished" || end === "finished") return [end];

  const path: string[] = [];

  // Parse start
  let currentType = start.split("_")[0];
  let currentIndex = parseInt(start.split("_")[1]);

  const endType = end.split("_")[0];
  const endIndex = parseInt(end.split("_")[1]);

  // Safety break
  let steps = 0;
  while (steps < 60) {
    steps++;

    // Calculate next position
    if (currentType === "track") {
      const entryPoint =
        HOME_ENTRY_POSITIONS[playerIdx as keyof typeof HOME_ENTRY_POSITIONS];
      if (currentIndex === entryPoint) {
        // Enter home
        currentType = "home";
        currentIndex = 0;
      } else {
        currentIndex = (currentIndex + 1) % 52;
      }
    } else if (currentType === "home") {
      currentIndex++;
    }

    const posString = `${currentType}_${currentIndex}`;
    path.push(posString);

    if (posString === end) break;
    if (currentType === "home" && currentIndex > 5) break;
  }

  return path;
};

const PieceComponent = ({
  piece,
  playerIdx,
  pieceIdx,
  boardSize,
  color,
  canMove,
  onClick,
  stackIndex = 0,
  stackSize = 1,
}: {
  piece: Piece;
  playerIdx: number;
  pieceIdx: number;
  boardSize: number;
  color: number;
  canMove: boolean;
  onClick: () => void;
  stackIndex?: number;
  stackSize?: number;
}) => {
  const squareSize = boardSize / 15;
  const pieceRadius = squareSize * 0.35;

  // Animation state
  const [displayPos, setDisplayPos] = useState(() =>
    getPiecePosition(
      piece.position,
      playerIdx,
      pieceIdx,
      boardSize,
      stackIndex,
      stackSize
    )
  );
  const prevPosRef = useRef(piece.position);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prevPosRef.current !== piece.position) {
      const startPos = prevPosRef.current;
      const endPos = piece.position;
      prevPosRef.current = endPos;

      const path = getPath(startPos, endPos, playerIdx);

      if (path.length === 0) {
        setDisplayPos(
          getPiecePosition(
            endPos,
            playerIdx,
            pieceIdx,
            boardSize,
            stackIndex,
            stackSize
          )
        );
        return;
      }

      // Animate through path
      let startTime: number | null = null;
      const durationPerStep = 200; // ms per square
      const totalDuration = path.length * durationPerStep;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (elapsed >= totalDuration) {
          setDisplayPos(
            getPiecePosition(
              endPos,
              playerIdx,
              pieceIdx,
              boardSize,
              stackIndex,
              stackSize
            )
          );
          return;
        }

        // Determine which step we are in
        const progress = elapsed / totalDuration;
        const stepIndex = Math.floor(progress * path.length);
        const currentStepTarget = path[stepIndex];
        const prevStepTarget = stepIndex === 0 ? startPos : path[stepIndex - 1];

        // Interpolate between prevStep and currentStep
        const stepProgress = (elapsed % durationPerStep) / durationPerStep;

        const p1 = getPiecePosition(
          prevStepTarget,
          playerIdx,
          pieceIdx,
          boardSize
        );
        const p2 = getPiecePosition(
          currentStepTarget,
          playerIdx,
          pieceIdx,
          boardSize
        );

        setDisplayPos({
          x: p1.x + (p2.x - p1.x) * stepProgress,
          y: p1.y + (p2.y - p1.y) * stepProgress,
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Handle board resize or init, or stacking change
      setDisplayPos(
        getPiecePosition(
          piece.position,
          playerIdx,
          pieceIdx,
          boardSize,
          stackIndex,
          stackSize
        )
      );
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [piece.position, playerIdx, pieceIdx, boardSize, stackIndex, stackSize]);

  return (
    <g style={{ transition: "opacity 0.3s" }}>
      <circle
        cx={displayPos.x}
        cy={displayPos.y}
        r={pieceRadius}
        fill={`url(#grad-${playerIdx})`}
        filter="url(#dropShadow)"
        stroke={canMove ? "#ffffff" : "#000000"}
        strokeWidth={canMove ? 3 : 1}
        style={{
          cursor: canMove ? "pointer" : "default",
        }}
        onClick={onClick}
      />
      {/* Inner highlight */}
      <circle
        cx={displayPos.x - pieceRadius * 0.3}
        cy={displayPos.y - pieceRadius * 0.3}
        r={pieceRadius * 0.2}
        fill="rgba(255, 255, 255, 0.3)"
        style={{ pointerEvents: "none" }}
      />
      {piece.position === "finished" && (
        <text
          x={displayPos.x}
          y={displayPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#ffffff"
          fontSize={squareSize * 0.3}
          fontWeight="bold"
          style={{ pointerEvents: "none" }}
        >
          ✓
        </text>
      )}
    </g>
  );
};

const LudoView: GameClientModule["GameView"] = ({
  state: rawState,
  players,
  localPlayerId,
  lastMove,
  isMyTurn,
  onProposeMove,
}) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDiceValue, setDisplayDiceValue] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHistoryLength = useRef(0);
  const [isResizing, setIsResizing] = useState(false);

  // Dynamically calculate board size based on screen width with responsive updates
  const [boardSize, setBoardSize] = useState(() => {
    const screenWidth = window.innerWidth;
    // Account for padding/margins on different screen sizes
    if (screenWidth < 480) {
      // Very small mobile screens - use 80% of width, max 330px
      return Math.floor(Math.min(screenWidth * 0.8, 300));
    }
    if (screenWidth < 768) {
      // Small to medium screens (phones/small tablets) - use 85% of width, max 550px
      return Math.floor(Math.min(screenWidth * 0.85, 550));
    }
    if (screenWidth < 1024) {
      // Medium screens - fixed 600px
      return 600;
    }
    // Large screens - fixed 700px
    return 700;
  });

  // Track current breakpoint to only resize when crossing breakpoints
  const prevBreakpoint = useRef<string>('');
  
  const getBreakpoint = (width: number): string => {
    if (width < 480) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    return 'lg';
  };

  // Update board size on window resize (only when breakpoint changes)
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    // Initialize breakpoint
    prevBreakpoint.current = getBreakpoint(window.innerWidth);
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      
      resizeTimeout = setTimeout(() => {
        const screenWidth = window.innerWidth;
        const newBreakpoint = getBreakpoint(screenWidth);
        
        // Only update if breakpoint actually changed
        if (newBreakpoint !== prevBreakpoint.current) {
          setIsResizing(true);
          prevBreakpoint.current = newBreakpoint;
          
          if (screenWidth < 480) {
            setBoardSize(Math.floor(Math.min(screenWidth * 0.8, 300)));
          } else if (screenWidth < 768) {
            setBoardSize(Math.floor(Math.min(screenWidth * 0.85, 550)));
          } else if (screenWidth < 1024) {
            setBoardSize(600);
          } else {
            setBoardSize(700);
          }
          
          // Reset resizing state after a brief moment
          setTimeout(() => setIsResizing(false), 50);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const gameState = rawState as GameState;

  // Player index mapping
  const playerIndexMap = useMemo(() => {
    const map: Record<string, number> = {};
    players.forEach((player, idx) => {
      map[player.userId] = idx;
    });
    return map;
  }, [players]);

  const timing = gameState?.timing;
  const timeoutSeconds = timing?.timeout_seconds;
  const turnStartTime = timing?.turn_start_time;

  useEffect(() => {
    if (
      timing?.timeout_type === "per_turn" &&
      timeoutSeconds &&
      turnStartTime
    ) {
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

  // Dice rolling animation effect based on moves history
  useEffect(() => {
    const history = gameState?.moves_history || [];
    let animationInterval: NodeJS.Timeout | null = null;

    // Initialize ref on first render
    if (prevHistoryLength.current === 0 && history.length > 0) {
      prevHistoryLength.current = history.length;
      // If the last move was a roll, set the display value
      const lastMove = history[history.length - 1];
      if (
        lastMove.action === "roll_dice" &&
        typeof lastMove.dice_value === "number"
      ) {
        setDisplayDiceValue(lastMove.dice_value);
        // Clear the rolling state (set by handleRollDice)
        setIsRolling(false);
      }
      return;
    }

    if (history.length > prevHistoryLength.current) {
      const lastMove = history[history.length - 1];

      if (
        lastMove.action === "roll_dice" &&
        typeof lastMove.dice_value === "number"
      ) {
        const targetValue = lastMove.dice_value;

        // Start animation
        setIsRolling(true);

        let steps = 0;
        const maxSteps = 10; // Number of animation frames
        animationInterval = setInterval(() => {
          setDisplayDiceValue(Math.floor(Math.random() * 6) + 1);
          steps++;
          if (steps >= maxSteps) {
            if (animationInterval) clearInterval(animationInterval);
            setDisplayDiceValue(targetValue);
            setIsRolling(false);
          }
        }, 50); // 50ms per frame
      }

      prevHistoryLength.current = history.length;
    }

    // Cleanup function to clear interval on unmount or re-run
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [gameState?.moves_history]);

  const status = useMemo(() => {
    if (gameState?.winner_id) {
      const winner = players.find(
        (player) => String(player.userId) === String(gameState.winner_id)
      );
      const winnerIdx = playerIndexMap[gameState.winner_id];
      const winnerColor =
        PLAYER_COLOR_NAMES[winnerIdx as keyof typeof PLAYER_COLOR_NAMES];
      return `${winner?.nickname ?? "Unknown player"} (${winnerColor}) wins!`;
    }

    const currentPlayerId = String(gameState?.current_turn_player_id);
    const currentPlayer = players.find(
      (player) => String(player.userId) === currentPlayerId
    );
    const currentPlayerIdx = playerIndexMap[currentPlayerId];
    
    // Guard against undefined playerIdx
    if (currentPlayerIdx === undefined) {
      return isMyTurn ? "Your turn" : `${currentPlayer?.nickname ?? "Waiting..."}'s turn`;
    }
    
    const playerColor =
      PLAYER_COLOR_NAMES[currentPlayerIdx as keyof typeof PLAYER_COLOR_NAMES];

    if (isMyTurn) {
      return (
        <>
          Your turn{" "}
          <span
            style={{
              color: `#${PLAYER_COLORS[
                currentPlayerIdx as keyof typeof PLAYER_COLORS
              ].toString(16)}`,
            }}
          >
            ({playerColor})
          </span>
        </>
      );
    }

    return (
      <>
        {currentPlayer?.nickname ?? "Waiting..."}'s turn{" "}
        <span
          style={{
            color: `#${PLAYER_COLORS[
              currentPlayerIdx as keyof typeof PLAYER_COLORS
            ].toString(16)}`,
          }}
        >
          ({playerColor})
        </span>
      </>
    );
  }, [gameState, players, localPlayerId, isMyTurn, playerIndexMap]);

  const handleRollDice = () => {
    if (!isMyTurn || gameState.dice_rolled) return;
    setIsRolling(true); // Start animation immediately for feedback
    onProposeMove({ action: "roll_dice" });
  };

  const handlePieceClick = (pieceId: string) => {
    if (!isMyTurn || !gameState.dice_rolled || gameState.move_made) return;
    onProposeMove({ action: "move_piece", piece_id: pieceId });
    setSelectedPiece(null);
  };

  // Check if a piece can move with current dice roll
  const canPieceMove = (piece: Piece, diceRoll: number | null): boolean => {
    if (diceRoll === null) return false;

    // Piece in yard - needs 6 to enter
    if (piece.position === "yard") {
      return diceRoll === 6;
    }

    // Piece already finished
    if (piece.position === "finished") {
      return false;
    }

    // For simplicity, assume other pieces can move
    // The backend will validate the actual move
    return true;
  };

  const drawBoard = (g: PixiGraphics) => {
    g.clear();
    const squareSize = boardSize / 15;

    // Draw background (dark but not too dark)
    g.setFillStyle({ color: 0x2d2d2d });
    g.rect(0, 0, boardSize, boardSize);
    g.fill();

    // Draw 4 Yards (Colored 6x6 squares with reduced opacity)
    const yards = [
      { x: 0, y: 9, color: PLAYER_COLORS[0] }, // Red (Bottom-Left)
      { x: 0, y: 0, color: PLAYER_COLORS[1] }, // Green (Top-Left)
      { x: 9, y: 0, color: PLAYER_COLORS[2] }, // Yellow (Top-Right)
      { x: 9, y: 9, color: PLAYER_COLORS[3] }, // Blue (Bottom-Right)
    ];

    yards.forEach((yard) => {
      g.setFillStyle({ color: yard.color, alpha: 0.6 });
      g.rect(
        yard.x * squareSize,
        yard.y * squareSize,
        6 * squareSize,
        6 * squareSize
      );
      g.fill();

      // Inner dark box for pieces
      g.setFillStyle({ color: 0x2d2d2d });
      g.rect(
        (yard.x + 1) * squareSize,
        (yard.y + 1) * squareSize,
        4 * squareSize,
        4 * squareSize
      );
      g.fill();

      // Draw 4 parking spots (circles)
      const spotPositions = [
        { dx: 1.5, dy: 1.5 },
        { dx: 4.5, dy: 1.5 },
        { dx: 1.5, dy: 4.5 },
        { dx: 4.5, dy: 4.5 },
      ];

      g.setFillStyle({ color: yard.color, alpha: 0.7 });
      spotPositions.forEach((pos) => {
        g.circle(
          (yard.x + pos.dx) * squareSize,
          (yard.y + pos.dy) * squareSize,
          squareSize * 0.15 // Smaller spot (was 0.25)
        );
        g.fill();
      });
    });

    // Draw Track Squares
    for (let i = 0; i < BOARD_SQUARES; i++) {
      const pos = getSquarePosition(i, boardSize);
      const isSafe = SAFE_SQUARES.includes(i);

      let color = 0x3a3a3a; // Default lighter grey
      let alpha = 1;

      // Color safe squares / start squares
      if (i === 0) {
        color = PLAYER_COLORS[0];
        alpha = 0.7;
      } // Red Start
      else if (i === 13) {
        color = PLAYER_COLORS[1];
        alpha = 0.7;
      } // Green Start
      else if (i === 26) {
        color = PLAYER_COLORS[2];
        alpha = 0.7;
      } // Yellow Start
      else if (i === 39) {
        color = PLAYER_COLORS[3];
        alpha = 0.7;
      } // Blue Start
      else if (isSafe) {
        color = 0x4a4a4a;
        alpha = 1;
      } // Other safe squares lighter grey

      g.setFillStyle({ color, alpha });
      g.rect(pos.x, pos.y, squareSize, squareSize);
      g.fill();

      g.setStrokeStyle({ width: 1, color: 0xffffff, alpha: 0.12 });
      g.rect(pos.x, pos.y, squareSize, squareSize);
      g.stroke();
    }

    // Draw Home Paths
    for (let playerIdx = 0; playerIdx < 4; playerIdx++) {
      const color = PLAYER_COLORS[playerIdx as keyof typeof PLAYER_COLORS];
      for (let homeIdx = 0; homeIdx < HOME_PATH_LENGTH; homeIdx++) {
        const pos = getHomePosition(playerIdx, homeIdx, boardSize);
        g.setFillStyle({ color, alpha: 0.8 });
        g.rect(pos.x, pos.y, squareSize, squareSize);
        g.fill();
        g.setStrokeStyle({ width: 1, color: 0xffffff, alpha: 0.12 });
        g.rect(pos.x, pos.y, squareSize, squareSize);
        g.stroke();
      }
    }

    // Draw Center Triangle/Finish
    const centerStart = 6 * squareSize;
    const centerSize = 3 * squareSize;
    const centerX = boardSize / 2;
    const centerY = boardSize / 2;

    // Red (Bottom)
    g.setFillStyle({ color: PLAYER_COLORS[0], alpha: 0.8 });
    g.moveTo(centerStart, centerStart + centerSize); // Bottom-Left
    g.lineTo(centerStart + centerSize, centerStart + centerSize); // Bottom-Right
    g.lineTo(centerX, centerY); // Center
    g.closePath();
    g.fill();

    // Green (Left)
    g.setFillStyle({ color: PLAYER_COLORS[1], alpha: 0.8 });
    g.moveTo(centerStart, centerStart); // Top-Left
    g.lineTo(centerStart, centerStart + centerSize); // Bottom-Left
    g.lineTo(centerX, centerY); // Center
    g.closePath();
    g.fill();

    // Yellow (Top)
    g.setFillStyle({ color: PLAYER_COLORS[2], alpha: 0.8 });
    g.moveTo(centerStart, centerStart); // Top-Left
    g.lineTo(centerStart + centerSize, centerStart); // Top-Right
    g.lineTo(centerX, centerY); // Center
    g.closePath();
    g.fill();

    // Blue (Right)
    g.setFillStyle({ color: PLAYER_COLORS[3], alpha: 0.8 });
    g.moveTo(centerStart + centerSize, centerStart); // Top-Right
    g.lineTo(centerStart + centerSize, centerStart + centerSize); // Bottom-Right
    g.lineTo(centerX, centerY); // Center
    g.closePath();
    g.fill();

    // Draw Central "Home" Circle
    g.setFillStyle({ color: 0x2d2d2d });
    g.circle(centerX, centerY, squareSize * 0.8); // Big central spot
    g.fill();
    g.setStrokeStyle({ width: 2, color: 0xffffff, alpha: 0.25 });
    g.circle(centerX, centerY, squareSize * 0.8);
    g.stroke();
  };

  const renderPieces = () => {
    if (!gameState?.pieces) return null;

    const pieces: React.ReactElement[] = [];

    // First, count pieces at each position to handle stacking
    const positionCounts = new Map<
      string,
      Array<{ playerId: string; pieceIdx: number }>
    >();

    Object.entries(gameState.pieces).forEach(([playerId, playerPieces]) => {
      playerPieces.forEach((piece, pieceIdx) => {
        const position = piece.position;
        if (!positionCounts.has(position)) {
          positionCounts.set(position, []);
        }
        positionCounts.get(position)!.push({ playerId, pieceIdx });
      });
    });

    // Now render pieces with stack information
    Object.entries(gameState.pieces).forEach(([playerId, playerPieces]) => {
      const playerIdx = playerIndexMap[playerId];
      const color = PLAYER_COLORS[playerIdx as keyof typeof PLAYER_COLORS];

      playerPieces.forEach((piece, pieceIdx) => {
        const canMove =
          isMyTurn &&
          gameState.dice_rolled &&
          !gameState.move_made &&
          String(playerId) === localPlayerId &&
          canPieceMove(piece, gameState.current_dice_roll);

        // Calculate stack position
        const piecesAtPosition = positionCounts.get(piece.position) || [];
        const stackSize = piecesAtPosition.length;
        const stackIndex = piecesAtPosition.findIndex(
          (p) => p.playerId === playerId && p.pieceIdx === pieceIdx
        );

        pieces.push(
          <PieceComponent
            key={piece.id}
            piece={piece}
            playerIdx={playerIdx}
            pieceIdx={pieceIdx}
            boardSize={boardSize}
            color={color}
            canMove={canMove}
            onClick={() => canMove && handlePieceClick(piece.id)}
            stackIndex={stackIndex}
            stackSize={stackSize}
          />
        );
      });
    });

    return pieces;
  };

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

      {/* Dice Display */}
      <div className="flex flex-col items-center gap-4 min-h-[100px] justify-center">
        {/* Always show dice */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-gray-300 ${
              isRolling ? "animate-bounce" : ""
            }`}
          >
            {/* Dice Dots */}
            <div className="relative w-full h-full">
              {/* Center Dot (1, 3, 5) */}
              {[1, 3, 5].includes(displayDiceValue) && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full" />
              )}
              {/* Top Left (2, 3, 4, 5, 6) */}
              {[2, 3, 4, 5, 6].includes(displayDiceValue) && (
                <div className="absolute top-3 left-3 w-3 h-3 bg-black rounded-full" />
              )}
              {/* Bottom Right (2, 3, 4, 5, 6) */}
              {[2, 3, 4, 5, 6].includes(displayDiceValue) && (
                <div className="absolute bottom-3 right-3 w-3 h-3 bg-black rounded-full" />
              )}
              {/* Top Right (4, 5, 6) */}
              {[4, 5, 6].includes(displayDiceValue) && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-black rounded-full" />
              )}
              {/* Bottom Left (4, 5, 6) */}
              {[4, 5, 6].includes(displayDiceValue) && (
                <div className="absolute bottom-3 left-3 w-3 h-3 bg-black rounded-full" />
              )}
              {/* Middle Left (6) */}
              {displayDiceValue === 6 && (
                <div className="absolute top-1/2 left-3 transform -translate-y-1/2 w-3 h-3 bg-black rounded-full" />
              )}
              {/* Middle Right (6) */}
              {displayDiceValue === 6 && (
                <div className="absolute top-1/2 right-3 transform -translate-y-1/2 w-3 h-3 bg-black rounded-full" />
              )}
            </div>
          </div>
          {isRolling && (
            <span className="text-sm text-gray-400 animate-pulse">
              Rolling...
            </span>
          )}
        </div>

        {isMyTurn && !gameState?.dice_rolled && (
          <button
            onClick={handleRollDice}
            disabled={isRolling}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Roll Dice 🎲
          </button>
        )}

        {isMyTurn && gameState?.dice_rolled && !gameState?.move_made && (
          <div className="text-yellow-400 text-sm font-medium animate-pulse">
            Select a piece to move
          </div>
        )}
      </div>

      {/* Board */}
      <div 
        className="relative transition-all duration-300" 
        style={{ 
          width: boardSize, 
          height: boardSize,
          minWidth: boardSize,
          minHeight: boardSize
        }}
      >
        <div 
          className="absolute inset-0 transition-opacity duration-200"
          style={{ opacity: isResizing ? 0.3 : 1 }}
        >
          <Application key={boardSize} width={boardSize} height={boardSize} backgroundAlpha={0}>
            <pixiContainer>
              <pixiGraphics draw={drawBoard} />
            </pixiContainer>
          </Application>
        </div>

        {/* SVG overlay for pieces (easier to handle clicks) */}
        <svg
          className="absolute inset-0 pointer-events-auto"
          width={boardSize}
          height={boardSize}
          style={{ top: 0, left: 0 }}
        >
          <defs>
            <filter
              id="dropShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="1" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {Object.entries(PLAYER_COLORS).map(([idx, color]) => (
              <radialGradient
                key={idx}
                id={`grad-${idx}`}
                cx="30%"
                cy="30%"
                r="70%"
              >
                <stop
                  offset="0%"
                  stopColor={`#${color.toString(16).padStart(6, "0")}`}
                  stopOpacity="1"
                />
                <stop
                  offset="100%"
                  stopColor={`#${(color & 0x7f7f7f)
                    .toString(16)
                    .padStart(6, "0")}`}
                  stopOpacity="1"
                />
              </radialGradient>
            ))}
          </defs>
          {!isResizing && renderPieces()}
        </svg>
      </div>

      {/* Player Legend */}
      <div className="flex gap-4 flex-wrap justify-center">
        {players.map((player, idx) => {
          const playerIdx = playerIndexMap[player.userId];
          const color = PLAYER_COLORS[playerIdx as keyof typeof PLAYER_COLORS];
          const colorName =
            PLAYER_COLOR_NAMES[playerIdx as keyof typeof PLAYER_COLOR_NAMES];
          return (
            <div key={player.userId} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: `#${color.toString(16).padStart(6, "0")}`,
                }}
              />
              <span className="text-white text-sm">
                {player.nickname} ({colorName})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LudoModule: GameClientModule = {
  GameView: LudoView,
};

export default LudoModule;
