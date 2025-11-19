import type React from "react";

export interface GameClientModule {
    GameView: React.FC<{
        state: unknown;
        players: Array<{userId: string; nickname: string}>;
        localPlayerId: string;
        lastMove?: unknown;
        isMyTurn: boolean;
        onProposeMove: (move: unknown) => void;
    }>
    validateLocalMove?: (
        state: unknown,
        move: unknown,
        playerId: string
    ) => boolean
}