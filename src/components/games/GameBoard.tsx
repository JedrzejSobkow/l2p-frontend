import { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';

interface GameBoardProps {
  rows: number;
  cols: number;
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
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, cellSize: 0 });
  const [isPixiReady, setIsPixiReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;
      
      let { clientWidth, clientHeight } = containerRef.current;
      
      if (clientHeight === 0 && clientWidth > 0) {
         const ratio = rows / cols;
         clientHeight = clientWidth * ratio;
      }

      if (clientWidth === 0 || clientHeight === 0) return;

      const totalLineWidthX = (cols + 1) * lineWidth;
      const totalLineWidthY = (rows + 1) * lineWidth;

      const maxCellWidth = (clientWidth - totalLineWidthX) / cols;
      const maxCellHeight = (clientHeight - totalLineWidthY) / rows;

      const cellSize = Math.floor(Math.min(maxCellWidth, maxCellHeight));

      const boardWidth = cols * cellSize + totalLineWidthX;
      const boardHeight = rows * cellSize + totalLineWidthY;

      setDimensions({ width: boardWidth, height: boardHeight, cellSize });
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [rows, cols, lineWidth]);

  useEffect(() => {
    if (!canvasRef.current) return;

    let mounted = true;
    const app = new PIXI.Application();

    const initPixi = async () => {
      try {
        await app.init({
          width: 1, 
          height: 1,
          backgroundAlpha: 0,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });

        if (!mounted) {
          app.destroy(true, { children: true, texture: true });
          return;
        }

        if (canvasRef.current) canvasRef.current.appendChild(app.canvas);
        
        const container = new PIXI.Container();
        boardContainerRef.current = container;
        app.stage.addChild(container);
        appRef.current = app;
        
        setIsPixiReady(true);
      } catch (err) {
        console.error("PIXI Init Error:", err);
      }
    };

    initPixi();

    return () => {
      mounted = false;
      setIsPixiReady(false);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
        boardContainerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const app = appRef.current;
    const container = boardContainerRef.current;
    
    if (!app || !container || !isPixiReady || dimensions.width === 0) return;

    app.renderer.resize(dimensions.width, dimensions.height);
    container.removeChildren();
    
    const { width: boardWidth, height: boardHeight, cellSize } = dimensions;
    const graphics = new PIXI.Graphics();
    const offset = lineWidth / 2;

    graphics.roundRect(offset, offset, boardWidth - lineWidth, boardHeight - lineWidth, borderRadius);
    graphics.fill({ color: backgroundColor, alpha: backgroundAlpha });

    graphics.setStrokeStyle({ width: lineWidth, color: gridLineColor, alpha: gridLineAlpha });

    for (let r = 0; r <= rows; r++) {
      const y = r * (cellSize + lineWidth) + offset;
      graphics.moveTo(offset, y);
      graphics.lineTo(boardWidth - offset, y);
    }
    for (let c = 0; c <= cols; c++) {
      const x = c * (cellSize + lineWidth) + offset;
      graphics.moveTo(x, offset);
      graphics.lineTo(x, boardHeight - offset);
    }
    
    graphics.stroke();
    container.addChild(graphics);

    if (children) {
      children({ cellSize, boardWidth, boardHeight, container, lineWidth });
    }

  }, [isPixiReady, dimensions, rows, cols, children, lineWidth, borderRadius, gridLineColor, gridLineAlpha, backgroundColor, backgroundAlpha]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div 
        className="relative shadow-2xl rounded-3xl"
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          opacity: dimensions.width > 0 ? 1 : 0,
          transition: 'opacity 0.2s ease-in'
        }}
      >
        <div ref={canvasRef} className="block" />
        
        {(onCellClick || onCellHover || onCellLeave) && (
          <div
            className="absolute top-0 left-0 w-full h-full grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: `${lineWidth}px`,
              padding: `${lineWidth}px`,
              boxSizing: 'border-box'
            }}
            onMouseLeave={onCellLeave}
          >
            {Array.from({ length: rows * cols }).map((_, index) => {
              const row = Math.floor(index / cols);
              const col = index % cols;
              return (
                <div
                  key={`${row}-${col}`}
                  className="cursor-pointer transition-colors duration-150 rounded-md"
                  onClick={() => onCellClick?.(row, col)}
                  onMouseEnter={() => onCellHover?.(row, col)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};