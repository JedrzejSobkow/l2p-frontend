// import TicTacToeModule from '../games/ticTacToe/module';
// import GameShell from '../games/GameShell';
// import ClobberModule from './clobber/module';
// import { useState } from 'react';

// const demoState = {
//   // prosty snapshot – pusta plansza i tura gracza X
//   board: Array(9).fill(null),
//   nextPlayerId: 'player-1'
// };

// const demoPlayers = [
//   { userId: 'player-1', nickname: 'Alice' },
//   { userId: 'player-2', nickname: 'Bob' }
// ];

// export default function Demo() {
//   const [state, setState] = useState(demoState);

//   const handleClick = (move: unknown) => {
//     // prosta logika ruchu dla demo
//     if (!('position' in (move as any))) return;
//     if (state.board[move.position] === null) {
//       const newBoard = state.board.slice();
//       console.log(move);
//       newBoard[move.position] = state.nextPlayerId === 'player-1' ? 'X' : 'O';
//       setState({
//         board: newBoard,
//         nextPlayerId: state.nextPlayerId === 'player-1' ? 'player-2' : 'player-1'
//       });
//     }
//   }
//   return (
//     <div className="p-6">
//       <GameShell
//         module={TicTacToeModule}
//         state={state}
//         players={demoPlayers}
//         localPlayerId="player-1"
//         isMyTurn={true}
//         onProposeMove={handleClick}
//       />
//     </div>
//   );
// }
