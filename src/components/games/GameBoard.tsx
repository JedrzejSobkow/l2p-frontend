import { useRef, useEffect, useState, type ReactNode } from 'react';
import * as PIXI from 'pixi.js';

interface GameBoardProps {
  rows: number;
  cols: number;
  containerWidth?: number;
  borderRadius?: number;
  lineWidth?: number;
  gridLineColor?: number;
  gridLineAlpha?: number;
  backgroundColor?: number;
  backgroundAlpha?: number;
  children?: (params: {
    cellSize: number;
    boardWidth: number;
    boardHeight: number;
    container: PIXI.Container;
    lineWidth: number;
  }) => void;
  onCellClick?: (row: number, col: number) => void;
  onCellHover?: (row: number, col: number) => void;
  onCellLeave?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  rows,
  cols,
  containerWidth = 0,
  borderRadius = 24,
  lineWidth = 2,
  gridLineColor = 0xffffff,
  gridLineAlpha = 0.12,
  backgroundColor = 0x000000,
  backgroundAlpha = 0,
  children,
  onCellClick,
  onCellHover,
  onCellLeave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const boardContainerRef = useRef<PIXI.Container | null>(null);
  const [isPixiReady, setIsPixiReady] = useState(false);

  const { boardWidth, boardHeight, cellSize } = (() => {
    // Calculate based on 85% of viewport height
    const maxHeight = window.innerHeight * 0.80;
    const availableWidth = containerWidth * 0.80;
    
    // Calculate cell size based on both constraints
    const cellSizeByHeight = (maxHeight - (rows + 1) * lineWidth) / rows;
    const cellSizeByWidth = (availableWidth - (cols + 1) * lineWidth) / cols;
    
    // Use the smaller one to ensure board fits in both dimensions
    const calculatedCellSize = Math.min(cellSizeByHeight, cellSizeByWidth);
    
    const calculatedBoardWidth = cols * calculatedCellSize + (lineWidth * (cols + 1));
    const calculatedBoardHeight = rows * calculatedCellSize + (lineWidth * (rows + 1));

    return {
      boardWidth: calculatedBoardWidth,
      boardHeight: calculatedBoardHeight,
      cellSize: calculatedCellSize,
    };
  })();

  // Initialize Pixi Application
  useEffect(() => {
    if (!canvasRef.current || boardWidth === 0 || boardHeight === 0) return;

    let mounted = true;
    let app: PIXI.Application | null = null;
    setIsPixiReady(false);

    (async () => {
      try {
        app = new PIXI.Application();
        await app.init({
          width: boardWidth,
          height: boardHeight,
          backgroundAlpha: 0,
          antialias: true,
        });

        if (!mounted || !canvasRef.current) {
          if (app) {
            await app.destroy(true, { children: true, texture: true });
          }
          return;
        }

        canvasRef.current.innerHTML = '';
        canvasRef.current.appendChild(app.canvas);

        appRef.current = app;
        boardContainerRef.current = new PIXI.Container();
        app.stage.addChild(boardContainerRef.current);
        setIsPixiReady(true);
      } catch (error) {
        console.error('Failed to initialize PIXI application:', error);
        if (app) {
          try {
            await app.destroy(true, { children: true, texture: true });
          } catch (e) {
            console.error('Error destroying PIXI app:', e);
          }
        }
      }
    })();

    return () => {
      mounted = false;
      setIsPixiReady(false);
      
      if (appRef.current) {
        const currentApp = appRef.current;
        appRef.current = null;
        boardContainerRef.current = null;
        
        // Destroy asynchronously to avoid issues
        setTimeout(() => {
          try {
            currentApp.destroy(true, { children: true, texture: true });
          } catch (e) {
            console.error('Error destroying PIXI app on cleanup:', e);
          }
        }, 0);
      }
    };
  }, [boardWidth, boardHeight]);

  // Draw board grid
  useEffect(() => {
    if (!isPixiReady || !boardContainerRef.current || boardWidth === 0) return;

    const container = boardContainerRef.current;
    container.removeChildren();

    // Draw board background and grid
    const boardGraphics = new PIXI.Graphics();
    
    // Offset by half line width to ensure equal border thickness
    const offset = lineWidth / 2;
    
    // Background
    boardGraphics.roundRect(offset, offset, boardWidth - lineWidth, boardHeight - lineWidth, borderRadius);
    boardGraphics.fill({ color: backgroundColor, alpha: backgroundAlpha });

    // Grid lines
    boardGraphics.setStrokeStyle({ width: lineWidth, color: gridLineColor, alpha: gridLineAlpha });
    for (let r = 0; r <= rows; r++) {
      const y = r * (cellSize + lineWidth) + offset;
      boardGraphics.moveTo(offset, y);
      boardGraphics.lineTo(cols * (cellSize + lineWidth) + offset, y);
    }
    for (let c = 0; c <= cols; c++) {
      const x = c * (cellSize + lineWidth) + offset;
      boardGraphics.moveTo(x, offset);
      boardGraphics.lineTo(x, rows * (cellSize + lineWidth) + offset);
    }
    boardGraphics.stroke();
    container.addChild(boardGraphics);

    // Call children render function if provided
    if (children) {
      children({ cellSize, boardWidth, boardHeight, container, lineWidth });
    }
  }, [isPixiReady, boardWidth, boardHeight, cellSize, rows, cols, children, lineWidth, borderRadius, gridLineColor, gridLineAlpha, backgroundColor, backgroundAlpha]);

  return (
    <div ref={containerRef} className="flex flex-col items-center w-full">
      {containerWidth > 0 && boardWidth > 0 && (
        <div className="relative" style={{ width: boardWidth, height: boardHeight }}>
          <div ref={canvasRef} />
          {/* Interactive overlay for clicks */}
          {(onCellClick || onCellHover || onCellLeave) && (
            <div
              className="absolute top-0 left-0 grid"
              style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                width: `${boardWidth}px`,
                height: `${boardHeight}px`,
              }}
            >
              {Array.from({ length: rows * cols }).map((_, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                return (
                  <button
                    key={`${row}-${col}`}
                    type="button"
                    onClick={() => onCellClick?.(row, col)}
                    onMouseEnter={() => onCellHover?.(row, col)}
                    onMouseLeave={() => onCellLeave?.()}
                    className="w-full h-full bg-transparent"
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
