import React, { useState } from 'react';
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa';
import LeaderboardCard from '../components/LeaderboardCard';
import GameRecommendationWithImages from '../components/GameRecommendationWithImages';
import SearchBar from '../components/SearchBar';
import GameLobbyCard from '../components/GameLobbyCard';
import {
  ticTacToeImage,
  clobberImage,
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
} from '@assets/images';

const HomeScreen: React.FC = () => {
  const leaderboardData = [
    { place: 1, pfp_path: avatar1, name: 'PlayerOne', rating: 1500 },
    { place: 2, pfp_path: avatar2, name: 'PlayerTwo', rating: 1400 },
    { place: 3, pfp_path: avatar3, name: 'cool_usersdfsfsdfsdf', rating: 1300 },
    { place: 4, pfp_path: avatar4, name: 'Cipicipi', rating: 1200 },
    { place: 5, pfp_path: avatar4, name: 'cidsof', rating: 1150 },
  ];

  const topPlayers = leaderboardData.slice(0, 5);

  const topPicksImages = [
    { src: ticTacToeImage, alt: 'Tic Tac Toe', gameName: 'tic-tac-toe' },
    { src: clobberImage, alt: 'Clobber', gameName: 'clobber' },
  ];

  const featuredGamesImages = [
    { src: clobberImage, alt: 'Clobber', gameName: 'clobber' },
  ];

  const paginatedLobbies = [
    {
      page: 1,
      lobbies: [
        {
          gameName: 'Tic Tac Toe',
          lobbyName: 'Beginner Lobby',
          gameImage: ticTacToeImage,
          players: [
            { username: 'PlayerOne', avatar: avatar1 },
            { username: 'PlayerTwo', avatar: avatar2 },
          ],
          maxPlayers: 5,
          duration: '5-10 mins',
        },
        {
          gameName: 'Clobber',
          lobbyName: 'Advanced Lobby',
          gameImage: clobberImage,
          players: [
            { username: 'PlayerThree', avatar: avatar3 },
          ],
          maxPlayers: 2,
          duration: '10-15 mins',
        },
        {
          gameName: 'Chess',
          lobbyName: 'Strategy Lobby',
          gameImage: clobberImage,
          players: [
            { username: 'PlayerFour', avatar: avatar4 },
          ],
          maxPlayers: 4,
          duration: '15-20 mins',
        },
      ],
    },
    {
      page: 2,
      lobbies: [
        {
          gameName: 'Checkers',
          lobbyName: 'Casual Checkers',
          gameImage: clobberImage,
          players: [
            { username: 'PlayerFive', avatar: avatar5 },
          ],
          maxPlayers: 3,
          duration: '10-15 mins',
        },
        {
          gameName: 'Sudoku',
          lobbyName: 'Puzzle Masters',
          gameImage: clobberImage,
          players: [
            { username: 'PlayerSix', avatar: avatar6 },
          ],
          maxPlayers: 6,
          duration: '20-30 mins',
        },
        {
          gameName: 'Minesweeper',
          lobbyName: 'Mine Hunters',
          gameImage: clobberImage,
          players: [
            { username: 'PlayerSeven', avatar: avatar7 },
          ],
          maxPlayers: 4,
          duration: '10-15 mins',
        },
      ],
    },
    {
      page: 3,
      lobbies: [
        {
          gameName: 'Tic Tac Toe',
          lobbyName: 'Pro Lobby',
          gameImage: ticTacToeImage,
          players: [
            { username: 'PlayerEight', avatar: avatar8 },
          ],
          maxPlayers: 2,
          duration: '5-10 mins',
        },
        {
          gameName: 'Clobber',
          lobbyName: 'Clobber Champs',
          gameImage: clobberImage,
          players: [
            { username: 'PlayerNine', avatar: avatar9 },
          ],
          maxPlayers: 6,
          duration: '15-20 mins',
        },
      ],
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);

  const handleNextPage = () => {
    if (currentPage < paginatedLobbies.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentLobbies = paginatedLobbies.find((page) => page.page === currentPage)?.lobbies || [];

  return (
    <main className="flex flex-col gap-8 px-10 lg:px-20 py-5 bg-background h-full">
      {/* Search Bar */}
      <div className="flex justify-center">
        <SearchBar
          size="normal"
          placeholder="Search for games..."
          suggestions={[
            { text: 'Tic Tac Toe', image: ticTacToeImage },
            { text: 'Clobber', image: clobberImage },
            { text: 'Chess', image: clobberImage },
            { text: 'Checkers', image: clobberImage },
            { text: 'Sudoku', image: clobberImage },
            { text: 'Minesweeper', image: clobberImage },
          ]}
          onEnterRoute="/find_games"
          onSuggestionClickRoute="/game"
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
        </div>
        {currentLobbies.map((lobby, index) => (
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
        <div className="flex justify-center items-center gap-6 mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="text-highlight disabled:opacity-50"
          >
            <FaAngleLeft size={30} />
          </button>
          <span className="text-lg font-bold text-headline">
            Page {currentPage} of {paginatedLobbies.length}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === paginatedLobbies.length}
            className="text-highlight disabled:opacity-50"
          >
            <FaAngleRight size={30} />
          </button>
        </div>
      </div>
    </main>
  );
};

export default HomeScreen;
