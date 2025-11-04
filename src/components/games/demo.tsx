import TicTacToeModule from '../games/ticTacToe/module';
import GameShell from '../games/GameShell';

const demoState = {
  // prosty snapshot – pusta plansza i tura gracza X
  board: Array(9).fill(null),
  nextPlayerId: 'player-1'
};

const demoPlayers = [
  { userId: 'player-1', nickname: 'Alice' },
  { userId: 'player-2', nickname: 'Bob' }
];

export default function Demo() {
  return (
    <div className="p-6">
      <GameShell
        module={TicTacToeModule}
        state={demoState}
        players={demoPlayers}
        localPlayerId="player-1"
        isMyTurn={true}
        onProposeMove={(move) => console.log('Clicked cell:', move)}
      />
    </div>
  );
}
