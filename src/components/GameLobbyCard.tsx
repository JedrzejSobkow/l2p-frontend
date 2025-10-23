import React from 'react';

interface GameLobbyCardProps {
  gameName: string;
  lobbyName: string;
  gameImage: string;
  players: { username: string; avatar: string }[];
  maxPlayers: number;
  duration: string;
}

const GameLobbyCard: React.FC<GameLobbyCardProps> = ({ gameName, lobbyName, gameImage, players, maxPlayers, duration }) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 p-4 rounded-lg bg-background-secondary shadow-md">
      {/* Game Image and Game Name */}
      <div className="w-32 flex-shrink-0 flex flex-col items-center">
        <img src={gameImage} alt={gameName} className="w-full h-full rounded-lg object-cover" />
        <span className="text-sm font-medium text-headline mt-2 text-center">{gameName}</span>
      </div>

      {/* Game Info */}
      <div className="flex flex-col w-[200px]">
        <h2 className="text-xl font-bold text-headline">{lobbyName}</h2>
        <button className="mt-2 px-3 py-1 bg-highlight text-white text-sm font-bold rounded-md hover:bg-highlight/90 transition-all">
          Join
        </button>
        <div className="text-paragraph text-sm mt-2">
          <div className="flex items-center gap-2">
            <img src="/src/assets/icons/user.png" alt="Players Icon" className="w-4 h-4" />
            <span>{players.length}/{maxPlayers} players</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <img src="/src/assets/icons/clock.png" alt="Clock Icon" className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>
      </div>

      {/* Player Slots */}
      <div className="flex justify-center w-full">
        <div
          className={`grid gap-4 ${
            maxPlayers === 1
              ? 'grid-cols-1'
              : maxPlayers === 2
              ? 'grid-cols-2'
              : maxPlayers === 3
              ? 'grid-cols-2 sm:grid-cols-3'
              : maxPlayers === 4
              ? 'grid-cols-2'
              : maxPlayers === 5
              ? 'grid-cols-2 sm:grid-cols-3 sm:grid-rows-2'
              : maxPlayers === 6
              ? 'grid-cols-2 sm:grid-cols-3'
              : ''
          }`}
        >
          {Array.from({ length: maxPlayers }).map((_, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 border rounded-lg ${
                players[index] ? 'border-gray-300' : 'border-headline'
              }`}
            >
              {players[index] ? (
                <>
                  <img
                    src={players[index].avatar}
                    alt={players[index].username}
                    className="w-10 h-10 rounded-full"
                  />
                  <span
                    className="text-sm text-headline break-words"
                    style={{
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-all',
                    }}
                  >
                    {players[index].username}
                  </span>
                </>
              ) : (
                <>
                <div className='h-10 content-center'>
                  <img
                    src="/src/assets/icons/add-player.png"
                    alt="Add Player"
                    className="w-7 cursor-pointer"
                  />
                  </div>
                  <span
                    className="text-sm text-highlight break-words"
                    style={{
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                  >
                    Press empty player slot to join!
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameLobbyCard;
