import { useMemo, useState, useEffect } from "react";
import type { GameClientModule } from "../GameClientModule";
import { FaUser, FaClock } from "react-icons/fa";

type Point = { x: number; y: number };
type LineEntry = { from: Point; to: Point; player_id?: number | string };

const PLAYER_COLORS = ["#22d3ee", "#fb923c"];
const LINE_WIDTH = 0.08;
const BALL_RADIUS = 0.2;
const NODE_RADIUS = 0.08;

const pointKey = (p: Point) => `${p.x},${p.y}`;

const useRemainingTime = (gameState: any, playerId: string) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const timing = gameState?.timing;
    if (timing?.timeout_type === "per_turn" && timing?.turn_start_time && String(gameState.current_turn_identifier) === String(playerId)) {
      const calculate = () => {
        const start = new Date(timing.turn_start_time).getTime();
        const elapsed = (Date.now() - start) / 1000;
        setTimeLeft(Math.max(0, timing.timeout_seconds - elapsed));
      };
      calculate();
      const interval = setInterval(calculate, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [gameState, playerId]);

  return timeLeft;
};

const SoccerView: GameClientModule["GameView"] = ({
  state: rawState,
  players,
  isMyTurn,
  onProposeMove,
  localPlayerId
}) => {
  const gameState = useMemo(() => (rawState ?? {}) as any, [rawState]);
  const field = gameState.field ?? {};

  const w = Number(field.width) || 9;
  const h = Number(field.height) || 13;
  const goalW = Number(field.goal_width) || 3;
  const goalXStart = Number(field.goal_x_start ?? Math.floor((w - goalW) / 2));
  const goalXEnd = Number(field.goal_x_end ?? goalXStart + goalW - 1);

  const logicalBottomPlayer = players.find(p => p.userId === gameState.field.bottom_goal_defender);
  const logicalTopPlayer = players.find(p => p.userId === gameState.field.top_goal_defender);

  let visualBottomPlayer = logicalBottomPlayer;
  let visualTopPlayer = logicalTopPlayer;

  const shouldFlip = logicalBottomPlayer?.userId !== localPlayerId;
  if (shouldFlip) {
    visualBottomPlayer = logicalTopPlayer;
    visualTopPlayer = logicalBottomPlayer;
  }

  const isVisualBottomLocal = visualBottomPlayer?.userId === localPlayerId;
  const isVisualTopLocal = visualTopPlayer?.userId === localPlayerId;

  const viewPoint = (p: Point): Point => {
    if (!shouldFlip) return p;
    return { x: w - 1 - p.x, y: h - 1 - p.y };
  };

  const logicPoint = (p: Point): Point => {
    if (!shouldFlip) return p;
    return { x: w - 1 - p.x, y: h - 1 - p.y };
  };

  const rawBallPos = gameState.ball_position ?? { x: Math.floor(w / 2), y: Math.floor(h / 2) };
  const ballPos = viewPoint(rawBallPos);

  const lines: LineEntry[] = useMemo(() => {
    const rawLines = Array.isArray(gameState.lines) ? gameState.lines : [];
    return rawLines.map((l: any) => ({
      ...l,
      from: viewPoint(l.from),
      to: viewPoint(l.to)
    }));
  }, [gameState?.lines, shouldFlip]);

  const availableMoves: Point[] = useMemo(() => {
    const rawMoves = Array.isArray(gameState.available_moves) ? gameState.available_moves : [];
    return rawMoves.map((m: any) => viewPoint(m));
  }, [gameState?.available_moves, shouldFlip]);

  const rawLastMove = gameState.last_move;
  const lastMove = rawLastMove ? {
      from: viewPoint(rawLastMove.from),
      to: viewPoint(rawLastMove.to)
  } : null;

  const playerColors = useMemo(() => {
    const map: Record<string, string> = {};
    players.forEach((p, idx) => {
      map[String(p.userId)] = PLAYER_COLORS[idx % PLAYER_COLORS.length];
    });
    return map;
  }, [players]);

  const availableMoveSet = useMemo(() => {
    const set = new Set<string>();
    availableMoves.forEach((m) => set.add(pointKey({ x: m.x, y: m.y })));
    return set;
  }, [availableMoves]);

  const padding = 0;
  const minX = -padding;
  const maxX = w - 1 + padding;
  const minY = -1 - padding / 2;
  const maxY = h + padding / 2;
  const widthView = maxX - minX;
  const heightView = maxY - minY;

  const matchPoints = (a?: Point, b?: Point) => a && b && a.x === b.x && a.y === b.y;
  const isLastLine = (line: LineEntry) => {
    if (!lastMove) return false;
    return (
      (matchPoints(line.from, lastMove.from) && matchPoints(line.to, lastMove.to)) ||
      (matchPoints(line.from, lastMove.to) && matchPoints(line.to, lastMove.from))
    );
  };

  const handleMove = (targetOnScreen: Point) => {
    if (!isMyTurn) return;
    if (!availableMoveSet.has(pointKey(targetOnScreen))) return;
    const logicTarget = logicPoint(targetOnScreen);
    onProposeMove({ to_x: logicTarget.x, to_y: logicTarget.y });
  };



  const bottomTime = useRemainingTime(gameState, visualBottomPlayer?.userId || '');
  const topTime = useRemainingTime(gameState, visualTopPlayer?.userId || '');

  const PlayerBadge = ({ player, isLocal, timeLeft }: any) => {
      if (!player) return null;
      const isTurn = timeLeft !== null;
      const isCriticalTime = isTurn && timeLeft < 10;

      return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 z-10 ${isTurn ? 'bg-background/90 border-orange-500/50 scale-105 shadow-orange-500/20' : 'bg-background/60 border-white/10 opacity-80'}`}>
           <div className="flex items-center gap-2">
              <FaUser className={isLocal ? "text-orange-400" : "text-white/40"} size={14} />
              <span className={`text-sm font-bold ${isLocal ? 'text-white' : 'text-white/70'}`}>
                {isLocal ? 'You' : player.nickname}
              </span>
           </div>
           {isTurn && (
             <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                <FaClock className={isCriticalTime ? "text-red-500 animate-pulse" : "text-white/60"} size={12} />
                <span className={`font-mono text-sm font-bold ${isCriticalTime ? "text-red-400" : "text-white"}`}>{Math.floor(timeLeft)}s</span>
             </div>
           )}
        </div>
      );
  };

  return (
    <div className="relative h-full w-full bg-green-800 flex flex-col items-center justify-center p-2 gap-1">
      
      {/* 1. TOP PLAYER BADGE */}
      <PlayerBadge 
        player={visualTopPlayer} 
        isLocal={isVisualTopLocal} 
        timeLeft={topTime} 
      />

      {/* 2. PITCH (SVG) */}
      <div className="relative w-full max-h-[70vh] aspect-[9/13] shrink-0"> 
        <svg viewBox={`${minX} ${minY} ${widthView} ${heightView}`} preserveAspectRatio="xMidYMid meet" className="w-full h-full drop-shadow-2xl">
          <defs>
             <filter id="glow"><feGaussianBlur stdDeviation="0.1" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          {/* GRID */}
          <g stroke="rgba(255,255,255,0.06)" strokeWidth={LINE_WIDTH / 2}>
            {Array.from({ length: w }).map((_, i) => (
              <line key={`v${i}`} x1={i} y1={0} x2={i} y2={h - 1} />
            ))}
            {Array.from({ length: h }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i} x2={w - 1} y2={i} />
            ))}
          </g>

          {/* BORDERS */}
          <g stroke="rgba(255,255,255,0.7)" strokeWidth={LINE_WIDTH} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={`${goalXStart},0 0,0 0,${h-1} ${goalXStart},${h-1}`} />
              <polyline points={`${goalXEnd},0 ${w-1},0 ${w-1},${h-1} ${goalXEnd},${h-1}`} />
              <polyline points={`${goalXStart},0 ${goalXStart},-1 ${goalXEnd},-1 ${goalXEnd},0`} />
              <polyline points={`${goalXStart},${h-1} ${goalXStart},${h} ${goalXEnd},${h} ${goalXEnd},${h-1}`} />
          </g>

          {/* LINES */}
          <g strokeLinecap="round">
            {lines.map((line, idx) => {
              const isLast = isLastLine(line);
              return (
                <line key={idx} x1={line.from.x} y1={line.from.y} x2={line.to.x} y2={line.to.y} 
                      stroke={playerColors[String(line.player_id)] ?? "#cbd5e1"}
                      strokeWidth={isLast ? LINE_WIDTH * 1.5 : LINE_WIDTH}
                      opacity={isLast ? 1 : 0.8} />
              );
            })}
          </g>

          {/* NODES */}
          <g>
             {Array.from({ length: h * w }).map((_, i) => {
               const x = i % w;
               const y = Math.floor(i / w);
               return <circle key={`n${i}`} cx={x} cy={y} r={0.03} fill="rgba(255,255,255,0.5)" />
             })}
          </g>

          {/* INTERACTIVE */}
          {availableMoves.map((move) => (
            <circle
              key={`move-${pointKey(move)}`}
              cx={move.x} cy={move.y}
              r={NODE_RADIUS * 1.5}
              fill={isMyTurn ? "rgba(255,255,255,0.2)" : "transparent"}
              stroke={isMyTurn ? "white" : "transparent"}
              strokeWidth={LINE_WIDTH / 2}
              className={isMyTurn ? "cursor-pointer hover:fill-white hover:opacity-100 transition-all" : ""}
              onClick={() => handleMove(move)}
            />
          ))}

          {/* BALL */}
          <circle cx={ballPos.x} cy={ballPos.y} r={BALL_RADIUS} fill="white" stroke="#111" strokeWidth={0.04} />
        </svg>
      </div>

      {/* 3. BOTTOM PLAYER BADGE */}
      <PlayerBadge 
        player={visualBottomPlayer} 
        isLocal={isVisualBottomLocal} 
        timeLeft={bottomTime} 
      />
    </div>
  );
};

export default {
  GameView: SoccerView,
} as GameClientModule;