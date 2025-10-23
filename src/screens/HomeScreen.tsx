import React from 'react';
import LeaderboardCard from '../components/LeaderboardCard';
import GameRecommendationWithImages from '../components/GameRecommendationWithImages';
import SearchBar from '../components/SearchBar';
import GameLobbyCard from '../components/GameLobbyCard';

const HomeScreen: React.FC = () => {
  const leaderboardData = [
    { place: 1, pfp_path: '/src/assets/images/avatar/1.png', name: 'PlayerOne', rating: 1500 },
    { place: 2, pfp_path: '/src/assets/images/avatar/2.png', name: 'PlayerTwo', rating: 1400 },
    { place: 3, pfp_path: '/src/assets/images/avatar/3.png', name: 'cool_usersdfsfsdfsdf', rating: 1300 },
    { place: 4, pfp_path: '/src/assets/images/avatar/4.png', name: 'Cipicipi', rating: 1200 },
    { place: 5, pfp_path: '/src/assets/images/avatar/4.png', name: 'cidsof', rating: 1150 },
  ];

  const topPlayers = leaderboardData.slice(0, 5);

  const topPicksImages = [
    { src: '/src/assets/images/tic-tac-toe.png', alt: 'Tic Tac Toe', gameName: 'tic-tac-toe' },
    { src: '/src/assets/images/clobber.png', alt: 'Clobber', gameName: 'clobber' },
  ];

  const featuredGamesImages = [
    { src: '/src/assets/images/clobber.png', alt: 'Clobber', gameName: 'clobber' },
  ];

  const gameLobbies = [
    {
      gameName: 'Tic Tac Toe',
      lobbyName: 'Beginner Lobby',
      gameImage: '/src/assets/images/tic-tac-toe.png',
      players: [
        { username: 'PlayerOne', avatar: '/src/assets/images/avatar/1.png' },
        { username: 'PlayerTwo', avatar: '/src/assets/images/avatar/2.png' },
        { username: 'PlayerThree', avatar: '/src/assets/images/avatar/2.png' },
        { username: 'cool_usersdfsfsdfsdf', avatar: '/src/assets/images/avatar/2.png' },
      ],
      maxPlayers: 5,
      duration: '5-10 mins',
    },
    {
      gameName: 'Clobber',
      lobbyName: 'Advanced Lobby',
      gameImage: '/src/assets/images/clobber.png',
      players: [
        { username: 'PlayerThree', avatar: '/src/assets/images/avatar/3.png' },
      ],
      maxPlayers: 2,
      duration: '10-15 mins',
    },
    {
      gameName: 'Clobber',
      lobbyName: 'Expert Lobby',
      gameImage: '/src/assets/images/clobber.png',
      players: [
        { username: 'PlayerFour', avatar: '/src/assets/images/avatar/4.png' },
      ],
      maxPlayers: 6,
      duration: '15-20 mins',
    },
    {
      gameName: 'Tic Tac Toe',
      lobbyName: 'Casual Lobby',
      gameImage: '/src/assets/images/tic-tac-toe.png',
      players: [
        { username: 'PlayerFive', avatar: '/src/assets/images/avatar/5.png' },
      ],
      maxPlayers: 3,
      duration: '10-15 mins',
    },
  ];

  return (
    <main className="flex flex-col gap-8 px-10 lg:px-20 py-5 bg-background h-full">
      {/* Search Bar */}
      <div className="flex justify-center">
        <SearchBar
          size="normal"
          placeholder="Search for games or players..."
          suggestions={['Tic Tac Toe', 'Clobber', 'Chess', 'Checkers', 'Sudoku', 'Minesweeper']}
          onEnterRoute="/find_games"
          onSuggestionClickRoute="/find_lobbies/game"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Left Column: Top Picks and Featured Games */}
        <div className="w-full md:w-[70%] flex flex-col gap-8">
          <GameRecommendationWithImages title="Top picks for you" images={topPicksImages} />
          <GameRecommendationWithImages title="Featured games" images={featuredGamesImages} />
        </div>

        {/* Right Column: Leaderboard */}
        <div className="flex flex-col gap-4 w-full md:w-[30%] min-w-[300px]">
          <h2 className="text-2xl font-bold text-headline mb-4">Top rated players</h2>
          {topPlayers.map((player) => (
            <LeaderboardCard
              key={player.place}
              place={player.place}
              pfp_path={player.pfp_path}
              name={player.name}
              rating={player.rating}
            />
          ))}
        </div>
      </div>

      {/* Game Lobbies Section */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-headline">Active lobbies</h2>
          <div className="w-64">
            <SearchBar
              size="small"
              placeholder="Search lobbies..."
              suggestions={['Beginner Lobby', 'Advanced Lobby', 'Expert Lobby', 'Casual Lobby']}
              onEnterRoute="/find_lobbies/phrase"
              onSuggestionClickRoute="/find_lobbies/phrase"
            />
          </div>
        </div>
        {gameLobbies.map((lobby, index) => (
          <GameLobbyCard
            key={index}
            gameName={lobby.gameName}
            lobbyName={lobby.lobbyName}
            gameImage={lobby.gameImage}
            players={lobby.players}
            maxPlayers={lobby.maxPlayers}
            duration={lobby.duration}
          />
        ))}
      </div>
    </main>
  );
};

export default HomeScreen;
